/**
 * 數據庫工具模組 - 統一管理 Google Sheets 數據操作
 */

const DatabaseUtils = {
  
  /**
   * 獲取系統設定
   */
  getSystemSettings() {
    try {
      const sheet = getSheet('SystemSettings');
      const data = sheet.getDataRange().getValues();
      const settings = {};
      
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const category = row[0];
        const name = row[1];
        const value = row[2];
        
        try {
          // 嘗試解析 JSON 格式的設定值
          settings[name] = JSON.parse(value);
        } catch (e) {
          // 如果不是 JSON，直接使用字串值
          settings[name] = value;
        }
      }
      
      return settings;
    } catch (error) {
      throw new Error(`獲取系統設定失敗: ${error.message}`);
    }
  },
  
  /**
   * 更新系統設定
   */
  updateSystemSettings(settingsData) {
    try {
      const sheet = getSheet('SystemSettings');
      const lock = LockService.getScriptLock();
      lock.waitLock(30000);
      
      try {
        // 清空現有設定 (保留標題行)
        const lastRow = sheet.getLastRow();
        if (lastRow > 1) {
          sheet.deleteRows(2, lastRow - 1);
        }
        
        // 寫入新設定
        const rows = [];
        for (const [category, settings] of Object.entries(settingsData)) {
          for (const [name, value] of Object.entries(settings)) {
            rows.push([
              category,
              name,
              typeof value === 'object' ? JSON.stringify(value) : value,
              `${category}的${name}設定`,
              new Date(),
              '系統管理員'
            ]);
          }
        }
        
        if (rows.length > 0) {
          sheet.getRange(2, 1, rows.length, 6).setValues(rows);
        }
        
        return { success: true, updatedCount: rows.length };
      } finally {
        lock.releaseLock();
      }
      
    } catch (error) {
      throw new Error(`更新系統設定失敗: ${error.message}`);
    }
  },
  
  /**
   * 初始化系統設定
   */
  initializeSystemSettings() {
    try {
      const sheet = getSheet('SystemSettings');
      
      // 設定標題行
      const headers = ['參數類別', '參數名稱', '參數值', '說明', '最後更新時間', '更新人員'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // 初始化預設設定
      const defaultSettings = {
        'stores': {
          'stores': [
            {
              "id": "STORE001",
              "name": "內壢店",
              "address": "桃園市中壢區中正路50號",
              "latitude": 24.9748412,
              "longitude": 121.2556713,
              "radius": 100,
              "phone": "03-4567890",
              "manager": "EMP002"
            },
            {
              "id": "STORE002", 
              "name": "桃園店",
              "address": "桃園市桃園區民生路150號",
              "latitude": 24.9880023,
              "longitude": 121.2812737,
              "radius": 100,
              "phone": "03-3334455",
              "manager": "EMP003"
            }
          ]
        },
        'bonus': {
          'weekdayThreshold': 13000,
          'weekdayRate': 0.30,
          'holidayThreshold': 0,
          'holidayRate': 0.38
        },
        'attendance': {
          'allowedRadius': 100,
          'lateThreshold': 10,
          'workingHours': {
            "morning": "09:00",
            "evening": "21:00"
          }
        },
        'telegram': {
          'botToken': CONFIG.TELEGRAM_BOT_TOKEN,
          'bossGroupId': CONFIG.TELEGRAM_BOSS_GROUP,
          'employeeGroupId': CONFIG.TELEGRAM_EMPLOYEE_GROUP
        }
      };
      
      this.updateSystemSettings(defaultSettings);
      return { success: true, message: '系統設定初始化完成' };
      
    } catch (error) {
      throw new Error(`初始化系統設定失敗: ${error.message}`);
    }
  },
  
  /**
   * 初始化職位設定
   */
  initializePositions() {
    try {
      const sheet = getSheet('Positions');
      
      // 設定標題行
      const headers = ['職位ID', '職位名稱', '職位階級', '薪資', '獎金比例', '總名額', 
                      '任職需滿天數', '失敗緩衝天數', '升遷所需同意比例', '投票持續天數', 
                      '懲罰規則', '備註'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // 初始化預設職位
      const defaultPositions = [
        ['POS001', '店員', 1, 30000, 1.0, 20, 0, 30, 0.5, 7, '{"demote_days": 0}', '基層員工'],
        ['POS002', '資深店員', 2, 35000, 1.1, 10, 90, 60, 0.6, 7, '{"demote_days": 30}', '經驗豐富的店員'],
        ['POS003', '副店長', 3, 45000, 1.2, 5, 180, 90, 0.7, 7, '{"demote_days": 60}', '分店副主管'],
        ['POS004', '店長', 4, 60000, 1.5, 2, 365, 180, 0.8, 14, '{"demote_days": 90}', '分店主管']
      ];
      
      sheet.getRange(2, 1, defaultPositions.length, defaultPositions[0].length).setValues(defaultPositions);
      return { success: true, message: '職位設定初始化完成' };
      
    } catch (error) {
      throw new Error(`初始化職位設定失敗: ${error.message}`);
    }
  },
  
  /**
   * 生成唯一ID
   */
  generateId(prefix) {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  },
  
  /**
   * 生成員工編號
   */
  generateEmployeeId() {
    try {
      const sheet = getSheet('Employees');
      const data = sheet.getDataRange().getValues();
      
      // 找出當前最大的員工編號
      let maxNumber = 0;
      for (let i = 1; i < data.length; i++) {
        const empId = data[i][0];
        if (empId && empId.startsWith('EMP')) {
          const number = parseInt(empId.substring(3));
          if (number > maxNumber) {
            maxNumber = number;
          }
        }
      }
      
      // 生成新的員工編號
      const newNumber = (maxNumber + 1).toString().padStart(3, '0');
      return `EMP${newNumber}`;
      
    } catch (error) {
      // 如果發生錯誤，使用時間戳生成
      return this.generateId('EMP');
    }
  },
  
  /**
   * 檢查員工ID是否存在
   */
  employeeExists(employeeId) {
    try {
      const sheet = getSheet('Employees');
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === employeeId) {
          return true;
        }
      }
      return false;
    } catch (error) {
      throw new Error(`檢查員工ID失敗: ${error.message}`);
    }
  },
  
  /**
   * 根據身分證號查找員工
   */
  findEmployeeByIdNumber(idNumber) {
    try {
      const sheet = getSheet('Employees');
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][2] === idNumber) { // C欄是身分證號碼
          return {
            employeeId: data[i][0],
            name: data[i][1],
            idNumber: data[i][2],
            position: data[i][9],
            store: data[i][10],
            status: data[i][12]
          };
        }
      }
      return null;
    } catch (error) {
      throw new Error(`查找員工失敗: ${error.message}`);
    }
  },
  
  /**
   * 記錄錯誤到錯誤日誌表
   */
  logError(errorInfo) {
    try {
      const sheet = getSheet('ErrorLog');
      
      // 如果表是空的，加入標題行
      if (sheet.getLastRow() === 0) {
        const headers = ['錯誤ID', '發生時間', '錯誤類型', '函式名稱', '錯誤訊息', 
                        '用戶ID', '用戶姓名', '請求參數', '嚴重程度', '狀態', 
                        '處理人員', '解決時間', '解決方案'];
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      }
      
      const row = [
        errorInfo.errorId,
        errorInfo.timestamp,
        errorInfo.errorType || 'SYSTEM_ERROR',
        errorInfo.functionName,
        errorInfo.errorMessage,
        errorInfo.userData ? errorInfo.userData.employeeId : '',
        errorInfo.userData ? errorInfo.userData.employeeName : '',
        errorInfo.requestData ? JSON.stringify(errorInfo.requestData) : '',
        errorInfo.severity,
        '未處理',
        '',
        '',
        ''
      ];
      
      sheet.appendRow(row);
      return { success: true };
      
    } catch (error) {
      console.error('記錄錯誤失敗:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * 批量讀取數據 - 效能優化
   */
  batchRead(sheetName, startRow = 1, numRows = null) {
    try {
      const sheet = getSheet(sheetName);
      const lastRow = sheet.getLastRow();
      
      if (lastRow === 0) {
        return [];
      }
      
      const endRow = numRows ? Math.min(startRow + numRows - 1, lastRow) : lastRow;
      const numCols = sheet.getLastColumn();
      
      return sheet.getRange(startRow, 1, endRow - startRow + 1, numCols).getValues();
      
    } catch (error) {
      throw new Error(`批量讀取數據失敗: ${error.message}`);
    }
  },
  
  /**
   * 批量寫入數據 - 效能優化
   */
  batchWrite(sheetName, data, startRow = null) {
    try {
      const sheet = getSheet(sheetName);
      const row = startRow || (sheet.getLastRow() + 1);
      
      if (data.length === 0) {
        return { success: true, rowsWritten: 0 };
      }
      
      sheet.getRange(row, 1, data.length, data[0].length).setValues(data);
      return { success: true, rowsWritten: data.length };
      
    } catch (error) {
      throw new Error(`批量寫入數據失敗: ${error.message}`);
    }
  },
  
  /**
   * 清理舊數據 - 數據歸檔
   */
  archiveOldData(sheetName, daysToKeep = 365) {
    try {
      const sheet = getSheet(sheetName);
      const data = this.batchRead(sheetName);
      
      if (data.length <= 1) {
        return { success: true, archivedRows: 0 };
      }
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const rowsToDelete = [];
      
      // 假設時間戳在最後一欄
      for (let i = 1; i < data.length; i++) {
        const rowDate = new Date(data[i][data[i].length - 1]);
        if (rowDate < cutoffDate) {
          rowsToDelete.push(i + 1); // +1 因為 sheet 從 1 開始計數
        }
      }
      
      // 從後往前刪除，避免行號改變
      for (let i = rowsToDelete.length - 1; i >= 0; i--) {
        sheet.deleteRow(rowsToDelete[i]);
      }
      
      return { success: true, archivedRows: rowsToDelete.length };
      
    } catch (error) {
      throw new Error(`歸檔舊數據失敗: ${error.message}`);
    }
  },
  
  /**
   * 備份數據到 Google Drive
   */
  backupToGoogleDrive() {
    try {
      const spreadsheet = getSpreadsheet();
      const driveApp = DriveApp;
      
      // 建立備份資料夾
      const backupFolderName = '員工管理系統備份';
      let backupFolder;
      
      const folders = driveApp.getFoldersByName(backupFolderName);
      if (folders.hasNext()) {
        backupFolder = folders.next();
      } else {
        backupFolder = driveApp.createFolder(backupFolderName);
      }
      
      // 複製試算表
      const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm-ss');
      const backupName = `員工管理系統_備份_${timestamp}`;
      
      const backupFile = spreadsheet.copy(backupName);
      backupFolder.addFile(backupFile);
      driveApp.getRootFolder().removeFile(backupFile);
      
      return { 
        success: true, 
        backupId: backupFile.getId(),
        backupName: backupName,
        backupUrl: backupFile.getUrl()
      };
      
    } catch (error) {
      throw new Error(`備份失敗: ${error.message}`);
    }
  }
  
};