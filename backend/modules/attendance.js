/**
 * 打卡系統模組 - 處理員工打卡、GPS驗證和設備指紋檢測
 */

const AttendanceModule = {
  
  /**
   * 員工上班打卡
   */
  clockIn(data) {
    try {
      // 驗證輸入數據
      const sanitizedData = ValidationUtils.sanitizeObject(data);
      const validation = ValidationUtils.validateAttendanceData(sanitizedData);
      
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
        
        // 檢查今日是否已打上班卡
        const today = new Date();
        const todayStr = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        
        const existingClockIn = this.getTodayAttendance(sanitizedData.employeeId, '上班', todayStr);
        if (existingClockIn) {
          return {
            success: false,
            message: '今日已打過上班卡'
          };
        }
        
        // GPS位置驗證
        const locationValidation = this.validateGPSLocation(
          sanitizedData.gpsCoordinates,
          sanitizedData.storeName
        );
        
        if (!locationValidation.valid) {
          return {
            success: false,
            message: locationValidation.message,
            distance: locationValidation.distance
          };
        }
        
        // 設備指紋驗證
        const deviceValidation = this.validateDeviceFingerprint(
          sanitizedData.employeeId,
          sanitizedData.deviceFingerprint
        );
        
        // 計算是否遲到
        const lateInfo = this.calculateLateTime(today, '上班');
        
        // 生成打卡記錄
        const attendanceId = DatabaseUtils.generateId('ATT');
        const attendanceData = [
          attendanceId,
          sanitizedData.employeeId,
          employee.name,
          today,
          '上班',
          sanitizedData.storeName,
          sanitizedData.gpsCoordinates,
          locationValidation.distance,
          sanitizedData.deviceFingerprint,
          sanitizedData.ipAddress || '',
          lateInfo.isLate ? '遲到' : '正常',
          lateInfo.lateMinutes,
          deviceValidation.anomaly || '',
          sanitizedData.photoPath || '',
          today,
          sanitizedData.notes || ''
        ];
        
        // 寫入打卡記錄表
        const sheet = getSheet('AttendanceLog');
        
        // 如果表是空的，加入標題行
        if (sheet.getLastRow() === 0) {
          const headers = ['記錄ID', '員工編號', '員工姓名', '打卡時間', '打卡類型', '分店名稱',
                          'GPS座標', '距離分店', '設備指紋', 'IP位址', '狀態', '遲到分鐘',
                          '異常原因', '照片路徑', '提交時間', '備註'];
          sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        }
        
        sheet.appendRow(attendanceData);
        
        // 準備 Telegram 通知數據
        const notificationData = {
          employeeName: employee.name,
          employeeId: sanitizedData.employeeId,
          timestamp: today.toLocaleString(),
          storeName: sanitizedData.storeName,
          coordinates: sanitizedData.gpsCoordinates,
          distance: locationValidation.distance.toFixed(1),
          deviceInfo: this.getDeviceInfo(sanitizedData.deviceFingerprint),
          status: lateInfo.isLate ? '遲到' : '正常',
          type: '上班',
          isLate: lateInfo.isLate,
          lateMinutes: lateInfo.lateMinutes,
          totalLateMinutes: this.getMonthlyLateMinutes(sanitizedData.employeeId)
        };
        
        // 發送 Telegram 通知
        try {
          TelegramUtils.sendAttendanceNotification(notificationData);
        } catch (telegramError) {
          logDebug('Telegram通知發送失敗', telegramError);
        }
        
        logDebug('上班打卡成功', { 
          employeeId: sanitizedData.employeeId, 
          attendanceId: attendanceId,
          isLate: lateInfo.isLate
        });
        
        return {
          success: true,
          message: lateInfo.isLate ? `打卡成功，但您遲到了${lateInfo.lateMinutes}分鐘` : '打卡成功',
          data: {
            attendanceId: attendanceId,
            timestamp: today,
            status: lateInfo.isLate ? '遲到' : '正常',
            lateMinutes: lateInfo.lateMinutes,
            distance: locationValidation.distance
          }
        };
        
      } finally {
        lock.releaseLock();
      }
      
    } catch (error) {
      logDebug('上班打卡錯誤', error);
      DatabaseUtils.logError({
        errorId: DatabaseUtils.generateId('ERR'),
        timestamp: new Date().toISOString(),
        functionName: 'clockIn',
        errorMessage: error.message,
        userData: { employeeId: data.employeeId, employeeName: data.employeeName },
        severity: 'HIGH'
      });
      
      return {
        success: false,
        message: '系統錯誤，請稍後再試'
      };
    }
  },
  
  /**
   * 員工下班打卡
   */
  clockOut(data) {
    try {
      // 驗證輸入數據
      const sanitizedData = ValidationUtils.sanitizeObject(data);
      const validation = ValidationUtils.validateAttendanceData(sanitizedData);
      
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
        
        // 檢查今日是否已打上班卡
        const today = new Date();
        const todayStr = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        
        const clockInRecord = this.getTodayAttendance(sanitizedData.employeeId, '上班', todayStr);
        if (!clockInRecord) {
          return {
            success: false,
            message: '請先打上班卡'
          };
        }
        
        // 檢查今日是否已打下班卡
        const existingClockOut = this.getTodayAttendance(sanitizedData.employeeId, '下班', todayStr);
        if (existingClockOut) {
          return {
            success: false,
            message: '今日已打過下班卡'
          };
        }
        
        // GPS位置驗證
        const locationValidation = this.validateGPSLocation(
          sanitizedData.gpsCoordinates,
          sanitizedData.storeName
        );
        
        if (!locationValidation.valid) {
          return {
            success: false,
            message: locationValidation.message,
            distance: locationValidation.distance
          };
        }
        
        // 設備指紋驗證
        const deviceValidation = this.validateDeviceFingerprint(
          sanitizedData.employeeId,
          sanitizedData.deviceFingerprint
        );
        
        // 計算工作時數
        const workHours = this.calculateWorkHours(clockInRecord.timestamp, today);
        
        // 生成打卡記錄
        const attendanceId = DatabaseUtils.generateId('ATT');
        const attendanceData = [
          attendanceId,
          sanitizedData.employeeId,
          employee.name,
          today,
          '下班',
          sanitizedData.storeName,
          sanitizedData.gpsCoordinates,
          locationValidation.distance,
          sanitizedData.deviceFingerprint,
          sanitizedData.ipAddress || '',
          '正常',
          0, // 下班不計算遲到
          deviceValidation.anomaly || '',
          sanitizedData.photoPath || '',
          today,
          `工作時數: ${workHours.toFixed(1)}小時`
        ];
        
        // 寫入打卡記錄表
        const sheet = getSheet('AttendanceLog');
        sheet.appendRow(attendanceData);
        
        // 準備 Telegram 通知數據
        const notificationData = {
          employeeName: employee.name,
          employeeId: sanitizedData.employeeId,
          timestamp: today.toLocaleString(),
          storeName: sanitizedData.storeName,
          coordinates: sanitizedData.gpsCoordinates,
          distance: locationValidation.distance.toFixed(1),
          deviceInfo: this.getDeviceInfo(sanitizedData.deviceFingerprint),
          status: '正常',
          type: '下班',
          workHours: workHours.toFixed(1)
        };
        
        // 發送 Telegram 通知
        try {
          TelegramUtils.sendAttendanceNotification(notificationData);
        } catch (telegramError) {
          logDebug('Telegram通知發送失敗', telegramError);
        }
        
        logDebug('下班打卡成功', { 
          employeeId: sanitizedData.employeeId, 
          attendanceId: attendanceId,
          workHours: workHours
        });
        
        return {
          success: true,
          message: '下班打卡成功',
          data: {
            attendanceId: attendanceId,
            timestamp: today,
            workHours: workHours,
            distance: locationValidation.distance
          }
        };
        
      } finally {
        lock.releaseLock();
      }
      
    } catch (error) {
      logDebug('下班打卡錯誤', error);
      DatabaseUtils.logError({
        errorId: DatabaseUtils.generateId('ERR'),
        timestamp: new Date().toISOString(),
        functionName: 'clockOut',
        errorMessage: error.message,
        userData: { employeeId: data.employeeId, employeeName: data.employeeName },
        severity: 'HIGH'
      });
      
      return {
        success: false,
        message: '系統錯誤，請稍後再試'
      };
    }
  },
  
  /**
   * GPS位置驗證
   */
  validateGPSLocation(gpsCoordinates, storeName) {
    try {
      if (!gpsCoordinates) {
        return {
          valid: false,
          message: '無法獲取GPS位置，請確認位置權限已開啟',
          distance: 0
        };
      }
      
      const coords = gpsCoordinates.split(',');
      if (coords.length !== 2) {
        return {
          valid: false,
          message: 'GPS座標格式錯誤',
          distance: 0
        };
      }
      
      const userLat = parseFloat(coords[0]);
      const userLng = parseFloat(coords[1]);
      
      // 獲取分店位置資訊
      const settings = DatabaseUtils.getSystemSettings();
      const stores = settings.stores || [];
      const store = stores.find(s => s.name === storeName);
      
      if (!store) {
        return {
          valid: false,
          message: '找不到分店位置資訊',
          distance: 0
        };
      }
      
      // 計算距離
      const distance = this.calculateDistance(userLat, userLng, store.latitude, store.longitude);
      const allowedRadius = store.radius || settings.allowedRadius || 100;
      
      if (distance > allowedRadius) {
        return {
          valid: false,
          message: `距離分店${distance.toFixed(1)}公尺，超出允許範圍${allowedRadius}公尺`,
          distance: distance
        };
      }
      
      return {
        valid: true,
        distance: distance
      };
      
    } catch (error) {
      logDebug('GPS驗證錯誤', error);
      return {
        valid: false,
        message: 'GPS驗證失敗',
        distance: 0
      };
    }
  },
  
  /**
   * 計算兩點間距離（公尺）- 使用Haversine公式
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    // 輸入驗證
    if (typeof lat1 !== 'number' || typeof lng1 !== 'number' || 
        typeof lat2 !== 'number' || typeof lng2 !== 'number') {
      throw new Error('GPS座標必須為數字');
    }
    
    if (lat1 < -90 || lat1 > 90 || lat2 < -90 || lat2 > 90) {
      throw new Error('緯度必須在-90到90之間');
    }
    
    if (lng1 < -180 || lng1 > 180 || lng2 < -180 || lng2 > 180) {
      throw new Error('經度必須在-180到180之間');
    }
    
    const R = 6371000; // 地球半徑(公尺)
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
             Math.cos(φ1) * Math.cos(φ2) *
             Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    // 計算距離並精確到小數點後2位
    const distance = R * c;
    return Math.round(distance * 100) / 100;
  },
  
  /**
   * 設備指紋驗證
   */
  validateDeviceFingerprint(employeeId, currentFingerprint) {
    try {
      if (!currentFingerprint) {
        return {
          valid: true,
          anomaly: '無設備指紋'
        };
      }
      
      // 獲取員工歷史設備指紋
      const historicalFingerprints = this.getEmployeeDeviceHistory(employeeId);
      
      if (historicalFingerprints.length === 0) {
        // 第一次打卡，記錄設備指紋
        return {
          valid: true,
          anomaly: ''
        };
      }
      
      // 檢查設備指紋相似度
      const similarity = this.calculateFingerprintSimilarity(currentFingerprint, historicalFingerprints);
      
      if (similarity < 0.8) {
        return {
          valid: true,
          anomaly: '新設備'
        };
      }
      
      return {
        valid: true,
        anomaly: ''
      };
      
    } catch (error) {
      logDebug('設備指紋驗證錯誤', error);
      return {
        valid: true,
        anomaly: '設備驗證失敗'
      };
    }
  },
  
  /**
   * 獲取員工設備歷史
   */
  getEmployeeDeviceHistory(employeeId) {
    try {
      const sheet = getSheet('AttendanceLog');
      const data = sheet.getDataRange().getValues();
      
      const fingerprints = [];
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === employeeId && data[i][8]) { // 員工編號和設備指紋
          fingerprints.push(data[i][8]);
        }
      }
      
      // 只返回最近30個記錄
      return fingerprints.slice(-30);
    } catch (error) {
      logDebug('獲取設備歷史失敗', error);
      return [];
    }
  },
  
  /**
   * 計算設備指紋相似度
   */
  calculateFingerprintSimilarity(current, historical) {
    try {
      // 簡化的相似度計算
      // 實際應用中可以使用更複雜的演算法
      
      for (const fingerprint of historical) {
        if (fingerprint === current) {
          return 1.0; // 完全相同
        }
      }
      
      // 解析設備指紋進行部分比較
      try {
        const currentData = JSON.parse(atob(current));
        let maxSimilarity = 0;
        
        for (const fingerprint of historical) {
          try {
            const historicalData = JSON.parse(atob(fingerprint));
            let similarity = 0;
            let totalFields = 0;
            
            // 比較各個欄位
            for (const key in currentData) {
              if (historicalData.hasOwnProperty(key)) {
                totalFields++;
                if (currentData[key] === historicalData[key]) {
                  similarity++;
                }
              }
            }
            
            const similarityRatio = totalFields > 0 ? similarity / totalFields : 0;
            if (similarityRatio > maxSimilarity) {
              maxSimilarity = similarityRatio;
            }
          } catch (e) {
            // 忽略解析錯誤的指紋
          }
        }
        
        return maxSimilarity;
      } catch (e) {
        // 如果無法解析，返回低相似度
        return 0.3;
      }
    } catch (error) {
      logDebug('計算指紋相似度失敗', error);
      return 0;
    }
  },
  
  /**
   * 計算遲到時間
   */
  calculateLateTime(currentTime, attendanceType) {
    try {
      const settings = DatabaseUtils.getSystemSettings();
      const workingHours = settings.workingHours || { morning: "09:00", evening: "21:00" };
      
      if (attendanceType !== '上班') {
        return { isLate: false, lateMinutes: 0 };
      }
      
      // 解析上班時間
      const [expectedHour, expectedMinute] = workingHours.morning.split(':').map(Number);
      
      const expectedTime = new Date(currentTime);
      expectedTime.setHours(expectedHour, expectedMinute, 0, 0);
      
      if (currentTime <= expectedTime) {
        return { isLate: false, lateMinutes: 0 };
      }
      
      const lateMinutes = Math.floor((currentTime - expectedTime) / (1000 * 60));
      return { isLate: true, lateMinutes: lateMinutes };
      
    } catch (error) {
      logDebug('計算遲到時間失敗', error);
      return { isLate: false, lateMinutes: 0 };
    }
  },
  
  /**
   * 計算工作時數
   */
  calculateWorkHours(clockInTime, clockOutTime) {
    try {
      const timeDiff = clockOutTime - new Date(clockInTime);
      return timeDiff / (1000 * 60 * 60); // 轉換為小時
    } catch (error) {
      logDebug('計算工作時數失敗', error);
      return 0;
    }
  },
  
  /**
   * 獲取今日打卡記錄
   */
  getTodayAttendance(employeeId, type, dateStr) {
    try {
      const sheet = getSheet('AttendanceLog');
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        const recordEmployeeId = data[i][1];
        const recordType = data[i][4];
        const recordDate = new Date(data[i][3]);
        const recordDateStr = Utilities.formatDate(recordDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        
        if (recordEmployeeId === employeeId && recordType === type && recordDateStr === dateStr) {
          return {
            recordId: data[i][0],
            timestamp: data[i][3],
            status: data[i][10]
          };
        }
      }
      
      return null;
    } catch (error) {
      logDebug('獲取今日打卡記錄失敗', error);
      return null;
    }
  },
  
  /**
   * 獲取月度遲到分鐘數
   */
  getMonthlyLateMinutes(employeeId) {
    try {
      const sheet = getSheet('AttendanceLog');
      const data = sheet.getDataRange().getValues();
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      let totalLateMinutes = 0;
      
      for (let i = 1; i < data.length; i++) {
        const recordEmployeeId = data[i][1];
        const recordDate = new Date(data[i][3]);
        const lateMinutes = data[i][11] || 0;
        
        if (recordEmployeeId === employeeId && 
            recordDate.getMonth() === currentMonth && 
            recordDate.getFullYear() === currentYear) {
          totalLateMinutes += Number(lateMinutes);
        }
      }
      
      return totalLateMinutes;
    } catch (error) {
      logDebug('獲取月度遲到分鐘數失敗', error);
      return 0;
    }
  },
  
  /**
   * 獲取打卡歷史
   */
  getAttendanceHistory(data) {
    try {
      const { employeeId, startDate, endDate, limit = 50 } = data;
      
      if (!employeeId) {
        return {
          success: false,
          message: '員工ID不能為空'
        };
      }
      
      const sheet = getSheet('AttendanceLog');
      const allData = sheet.getDataRange().getValues();
      
      const records = [];
      
      for (let i = 1; i < allData.length && records.length < limit; i++) {
        const recordEmployeeId = allData[i][1];
        const recordDate = new Date(allData[i][3]);
        
        if (recordEmployeeId === employeeId) {
          // 日期篩選
          if (startDate && recordDate < new Date(startDate)) continue;
          if (endDate && recordDate > new Date(endDate)) continue;
          
          records.push({
            recordId: allData[i][0],
            attendanceTime: allData[i][3],
            type: allData[i][4],
            storeName: allData[i][5],
            distance: allData[i][7],
            status: allData[i][10],
            lateMinutes: allData[i][11],
            notes: allData[i][15]
          });
        }
      }
      
      return {
        success: true,
        data: records.reverse() // 最新的在前面
      };
      
    } catch (error) {
      logDebug('獲取打卡歷史失敗', error);
      return {
        success: false,
        message: '獲取打卡歷史失敗'
      };
    }
  },
  
  /**
   * 從設備指紋獲取設備資訊
   */
  getDeviceInfo(deviceFingerprint) {
    try {
      if (!deviceFingerprint) {
        return '未知設備';
      }
      
      const deviceData = JSON.parse(atob(deviceFingerprint));
      const userAgent = deviceData.userAgent || '';
      
      if (userAgent.includes('iPhone')) {
        return 'iPhone';
      } else if (userAgent.includes('Android')) {
        return 'Android';
      } else if (userAgent.includes('Windows')) {
        return 'Windows';
      } else {
        return '其他設備';
      }
    } catch (error) {
      return '未知設備';
    }
  }
  
};