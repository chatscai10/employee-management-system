/**
 * 營收系統模組 - 處理營收記錄、獎金計算和財務統計
 */

const RevenueModule = {
  
  /**
   * 提交營收數據
   */
  submitRevenue(data) {
    try {
      // 驗證輸入數據
      const sanitizedData = ValidationUtils.sanitizeObject(data);
      const validation = ValidationUtils.validateRevenueData(sanitizedData);
      
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors
        };
      }
      
      const lock = LockService.getScriptLock();
      lock.waitLock(30000);
      
      try {
        // 檢查員工是否存在
        const employee = EmployeeModule.getEmployeeById(sanitizedData.employeeId);
        if (!employee) {
          return {
            success: false,
            message: '員工不存在'
          };
        }
        
        if (employee.status !== '在職') {
          return {
            success: false,
            message: '員工目前非在職狀態'
          };
        }
        
        // 檢查該日期是否已有營收記錄
        const existingRecord = this.getRevenueRecord(
          sanitizedData.employeeId,
          sanitizedData.businessDate,
          sanitizedData.storeName
        );
        
        if (existingRecord) {
          return {
            success: false,
            message: '該日期已有營收記錄，請使用更新功能'
          };
        }
        
        // 計算總收入和總支出
        const totalRevenue = (sanitizedData.fieldOrderRevenue || 0) + 
                           (sanitizedData.deliveryRevenue || 0) + 
                           (sanitizedData.otherRevenue || 0);
        
        const totalExpense = (sanitizedData.materialCost || 0) + 
                           (sanitizedData.otherExpense || 0);
        
        const netIncome = totalRevenue - totalExpense;
        
        // 計算平均客單價
        const avgOrderValue = sanitizedData.orderCount > 0 ? 
          (sanitizedData.fieldOrderRevenue / sanitizedData.orderCount) : 0;
        
        // 計算獎金
        const bonusResult = this.calculateBonus({
          totalRevenue: totalRevenue,
          bonusType: sanitizedData.bonusType,
          employeeId: sanitizedData.employeeId
        });
        
        // 生成營收記錄
        const revenueId = DatabaseUtils.generateId('REV');
        const revenueData = [
          revenueId,
          sanitizedData.employeeId,
          employee.name,
          sanitizedData.businessDate,
          sanitizedData.storeName,
          sanitizedData.orderCount || 0,
          sanitizedData.fieldOrderRevenue || 0,
          sanitizedData.deliveryRevenue || 0,
          sanitizedData.otherRevenue || 0,
          totalRevenue,
          sanitizedData.materialCost || 0,
          sanitizedData.otherExpense || 0,
          totalExpense,
          netIncome,
          sanitizedData.bonusType,
          bonusResult.bonus,
          Math.round(avgOrderValue),
          new Date(),
          sanitizedData.notes || ''
        ];
        
        // 寫入營收記錄表
        const sheet = getSheet('RevenueLog');
        
        // 如果表是空的，加入標題行
        if (sheet.getLastRow() === 0) {
          const headers = ['記錄ID', '員工編號', '員工姓名', '營業日期', '分店名稱', '現場訂單數',
                          '現場訂單收入', '外送訂單收入', '其他收入', '收入總額', '材料成本', '其他支出',
                          '支出總額', '淨收入', '獎金類別', '計算獎金', '訂單平均', '提交時間', '備註'];
          sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        }
        
        sheet.appendRow(revenueData);
        
        // 準備 Telegram 通知數據
        const notificationData = {
          storeName: sanitizedData.storeName,
          employeeName: employee.name,
          businessDate: sanitizedData.businessDate,
          orderCount: sanitizedData.orderCount || 0,
          revenueDetails: {
            field: sanitizedData.fieldOrderRevenue || 0,
            delivery: sanitizedData.deliveryRevenue || 0
          },
          expenseDetails: {
            material: sanitizedData.materialCost || 0
          },
          totalRevenue: totalRevenue,
          totalExpense: totalExpense,
          netIncome: netIncome,
          bonusType: sanitizedData.bonusType,
          bonus: bonusResult.bonus,
          avgOrderValue: Math.round(avgOrderValue),
          notes: sanitizedData.notes || '無'
        };
        
        // 發送 Telegram 通知
        try {
          TelegramUtils.sendRevenueNotification(notificationData);
        } catch (telegramError) {
          logDebug('Telegram通知發送失敗', telegramError);
        }
        
        logDebug('營收提交成功', { 
          revenueId: revenueId,
          totalRevenue: totalRevenue,
          bonus: bonusResult.bonus
        });
        
        return {
          success: true,
          message: '營收記錄提交成功',
          data: {
            revenueId: revenueId,
            totalRevenue: totalRevenue,
            totalExpense: totalExpense,
            netIncome: netIncome,
            bonus: bonusResult.bonus,
            bonusQualified: bonusResult.isQualified,
            shortfall: bonusResult.shortfall
          }
        };
        
      } finally {
        lock.releaseLock();
      }
      
    } catch (error) {
      logDebug('營收提交錯誤', error);
      DatabaseUtils.logError({
        errorId: DatabaseUtils.generateId('ERR'),
        timestamp: new Date().toISOString(),
        functionName: 'submitRevenue',
        errorMessage: error.message,
        userData: { employeeId: data.employeeId, storeName: data.storeName },
        severity: 'HIGH'
      });
      
      return {
        success: false,
        message: '系統錯誤，請稍後再試'
      };
    }
  },
  
  /**
   * 計算獎金邏輯
   */
  calculateBonus(data) {
    try {
      const { totalRevenue, bonusType, employeeId } = data;
      
      // 輸入驗證
      if (!totalRevenue || totalRevenue < 0) {
        return {
          success: false,
          message: '營收金額無效'
        };
      }
      
      if (!bonusType || !['平日獎金', '假日獎金'].includes(bonusType)) {
        return {
          success: false,
          message: '獎金類別無效'
        };
      }
      
      if (!employeeId) {
        return {
          success: false,
          message: '員工ID無效'
        };
      }
      
      // 獲取系統獎金設定
      const settings = DatabaseUtils.getSystemSettings();
      const bonusSettings = settings.bonus || {
        weekdayThreshold: 13000,
        weekdayRate: 0.30,
        holidayThreshold: 0,
        holidayRate: 0.38
      };
      
      // 獲取員工職位資訊以計算獎金倍數
      const employee = EmployeeModule.getEmployeeById(employeeId);
      if (!employee) {
        return {
          success: false,
          message: '找不到員工資訊'
        };
      }
      
      const positions = EmployeeModule.getAvailablePositions();
      const position = positions.find(p => p.positionName === employee.position);
      const bonusMultiplier = position && position.bonusMultiplier ? 
        parseFloat(position.bonusMultiplier) : 1.0;
      
      // 初始化獎金計算變數
      let bonus = 0;
      let threshold = 0;
      let rate = 0;
      
      if (bonusType === '平日獎金') {
        threshold = parseFloat(bonusSettings.weekdayThreshold) || 13000;
        rate = parseFloat(bonusSettings.weekdayRate) || 0.30;
        
        if (totalRevenue > threshold) {
          bonus = Math.round((totalRevenue - threshold) * rate * bonusMultiplier);
        }
      } else if (bonusType === '假日獎金') {
        threshold = parseFloat(bonusSettings.holidayThreshold) || 0;
        rate = parseFloat(bonusSettings.holidayRate) || 0.38;
        
        if (totalRevenue > threshold) {
          bonus = Math.round((totalRevenue - threshold) * rate * bonusMultiplier);
        }
      }
      
      return {
        bonus: Math.round(bonus),
        isQualified: bonus > 0,
        shortfall: bonus > 0 ? 0 : Math.max(0, threshold - totalRevenue),
        threshold: threshold,
        rate: rate,
        multiplier: bonusMultiplier
      };
      
    } catch (error) {
      logDebug('獎金計算錯誤', error);
      return {
        bonus: 0,
        isQualified: false,
        shortfall: 0,
        threshold: 0,
        rate: 0,
        multiplier: 1.0
      };
    }
  },
  
  /**
   * 計算獎金（API端點）
   */
  calculateBonusAPI(data) {
    try {
      const { totalRevenue, bonusType, employeeId } = data;
      
      if (!totalRevenue || !bonusType) {
        return {
          success: false,
          message: '缺少必要參數'
        };
      }
      
      const result = this.calculateBonus(data);
      
      return {
        success: true,
        data: result
      };
      
    } catch (error) {
      logDebug('獎金計算API錯誤', error);
      return {
        success: false,
        message: '計算失敗'
      };
    }
  },
  
  /**
   * 獲取營收記錄
   */
  getRevenueRecord(employeeId, businessDate, storeName) {
    try {
      const sheet = getSheet('RevenueLog');
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === employeeId && 
            data[i][3] === businessDate && 
            data[i][4] === storeName) {
          return {
            recordId: data[i][0],
            totalRevenue: data[i][9],
            bonus: data[i][15]
          };
        }
      }
      
      return null;
    } catch (error) {
      logDebug('獲取營收記錄失敗', error);
      return null;
    }
  },
  
  /**
   * 獲取營收歷史
   */
  getRevenueHistory(data) {
    try {
      const { employeeId, startDate, endDate, storeName, limit = 50 } = data;
      
      const sheet = getSheet('RevenueLog');
      const allData = sheet.getDataRange().getValues();
      
      if (allData.length <= 1) {
        return {
          success: true,
          data: []
        };
      }
      
      const records = [];
      
      for (let i = 1; i < allData.length && records.length < limit; i++) {
        const recordEmployeeId = allData[i][1];
        const recordDate = allData[i][3];
        const recordStore = allData[i][4];
        
        // 篩選條件
        if (employeeId && recordEmployeeId !== employeeId) continue;
        if (startDate && recordDate < startDate) continue;
        if (endDate && recordDate > endDate) continue;
        if (storeName && recordStore !== storeName) continue;
        
        records.push({
          recordId: allData[i][0],
          employeeName: allData[i][2],
          businessDate: allData[i][3],
          storeName: allData[i][4],
          orderCount: allData[i][5],
          totalRevenue: allData[i][9],
          totalExpense: allData[i][12],
          netIncome: allData[i][13],
          bonusType: allData[i][14],
          bonus: allData[i][15],
          avgOrderValue: allData[i][16],
          submitTime: allData[i][17],
          notes: allData[i][18]
        });
      }
      
      return {
        success: true,
        data: records.reverse() // 最新的在前面
      };
      
    } catch (error) {
      logDebug('獲取營收歷史失敗', error);
      return {
        success: false,
        message: '獲取營收歷史失敗'
      };
    }
  },
  
  /**
   * 獲取每日營收統計
   */
  getDailyRevenueStats(date, storeName = null) {
    try {
      const sheet = getSheet('RevenueLog');
      const data = sheet.getDataRange().getValues();
      
      const stats = {
        totalRevenue: 0,
        totalExpense: 0,
        netIncome: 0,
        totalBonus: 0,
        orderCount: 0,
        recordCount: 0,
        avgOrderValue: 0,
        stores: {}
      };
      
      for (let i = 1; i < data.length; i++) {
        const recordDate = data[i][3];
        const recordStore = data[i][4];
        
        if (recordDate === date && (!storeName || recordStore === storeName)) {
          stats.totalRevenue += Number(data[i][9]) || 0;
          stats.totalExpense += Number(data[i][12]) || 0;
          stats.netIncome += Number(data[i][13]) || 0;
          stats.totalBonus += Number(data[i][15]) || 0;
          stats.orderCount += Number(data[i][5]) || 0;
          stats.recordCount++;
          
          // 分店統計
          if (!stats.stores[recordStore]) {
            stats.stores[recordStore] = {
              revenue: 0,
              expense: 0,
              netIncome: 0,
              bonus: 0,
              orderCount: 0
            };
          }
          
          stats.stores[recordStore].revenue += Number(data[i][9]) || 0;
          stats.stores[recordStore].expense += Number(data[i][12]) || 0;
          stats.stores[recordStore].netIncome += Number(data[i][13]) || 0;
          stats.stores[recordStore].bonus += Number(data[i][15]) || 0;
          stats.stores[recordStore].orderCount += Number(data[i][5]) || 0;
        }
      }
      
      if (stats.orderCount > 0) {
        stats.avgOrderValue = Math.round(stats.totalRevenue / stats.orderCount);
      }
      
      return stats;
    } catch (error) {
      logDebug('獲取每日營收統計失敗', error);
      return null;
    }
  },
  
  /**
   * 獲取月度營收統計
   */
  getMonthlyRevenueStats(year, month, storeName = null) {
    try {
      const sheet = getSheet('RevenueLog');
      const data = sheet.getDataRange().getValues();
      
      const stats = {
        totalRevenue: 0,
        totalExpense: 0,
        netIncome: 0,
        totalBonus: 0,
        orderCount: 0,
        recordCount: 0,
        avgOrderValue: 0,
        dailyStats: {},
        topEmployees: []
      };
      
      const employeeStats = {};
      
      for (let i = 1; i < data.length; i++) {
        const recordDate = new Date(data[i][3]);
        const recordStore = data[i][4];
        const employeeId = data[i][1];
        const employeeName = data[i][2];
        
        if (recordDate.getFullYear() === year && 
            recordDate.getMonth() === month - 1 && 
            (!storeName || recordStore === storeName)) {
          
          const dateStr = Utilities.formatDate(recordDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
          
          // 總統計
          stats.totalRevenue += Number(data[i][9]) || 0;
          stats.totalExpense += Number(data[i][12]) || 0;
          stats.netIncome += Number(data[i][13]) || 0;
          stats.totalBonus += Number(data[i][15]) || 0;
          stats.orderCount += Number(data[i][5]) || 0;
          stats.recordCount++;
          
          // 每日統計
          if (!stats.dailyStats[dateStr]) {
            stats.dailyStats[dateStr] = {
              revenue: 0,
              expense: 0,
              netIncome: 0,
              bonus: 0,
              orderCount: 0
            };
          }
          
          stats.dailyStats[dateStr].revenue += Number(data[i][9]) || 0;
          stats.dailyStats[dateStr].expense += Number(data[i][12]) || 0;
          stats.dailyStats[dateStr].netIncome += Number(data[i][13]) || 0;
          stats.dailyStats[dateStr].bonus += Number(data[i][15]) || 0;
          stats.dailyStats[dateStr].orderCount += Number(data[i][5]) || 0;
          
          // 員工統計
          if (!employeeStats[employeeId]) {
            employeeStats[employeeId] = {
              employeeId: employeeId,
              employeeName: employeeName,
              revenue: 0,
              bonus: 0,
              recordCount: 0
            };
          }
          
          employeeStats[employeeId].revenue += Number(data[i][9]) || 0;
          employeeStats[employeeId].bonus += Number(data[i][15]) || 0;
          employeeStats[employeeId].recordCount++;
        }
      }
      
      if (stats.orderCount > 0) {
        stats.avgOrderValue = Math.round(stats.totalRevenue / stats.orderCount);
      }
      
      // 排序員工績效
      stats.topEmployees = Object.values(employeeStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
      
      return stats;
    } catch (error) {
      logDebug('獲取月度營收統計失敗', error);
      return null;
    }
  },
  
  /**
   * 更新營收記錄
   */
  updateRevenue(revenueId, updateData) {
    try {
      const lock = LockService.getScriptLock();
      lock.waitLock(30000);
      
      try {
        const sheet = getSheet('RevenueLog');
        const data = sheet.getDataRange().getValues();
        
        for (let i = 1; i < data.length; i++) {
          if (data[i][0] === revenueId) {
            // 重新計算總計
            const totalRevenue = (updateData.fieldOrderRevenue || data[i][6]) + 
                               (updateData.deliveryRevenue || data[i][7]) + 
                               (updateData.otherRevenue || data[i][8]);
            
            const totalExpense = (updateData.materialCost || data[i][10]) + 
                               (updateData.otherExpense || data[i][11]);
            
            const netIncome = totalRevenue - totalExpense;
            
            // 重新計算獎金
            const bonusResult = this.calculateBonus({
              totalRevenue: totalRevenue,
              bonusType: updateData.bonusType || data[i][14],
              employeeId: data[i][1]
            });
            
            // 更新數據
            if (updateData.orderCount !== undefined) sheet.getRange(i + 1, 6).setValue(updateData.orderCount);
            if (updateData.fieldOrderRevenue !== undefined) sheet.getRange(i + 1, 7).setValue(updateData.fieldOrderRevenue);
            if (updateData.deliveryRevenue !== undefined) sheet.getRange(i + 1, 8).setValue(updateData.deliveryRevenue);
            if (updateData.otherRevenue !== undefined) sheet.getRange(i + 1, 9).setValue(updateData.otherRevenue);
            sheet.getRange(i + 1, 10).setValue(totalRevenue);
            if (updateData.materialCost !== undefined) sheet.getRange(i + 1, 11).setValue(updateData.materialCost);
            if (updateData.otherExpense !== undefined) sheet.getRange(i + 1, 12).setValue(updateData.otherExpense);
            sheet.getRange(i + 1, 13).setValue(totalExpense);
            sheet.getRange(i + 1, 14).setValue(netIncome);
            if (updateData.bonusType !== undefined) sheet.getRange(i + 1, 15).setValue(updateData.bonusType);
            sheet.getRange(i + 1, 16).setValue(bonusResult.bonus);
            if (updateData.notes !== undefined) sheet.getRange(i + 1, 19).setValue(updateData.notes);
            
            return { 
              success: true, 
              message: '營收記錄更新成功',
              newBonus: bonusResult.bonus
            };
          }
        }
        
        return { success: false, message: '找不到該營收記錄' };
        
      } finally {
        lock.releaseLock();
      }
      
    } catch (error) {
      logDebug('更新營收記錄錯誤', error);
      return { success: false, message: '更新失敗' };
    }
  },
  
  /**
   * 獲取獎金設定
   */
  getBonusSettings() {
    try {
      const settings = DatabaseUtils.getSystemSettings();
      return settings.bonus || {
        weekdayThreshold: 13000,
        weekdayRate: 0.30,
        holidayThreshold: 0,
        holidayRate: 0.38
      };
    } catch (error) {
      logDebug('獲取獎金設定失敗', error);
      return {
        weekdayThreshold: 13000,
        weekdayRate: 0.30,
        holidayThreshold: 0,
        holidayRate: 0.38
      };
    }
  }
  
};