/**
 * 排班管理模組 - 處理員工排班和班表管理
 */

const ScheduleModule = {
  
  /**
   * 創建新的班表
   */
  createSchedule(data) {
    try {
      // 清理和驗證輸入數據
      const sanitizedData = ValidationUtils.sanitizeObject(data);
      const validation = ValidationUtils.validateScheduleData(sanitizedData);
      
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors
        };
      }
      
      const lock = LockService.getScriptLock();
      lock.waitLock(30000);
      
      try {
        // 生成班表編號
        const scheduleId = DatabaseUtils.generateId('SCH');
        
        // 檢查時間衝突
        const conflicts = this.checkScheduleConflicts(sanitizedData);
        if (conflicts.length > 0) {
          return {
            success: false,
            errors: ['排班時間衝突'],
            conflicts: conflicts
          };
        }
        
        // 獲取員工資訊
        const employee = EmployeeModule.getEmployeeById(sanitizedData.employeeId);
        if (!employee) {
          return {
            success: false,
            errors: ['找不到員工資訊']
          };
        }
        
        // 準備班表數據
        const scheduleData = [
          scheduleId,
          sanitizedData.employeeId,
          employee.name,
          sanitizedData.storeName,
          sanitizedData.scheduleDate,
          sanitizedData.shiftType,
          sanitizedData.startTime,
          sanitizedData.endTime,
          sanitizedData.position,
          this.calculateWorkHours(sanitizedData.startTime, sanitizedData.endTime),
          sanitizedData.isHoliday ? '是' : '否',
          '正常',
          sanitizedData.createdBy,
          new Date().toISOString(),
          sanitizedData.notes || ''
        ];
        
        // 寫入班表記錄表
        const sheet = getSheet('ScheduleLog');
        
        // 如果表是空的，加入標題行
        if (sheet.getLastRow() === 0) {
          const headers = ['班表ID', '員工編號', '員工姓名', '分店名稱', '排班日期', 
                          '班別', '開始時間', '結束時間', '職位', '工作時數', 
                          '假日', '狀態', '建立者', '建立時間', '備註'];
          sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        }
        
        // 新增班表記錄
        sheet.appendRow(scheduleData);
        
        // 發送通知
        const notificationData = {
          scheduleId: scheduleId,
          employeeName: employee.name,
          storeName: sanitizedData.storeName,
          scheduleDate: sanitizedData.scheduleDate,
          shiftType: sanitizedData.shiftType,
          startTime: sanitizedData.startTime,
          endTime: sanitizedData.endTime,
          workHours: this.calculateWorkHours(sanitizedData.startTime, sanitizedData.endTime)
        };
        
        try {
          TelegramUtils.sendScheduleNotification(notificationData);
        } catch (telegramError) {
          logDebug('班表通知發送失敗', telegramError);
        }
        
        logDebug('班表創建成功', { scheduleId, employeeName: employee.name });
        
        return {
          success: true,
          scheduleId: scheduleId,
          message: '班表創建成功',
          data: {
            scheduleId: scheduleId,
            workHours: this.calculateWorkHours(sanitizedData.startTime, sanitizedData.endTime)
          }
        };
        
      } finally {
        lock.releaseLock();
      }
      
    } catch (error) {
      logDebug('班表創建錯誤', error);
      DatabaseUtils.logError({
        errorId: DatabaseUtils.generateId('ERR'),
        timestamp: new Date().toISOString(),
        functionName: 'createSchedule',
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
   * 獲取班表
   */
  getSchedule(data) {
    try {
      const { employeeId, storeName, startDate, endDate, shiftType } = data;
      
      const sheet = getSheet('ScheduleLog');
      const scheduleData = sheet.getDataRange().getValues();
      
      if (scheduleData.length <= 1) {
        return {
          success: true,
          data: []
        };
      }
      
      const schedules = [];
      for (let i = 1; i < scheduleData.length; i++) {
        const row = scheduleData[i];
        const schedule = {
          scheduleId: row[0],
          employeeId: row[1],
          employeeName: row[2],
          storeName: row[3],
          scheduleDate: row[4],
          shiftType: row[5],
          startTime: row[6],
          endTime: row[7],
          position: row[8],
          workHours: row[9],
          isHoliday: row[10] === '是',
          status: row[11],
          createdBy: row[12],
          createdTime: row[13],
          notes: row[14]
        };
        
        // 應用篩選條件
        if (employeeId && schedule.employeeId !== employeeId) continue;
        if (storeName && schedule.storeName !== storeName) continue;
        if (shiftType && schedule.shiftType !== shiftType) continue;
        
        // 日期範圍篩選
        if (startDate || endDate) {
          const scheduleDate = new Date(schedule.scheduleDate);
          if (startDate && scheduleDate < new Date(startDate)) continue;
          if (endDate && scheduleDate > new Date(endDate)) continue;
        }
        
        schedules.push(schedule);
      }
      
      // 按排班日期排序
      schedules.sort((a, b) => new Date(a.scheduleDate) - new Date(b.scheduleDate));
      
      return {
        success: true,
        data: schedules
      };
      
    } catch (error) {
      logDebug('獲取班表失敗', error);
      return {
        success: false,
        message: '獲取班表失敗'
      };
    }
  },
  
  /**
   * 更新班表狀態
   */
  updateScheduleStatus(scheduleId, status, updatedBy) {
    try {
      const lock = LockService.getScriptLock();
      lock.waitLock(30000);
      
      try {
        const sheet = getSheet('ScheduleLog');
        const data = sheet.getDataRange().getValues();
        
        for (let i = 1; i < data.length; i++) {
          if (data[i][0] === scheduleId) {
            // 更新狀態
            sheet.getRange(i + 1, 12).setValue(status);
            
            // 記錄更新
            logDebug('班表狀態更新成功', { scheduleId, status, updatedBy });
            return { success: true, message: '班表狀態更新成功' };
          }
        }
        
        return { success: false, message: '找不到指定的班表' };
        
      } finally {
        lock.releaseLock();
      }
      
    } catch (error) {
      logDebug('更新班表狀態失敗', error);
      return { success: false, message: '更新班表狀態失敗' };
    }
  },
  
  /**
   * 檢查排班衝突
   */
  checkScheduleConflicts(scheduleData) {
    try {
      const sheet = getSheet('ScheduleLog');
      const existingSchedules = sheet.getDataRange().getValues();
      const conflicts = [];
      
      const newStart = new Date(`${scheduleData.scheduleDate} ${scheduleData.startTime}`);
      const newEnd = new Date(`${scheduleData.scheduleDate} ${scheduleData.endTime}`);
      
      for (let i = 1; i < existingSchedules.length; i++) {
        const row = existingSchedules[i];
        const existingEmployeeId = row[1];
        const existingDate = row[4];
        const existingStart = new Date(`${existingDate} ${row[6]}`);
        const existingEnd = new Date(`${existingDate} ${row[7]}`);
        
        // 檢查同一員工在同一天的時間衝突
        if (existingEmployeeId === scheduleData.employeeId && 
            existingDate === scheduleData.scheduleDate) {
          
          // 檢查時間重疊
          if ((newStart < existingEnd && newEnd > existingStart) ||
              (existingStart < newEnd && existingEnd > newStart)) {
            conflicts.push({
              conflictId: row[0],
              existingShift: `${row[6]} - ${row[7]}`,
              newShift: `${scheduleData.startTime} - ${scheduleData.endTime}`,
              date: existingDate
            });
          }
        }
      }
      
      return conflicts;
      
    } catch (error) {
      logDebug('檢查排班衝突失敗', error);
      return [];
    }
  },
  
  /**
   * 計算工作時數
   */
  calculateWorkHours(startTime, endTime) {
    try {
      const start = new Date(`2024-01-01 ${startTime}`);
      const end = new Date(`2024-01-01 ${endTime}`);
      
      // 處理跨夜班
      if (end <= start) {
        end.setDate(end.getDate() + 1);
      }
      
      const diffMs = end - start;
      const diffHours = diffMs / (1000 * 60 * 60);
      
      return Math.round(diffHours * 100) / 100; // 精確到小數點後2位
      
    } catch (error) {
      logDebug('計算工作時數失敗', error);
      return 0;
    }
  },
  
  /**
   * 獲取員工當月總工時
   */
  getMonthlyWorkHours(employeeId, year, month) {
    try {
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // 月末日期
      
      const schedules = this.getSchedule({
        employeeId: employeeId,
        startDate: startDate,
        endDate: endDate
      });
      
      if (!schedules.success) {
        return { success: false, message: '獲取班表失敗' };
      }
      
      let totalHours = 0;
      let holidayHours = 0;
      let regularHours = 0;
      
      schedules.data.forEach(schedule => {
        const hours = parseFloat(schedule.workHours) || 0;
        totalHours += hours;
        
        if (schedule.isHoliday) {
          holidayHours += hours;
        } else {
          regularHours += hours;
        }
      });
      
      return {
        success: true,
        data: {
          totalHours: Math.round(totalHours * 100) / 100,
          regularHours: Math.round(regularHours * 100) / 100,
          holidayHours: Math.round(holidayHours * 100) / 100,
          scheduleCount: schedules.data.length
        }
      };
      
    } catch (error) {
      logDebug('獲取月工時失敗', error);
      return { success: false, message: '獲取月工時失敗' };
    }
  },
  
  /**
   * 獲取班別統計
   */
  getShiftStatistics(data) {
    try {
      const { storeName, startDate, endDate } = data;
      
      const schedules = this.getSchedule({
        storeName: storeName,
        startDate: startDate,
        endDate: endDate
      });
      
      if (!schedules.success) {
        return { success: false, message: '獲取班表失敗' };
      }
      
      const stats = {
        totalSchedules: schedules.data.length,
        byShiftType: {},
        byPosition: {},
        totalWorkHours: 0,
        averageWorkHours: 0
      };
      
      schedules.data.forEach(schedule => {
        // 按班別統計
        if (!stats.byShiftType[schedule.shiftType]) {
          stats.byShiftType[schedule.shiftType] = 0;
        }
        stats.byShiftType[schedule.shiftType]++;
        
        // 按職位統計
        if (!stats.byPosition[schedule.position]) {
          stats.byPosition[schedule.position] = 0;
        }
        stats.byPosition[schedule.position]++;
        
        // 總工時
        stats.totalWorkHours += parseFloat(schedule.workHours) || 0;
      });
      
      if (stats.totalSchedules > 0) {
        stats.averageWorkHours = Math.round((stats.totalWorkHours / stats.totalSchedules) * 100) / 100;
      }
      
      stats.totalWorkHours = Math.round(stats.totalWorkHours * 100) / 100;
      
      return {
        success: true,
        data: stats
      };
      
    } catch (error) {
      logDebug('獲取班別統計失敗', error);
      return { success: false, message: '獲取班別統計失敗' };
    }
  },
  
  /**
   * 批量創建班表
   */
  createBatchSchedule(data) {
    try {
      const { schedules, createdBy } = data;
      const results = [];
      const failures = [];
      
      const lock = LockService.getScriptLock();
      lock.waitLock(60000); // 較長的鎖定時間
      
      try {
        schedules.forEach((schedule, index) => {
          try {
            const result = this.createSchedule({
              ...schedule,
              createdBy: createdBy
            });
            
            if (result.success) {
              results.push({
                index: index,
                scheduleId: result.scheduleId,
                success: true
              });
            } else {
              failures.push({
                index: index,
                errors: result.errors,
                schedule: schedule
              });
            }
          } catch (error) {
            failures.push({
              index: index,
              errors: [error.message],
              schedule: schedule
            });
          }
        });
        
        return {
          success: true,
          message: `批量創建完成：成功 ${results.length} 筆，失敗 ${failures.length} 筆`,
          data: {
            successful: results,
            failed: failures,
            totalProcessed: schedules.length
          }
        };
        
      } finally {
        lock.releaseLock();
      }
      
    } catch (error) {
      logDebug('批量創建班表失敗', error);
      return {
        success: false,
        errors: ['批量創建失敗']
      };
    }
  },
  
  /**
   * 刪除班表
   */
  deleteSchedule(scheduleId, deletedBy) {
    try {
      const lock = LockService.getScriptLock();
      lock.waitLock(30000);
      
      try {
        const sheet = getSheet('ScheduleLog');
        const data = sheet.getDataRange().getValues();
        
        for (let i = 1; i < data.length; i++) {
          if (data[i][0] === scheduleId) {
            // 標記為已刪除而不是實際刪除行
            sheet.getRange(i + 1, 12).setValue('已刪除');
            
            logDebug('班表刪除成功', { scheduleId, deletedBy });
            return { success: true, message: '班表刪除成功' };
          }
        }
        
        return { success: false, message: '找不到指定的班表' };
        
      } finally {
        lock.releaseLock();
      }
      
    } catch (error) {
      logDebug('刪除班表失敗', error);
      return { success: false, message: '刪除班表失敗' };
    }
  }
  
};