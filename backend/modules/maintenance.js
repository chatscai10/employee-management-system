/**
 * 維修管理模組 - 處理設備維修申請和管理
 */

const MaintenanceModule = {
  
  /**
   * 提交維修申請
   */
  submitMaintenanceRequest(data) {
    try {
      // 清理和驗證輸入數據
      const sanitizedData = ValidationUtils.sanitizeObject(data);
      const validation = ValidationUtils.validateMaintenanceData(sanitizedData);
      
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors
        };
      }
      
      const lock = LockService.getScriptLock();
      lock.waitLock(30000);
      
      try {
        // 生成維修單編號
        const requestId = DatabaseUtils.generateId('MAINT');
        
        // 獲取員工資訊
        const employee = EmployeeModule.getEmployeeById(sanitizedData.employeeId);
        if (!employee) {
          return {
            success: false,
            errors: ['找不到員工資訊']
          };
        }
        
        // 估算處理時間
        const estimatedCompletion = this.calculateEstimatedCompletion(sanitizedData.urgency);
        
        // 準備維修數據
        const maintenanceData = [
          requestId,
          sanitizedData.employeeId,
          employee.name,
          sanitizedData.storeName,
          sanitizedData.equipmentName,
          sanitizedData.equipmentLocation || '',
          sanitizedData.description,
          sanitizedData.urgency,
          '待處理',
          new Date().toISOString(), // 報修時間
          '', // 受理時間
          '', // 完成時間
          '', // 維修人員
          estimatedCompletion, // 預計完成時間
          '', // 維修結果
          sanitizedData.photoPath || '',
          sanitizedData.contactPhone || employee.phone,
          0, // 維修費用
          sanitizedData.notes || ''
        ];
        
        // 寫入維修記錄表
        const sheet = getSheet('MaintenanceLog');
        
        // 如果表是空的，加入標題行
        if (sheet.getLastRow() === 0) {
          const headers = ['維修單號', '報修人ID', '報修人姓名', '分店名稱', '設備名稱', 
                          '設備位置', '故障描述', '緊急程度', '狀態', '報修時間', 
                          '受理時間', '完成時間', '維修人員', '預計完成時間', '維修結果',
                          '照片路徑', '聯絡電話', '維修費用', '備註'];
          sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        }
        
        // 新增維修記錄
        sheet.appendRow(maintenanceData);
        
        // 根據緊急程度發送不同通知
        const notificationData = {
          requestId: requestId,
          employeeName: employee.name,
          storeName: sanitizedData.storeName,
          equipmentName: sanitizedData.equipmentName,
          urgency: sanitizedData.urgency,
          description: sanitizedData.description,
          reportTime: new Date().toISOString(),
          estimatedCompletion: estimatedCompletion,
          contactPhone: sanitizedData.contactPhone || employee.phone
        };
        
        try {
          TelegramUtils.sendMaintenanceNotification(notificationData);
          
          // 緊急維修發送額外警告通知
          if (sanitizedData.urgency === '緊急') {
            TelegramUtils.sendUrgentMaintenanceAlert(notificationData);
          }
        } catch (telegramError) {
          logDebug('維修通知發送失敗', telegramError);
        }
        
        logDebug('維修申請提交成功', { requestId, employeeName: employee.name });
        
        return {
          success: true,
          requestId: requestId,
          message: '維修申請提交成功',
          data: {
            requestId: requestId,
            estimatedCompletion: estimatedCompletion,
            urgency: sanitizedData.urgency
          }
        };
        
      } finally {
        lock.releaseLock();
      }
      
    } catch (error) {
      logDebug('維修申請提交錯誤', error);
      DatabaseUtils.logError({
        errorId: DatabaseUtils.generateId('ERR'),
        timestamp: new Date().toISOString(),
        functionName: 'submitMaintenanceRequest',
        errorMessage: error.message,
        userData: { employeeId: data.employeeId, storeName: data.storeName },
        severity: 'HIGH'
      });
      
      return {
        success: false,
        errors: ['系統錯誤，請稍後再試']
      };
    }
  },
  
  /**
   * 更新維修狀態
   */
  updateMaintenanceStatus(data) {
    try {
      const { requestId, status, maintainer, result, cost, updatedBy } = data;
      
      const lock = LockService.getScriptLock();
      lock.waitLock(30000);
      
      try {
        const sheet = getSheet('MaintenanceLog');
        const maintenanceData = sheet.getDataRange().getValues();
        
        for (let i = 1; i < maintenanceData.length; i++) {
          const row = maintenanceData[i];
          if (row[0] === requestId) {
            const currentTime = new Date().toISOString();
            
            // 更新狀態
            if (status) sheet.getRange(i + 1, 9).setValue(status);
            
            // 更新受理時間（當狀態變為處理中時）
            if (status === '處理中' && !row[11]) {
              sheet.getRange(i + 1, 11).setValue(currentTime);
            }
            
            // 更新完成時間（當狀態變為已完成時）
            if (status === '已完成') {
              sheet.getRange(i + 1, 12).setValue(currentTime);
            }
            
            // 更新維修人員
            if (maintainer) sheet.getRange(i + 1, 13).setValue(maintainer);
            
            // 更新維修結果
            if (result) sheet.getRange(i + 1, 15).setValue(result);
            
            // 更新維修費用
            if (cost !== undefined) sheet.getRange(i + 1, 18).setValue(parseFloat(cost) || 0);
            
            // 發送狀態更新通知
            this.sendStatusUpdateNotification(requestId, status, row);
            
            logDebug('維修狀態更新成功', { requestId, status, updatedBy });
            
            return {
              success: true,
              message: '維修狀態更新成功'
            };
          }
        }
        
        return {
          success: false,
          message: '找不到指定的維修單'
        };
        
      } finally {
        lock.releaseLock();
      }
      
    } catch (error) {
      logDebug('更新維修狀態失敗', error);
      return {
        success: false,
        message: '更新維修狀態失敗'
      };
    }
  },
  
  /**
   * 獲取維修記錄
   */
  getMaintenanceRecords(data) {
    try {
      const { employeeId, storeName, startDate, endDate, status, urgency } = data;
      
      const sheet = getSheet('MaintenanceLog');
      const maintenanceData = sheet.getDataRange().getValues();
      
      if (maintenanceData.length <= 1) {
        return {
          success: true,
          data: []
        };
      }
      
      const records = [];
      for (let i = 1; i < maintenanceData.length; i++) {
        const row = maintenanceData[i];
        const record = {
          requestId: row[0],
          employeeId: row[1],
          employeeName: row[2],
          storeName: row[3],
          equipmentName: row[4],
          equipmentLocation: row[5],
          description: row[6],
          urgency: row[7],
          status: row[8],
          reportTime: row[9],
          acceptTime: row[10],
          completeTime: row[11],
          maintainer: row[12],
          estimatedCompletion: row[13],
          result: row[14],
          photoPath: row[15],
          contactPhone: row[16],
          cost: row[17],
          notes: row[18]
        };
        
        // 應用篩選條件
        if (employeeId && record.employeeId !== employeeId) continue;
        if (storeName && record.storeName !== storeName) continue;
        if (status && record.status !== status) continue;
        if (urgency && record.urgency !== urgency) continue;
        
        // 日期範圍篩選
        if (startDate || endDate) {
          const reportDate = new Date(record.reportTime);
          if (startDate && reportDate < new Date(startDate)) continue;
          if (endDate && reportDate > new Date(endDate)) continue;
        }
        
        records.push(record);
      }
      
      // 按報修時間降序排列
      records.sort((a, b) => new Date(b.reportTime) - new Date(a.reportTime));
      
      return {
        success: true,
        data: records
      };
      
    } catch (error) {
      logDebug('獲取維修記錄失敗', error);
      return {
        success: false,
        message: '獲取維修記錄失敗'
      };
    }
  },
  
  /**
   * 獲取維修統計
   */
  getMaintenanceStatistics(data) {
    try {
      const { storeName, startDate, endDate } = data;
      
      const records = this.getMaintenanceRecords({
        storeName: storeName,
        startDate: startDate,
        endDate: endDate
      });
      
      if (!records.success) {
        return { success: false, message: '獲取維修記錄失敗' };
      }
      
      const stats = {
        totalRequests: records.data.length,
        byStatus: {},
        byUrgency: {},
        byEquipment: {},
        totalCost: 0,
        averageResponseTime: 0,
        averageCompletionTime: 0
      };
      
      let responseTimeSum = 0;
      let completionTimeSum = 0;
      let responseTimeCount = 0;
      let completionTimeCount = 0;
      
      records.data.forEach(record => {
        // 按狀態統計
        if (!stats.byStatus[record.status]) {
          stats.byStatus[record.status] = 0;
        }
        stats.byStatus[record.status]++;
        
        // 按緊急程度統計
        if (!stats.byUrgency[record.urgency]) {
          stats.byUrgency[record.urgency] = 0;
        }
        stats.byUrgency[record.urgency]++;
        
        // 按設備統計
        if (!stats.byEquipment[record.equipmentName]) {
          stats.byEquipment[record.equipmentName] = 0;
        }
        stats.byEquipment[record.equipmentName]++;
        
        // 總費用
        stats.totalCost += parseFloat(record.cost) || 0;
        
        // 計算響應時間
        if (record.acceptTime) {
          const reportTime = new Date(record.reportTime);
          const acceptTime = new Date(record.acceptTime);
          const responseHours = (acceptTime - reportTime) / (1000 * 60 * 60);
          responseTimeSum += responseHours;
          responseTimeCount++;
        }
        
        // 計算完成時間
        if (record.completeTime) {
          const reportTime = new Date(record.reportTime);
          const completeTime = new Date(record.completeTime);
          const completionHours = (completeTime - reportTime) / (1000 * 60 * 60);
          completionTimeSum += completionHours;
          completionTimeCount++;
        }
      });
      
      // 計算平均時間
      if (responseTimeCount > 0) {
        stats.averageResponseTime = Math.round((responseTimeSum / responseTimeCount) * 100) / 100;
      }
      
      if (completionTimeCount > 0) {
        stats.averageCompletionTime = Math.round((completionTimeSum / completionTimeCount) * 100) / 100;
      }
      
      stats.totalCost = Math.round(stats.totalCost * 100) / 100;
      
      return {
        success: true,
        data: stats
      };
      
    } catch (error) {
      logDebug('獲取維修統計失敗', error);
      return {
        success: false,
        message: '獲取維修統計失敗'
      };
    }
  },
  
  /**
   * 計算預計完成時間
   */
  calculateEstimatedCompletion(urgency) {
    try {
      const now = new Date();
      let hoursToAdd = 0;
      
      switch (urgency) {
        case '緊急':
          hoursToAdd = 2; // 2小時內
          break;
        case '高':
          hoursToAdd = 8; // 8小時內
          break;
        case '中':
          hoursToAdd = 24; // 1天內
          break;
        case '低':
          hoursToAdd = 72; // 3天內
          break;
        default:
          hoursToAdd = 24;
      }
      
      const estimatedTime = new Date(now.getTime() + (hoursToAdd * 60 * 60 * 1000));
      return estimatedTime.toISOString();
      
    } catch (error) {
      logDebug('計算預計完成時間失敗', error);
      const fallback = new Date();
      fallback.setDate(fallback.getDate() + 1);
      return fallback.toISOString();
    }
  },
  
  /**
   * 發送狀態更新通知
   */
  sendStatusUpdateNotification(requestId, status, recordRow) {
    try {
      const notificationData = {
        requestId: requestId,
        employeeName: recordRow[2],
        storeName: recordRow[3],
        equipmentName: recordRow[4],
        status: status,
        urgency: recordRow[7]
      };
      
      // 根據狀態發送不同通知
      switch (status) {
        case '處理中':
          TelegramUtils.sendMaintenanceAcceptNotification(notificationData);
          break;
        case '已完成':
          TelegramUtils.sendMaintenanceCompleteNotification(notificationData);
          break;
        case '已取消':
          TelegramUtils.sendMaintenanceCancelNotification(notificationData);
          break;
      }
      
    } catch (error) {
      logDebug('發送狀態更新通知失敗', error);
    }
  },
  
  /**
   * 獲取待處理維修單
   */
  getPendingMaintenanceRequests(storeName = null) {
    try {
      const records = this.getMaintenanceRecords({
        storeName: storeName,
        status: '待處理'
      });
      
      if (!records.success) {
        return { success: false, message: '獲取待處理維修單失敗' };
      }
      
      // 按緊急程度和報修時間排序
      const urgencyOrder = { '緊急': 1, '高': 2, '中': 3, '低': 4 };
      
      records.data.sort((a, b) => {
        const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        if (urgencyDiff !== 0) {
          return urgencyDiff;
        }
        return new Date(a.reportTime) - new Date(b.reportTime);
      });
      
      return {
        success: true,
        data: records.data
      };
      
    } catch (error) {
      logDebug('獲取待處理維修單失敗', error);
      return {
        success: false,
        message: '獲取待處理維修單失敗'
      };
    }
  },
  
  /**
   * 檢查逾期維修單
   */
  checkOverdueMaintenanceRequests() {
    try {
      const now = new Date();
      const records = this.getMaintenanceRecords({
        status: '處理中'
      });
      
      if (!records.success) {
        return { success: false, message: '獲取維修記錄失敗' };
      }
      
      const overdueRequests = records.data.filter(record => {
        if (record.estimatedCompletion) {
          const estimatedTime = new Date(record.estimatedCompletion);
          return now > estimatedTime;
        }
        return false;
      });
      
      // 發送逾期通知
      if (overdueRequests.length > 0) {
        try {
          TelegramUtils.sendOverdueMaintenanceAlert({
            count: overdueRequests.length,
            requests: overdueRequests.slice(0, 5) // 只發送前5個
          });
        } catch (error) {
          logDebug('發送逾期通知失敗', error);
        }
      }
      
      return {
        success: true,
        data: overdueRequests
      };
      
    } catch (error) {
      logDebug('檢查逾期維修單失敗', error);
      return {
        success: false,
        message: '檢查逾期維修單失敗'
      };
    }
  },
  
  /**
   * 分配維修人員
   */
  assignMaintainer(requestId, maintainerId) {
    try {
      const maintainer = EmployeeModule.getEmployeeById(maintainerId);
      if (!maintainer) {
        return {
          success: false,
          message: '找不到維修人員資訊'
        };
      }
      
      const result = this.updateMaintenanceStatus({
        requestId: requestId,
        status: '處理中',
        maintainer: maintainer.name,
        updatedBy: maintainerId
      });
      
      if (result.success) {
        // 發送分配通知
        try {
          TelegramUtils.sendMaintenanceAssignNotification({
            requestId: requestId,
            maintainerName: maintainer.name
          });
        } catch (error) {
          logDebug('發送分配通知失敗', error);
        }
      }
      
      return result;
      
    } catch (error) {
      logDebug('分配維修人員失敗', error);
      return {
        success: false,
        message: '分配維修人員失敗'
      };
    }
  }
  
};