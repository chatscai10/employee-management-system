/**
 * Google Apps Script 主程式 - 企業員工管理系統
 * 處理所有 Web App 請求和 API 端點
 */

// 載入所有模組
eval(Utilities.newBlob(HtmlService.createHtmlOutputFromFile('backend/modules/employee').getContent()).getDataAsString());
eval(Utilities.newBlob(HtmlService.createHtmlOutputFromFile('backend/modules/attendance').getContent()).getDataAsString());
eval(Utilities.newBlob(HtmlService.createHtmlOutputFromFile('backend/modules/revenue').getContent()).getDataAsString());
eval(Utilities.newBlob(HtmlService.createHtmlOutputFromFile('backend/modules/ordering').getContent()).getDataAsString());
eval(Utilities.newBlob(HtmlService.createHtmlOutputFromFile('backend/modules/schedule').getContent()).getDataAsString());
eval(Utilities.newBlob(HtmlService.createHtmlOutputFromFile('backend/modules/promotion').getContent()).getDataAsString());
eval(Utilities.newBlob(HtmlService.createHtmlOutputFromFile('backend/modules/maintenance').getContent()).getDataAsString());
eval(Utilities.newBlob(HtmlService.createHtmlOutputFromFile('backend/utils/database').getContent()).getDataAsString());
eval(Utilities.newBlob(HtmlService.createHtmlOutputFromFile('backend/utils/validation').getContent()).getDataAsString());
eval(Utilities.newBlob(HtmlService.createHtmlOutputFromFile('backend/utils/telegram').getContent()).getDataAsString());

// 系統配置
const CONFIG = {
  TELEGRAM_BOT_TOKEN: PropertiesService.getScriptProperties().getProperty('TELEGRAM_BOT_TOKEN'),
  TELEGRAM_BOSS_GROUP: PropertiesService.getScriptProperties().getProperty('TELEGRAM_BOSS_GROUP'),
  TELEGRAM_EMPLOYEE_GROUP: PropertiesService.getScriptProperties().getProperty('TELEGRAM_EMPLOYEE_GROUP'),
  SHEET_ID: SpreadsheetApp.getActiveSpreadsheet().getId(),
  APP_NAME: '企業員工管理系統',
  VERSION: '2.0.0'
};

/**
 * 處理 GET 請求 - 返回主頁面
 */
function doGet(e) {
  try {
    // 提供 Web App 主頁面
    const html = HtmlService.createTemplateFromFile('frontend/index');
    html.CONFIG = CONFIG;
    
    return html.evaluate()
      .setTitle(CONFIG.APP_NAME)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
      
  } catch (error) {
    console.error('doGet 錯誤:', error);
    return HtmlService.createHtmlOutput(`
      <h1>系統錯誤</h1>
      <p>無法載入應用程式，請稍後再試。</p>
      <p>錯誤詳情：${error.message}</p>
    `);
  }
}

/**
 * 處理 POST 請求 - API 端點路由
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const payload = data.data || {};
    
    // 記錄 API 調用
    logDebug('API 調用', { action, payload: JSON.stringify(payload).substring(0, 200) });
    
    // API 路由表
    const apiRoutes = {
      // 員工管理 API
      'register_employee': () => EmployeeModule.registerEmployee(payload),
      'login_employee': () => EmployeeModule.loginEmployee(payload),
      'get_employee_info': () => EmployeeModule.getEmployeeById(payload.employeeId),
      'update_employee': () => EmployeeModule.updateEmployee(payload),
      'get_employees_by_store': () => EmployeeModule.getEmployeesByStore(payload.storeName),
      
      // 考勤管理 API
      'clock_in': () => AttendanceModule.clockIn(payload),
      'clock_out': () => AttendanceModule.clockOut(payload),
      'submit_attendance': () => AttendanceModule.submitAttendance(payload),
      'get_attendance_history': () => AttendanceModule.getAttendanceHistory(payload),
      'get_attendance_statistics': () => AttendanceModule.getAttendanceStatistics(payload),
      
      // 營收管理 API
      'submit_revenue': () => RevenueModule.submitRevenue(payload),
      'get_revenue_history': () => RevenueModule.getRevenueHistory(payload),
      'get_revenue_statistics': () => RevenueModule.getRevenueStatistics(payload),
      'calculate_bonus': () => RevenueModule.calculateBonus(payload),
      
      // 🆕 訂貨管理 API (新增)
      'submit_order': () => OrderingModule.submitOrder(payload),
      'get_order_history': () => OrderingModule.getOrderHistory(payload),
      'get_supplier_list': () => OrderingModule.getSupplierList(),
      'get_product_catalog': () => OrderingModule.getProductCatalog(payload.category),
      'check_stock_alerts': () => OrderingModule.checkStockLevels(payload.storeName),
      'update_order_status': () => OrderingModule.updateOrderStatus(payload.orderId, payload.status, payload.actualDeliveryDate, payload.anomalyFlag),
      
      // 🆕 排班管理 API (新增)
      'create_schedule': () => ScheduleModule.createSchedule(payload),
      'get_schedule': () => ScheduleModule.getSchedule(payload),
      'update_schedule_status': () => ScheduleModule.updateScheduleStatus(payload.scheduleId, payload.status, payload.updatedBy),
      'get_monthly_work_hours': () => ScheduleModule.getMonthlyWorkHours(payload.employeeId, payload.year, payload.month),
      'get_shift_statistics': () => ScheduleModule.getShiftStatistics(payload),
      'create_batch_schedule': () => ScheduleModule.createBatchSchedule(payload),
      'delete_schedule': () => ScheduleModule.deleteSchedule(payload.scheduleId, payload.deletedBy),
      
      // 🆕 升遷投票 API (新增) 
      'initiate_promotion_vote': () => PromotionModule.initiatePromotionVote(payload),
      'submit_vote': () => PromotionModule.submitVote(payload),
      'get_promotion_vote': () => PromotionModule.getPromotionVoteById(payload.voteId),
      'get_active_promotion_vote': () => PromotionModule.getActivePromotionVote(payload.employeeId),
      'get_vote_history': () => PromotionModule.getVoteHistory(payload),
      
      // 🆕 維修管理 API (新增)
      'submit_maintenance_request': () => MaintenanceModule.submitMaintenanceRequest(payload),
      'update_maintenance_status': () => MaintenanceModule.updateMaintenanceStatus(payload),
      'get_maintenance_records': () => MaintenanceModule.getMaintenanceRecords(payload),
      'get_maintenance_statistics': () => MaintenanceModule.getMaintenanceStatistics(payload),
      'get_pending_maintenance': () => MaintenanceModule.getPendingMaintenanceRequests(payload.storeName),
      'check_overdue_maintenance': () => MaintenanceModule.checkOverdueMaintenanceRequests(),
      'assign_maintainer': () => MaintenanceModule.assignMaintainer(payload.requestId, payload.maintainerId),
      
      // 系統管理 API
      'get_system_settings': () => DatabaseUtils.getSystemSettings(),
      'update_system_settings': () => DatabaseUtils.updateSystemSettings(payload),
      'test_telegram': () => TelegramUtils.testNotification(payload),
      'get_system_status': () => getSystemStatus(),
      
      // 新增：健康檢查端點
      'health_check': () => ({ success: true, status: 'healthy', timestamp: new Date().toISOString() })
    };
    
    // 執行對應的 API 處理函數
    if (apiRoutes[action]) {
      const result = apiRoutes[action]();
      
      // 記錄成功的 API 調用
      logDebug('API 成功', { action, success: result.success });
      
      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
        
    } else {
      // 未知的 API 端點
      const errorResult = {
        success: false,
        error: {
          code: 'UNKNOWN_ACTION',
          message: `未知的 API 動作: ${action}`,
          availableActions: Object.keys(apiRoutes)
        }
      };
      
      logDebug('API 錯誤', { action, error: 'UNKNOWN_ACTION' });
      
      return ContentService
        .createTextOutput(JSON.stringify(errorResult))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    // 全域錯誤處理
    console.error('doPost 錯誤:', error);
    
    const errorResult = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '內部伺服器錯誤',
        details: error.message
      }
    };
    
    // 記錄錯誤到數據庫
    try {
      DatabaseUtils.logError({
        errorId: DatabaseUtils.generateId('ERR'),
        timestamp: new Date().toISOString(),
        functionName: 'doPost',
        errorMessage: error.message,
        stackTrace: error.stack,
        requestData: e.postData ? e.postData.contents.substring(0, 500) : 'N/A',
        severity: 'CRITICAL'
      });
    } catch (logError) {
      console.error('記錄錯誤失敗:', logError);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 獲取系統狀態
 */
function getSystemStatus() {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      version: CONFIG.VERSION,
      appName: CONFIG.APP_NAME,
      sheets: {
        connected: true,
        sheetId: CONFIG.SHEET_ID
      },
      telegram: {
        configured: !!(CONFIG.TELEGRAM_BOT_TOKEN && CONFIG.TELEGRAM_BOSS_GROUP)
      },
      modules: {
        employee: typeof EmployeeModule !== 'undefined',
        attendance: typeof AttendanceModule !== 'undefined', 
        revenue: typeof RevenueModule !== 'undefined',
        ordering: typeof OrderingModule !== 'undefined',
        schedule: typeof ScheduleModule !== 'undefined',
        promotion: typeof PromotionModule !== 'undefined',
        maintenance: typeof MaintenanceModule !== 'undefined'
      },
      database: {}
    };
    
    // 檢查數據表狀態
    try {
      const sheets = ['EmployeeData', 'AttendanceLog', 'RevenueLog', 'OrderLog', 'ScheduleLog', 'PromotionVotes', 'MaintenanceLog'];
      sheets.forEach(sheetName => {
        try {
          const sheet = getSheet(sheetName);
          status.database[sheetName] = {
            exists: true,
            rowCount: sheet.getLastRow(),
            lastModified: sheet.getLastRow() > 0 ? 'Unknown' : 'Empty'
          };
        } catch (error) {
          status.database[sheetName] = {
            exists: false,
            error: error.message
          };
        }
      });
    } catch (error) {
      status.database.error = error.message;
    }
    
    return {
      success: true,
      data: status
    };
    
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'STATUS_ERROR',
        message: '無法獲取系統狀態',
        details: error.message
      }
    };
  }
}

/**
 * 包含其他檔案內容（用於 HTML 模板）
 */
function include(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (error) {
    console.error(`包含檔案錯誤 ${filename}:`, error);
    return `<!-- 無法載入 ${filename}: ${error.message} -->`;
  }
}

/**
 * 初始化系統（首次部署時執行）
 */
function initializeSystem() {
  try {
    console.log('開始初始化系統...');
    
    // 1. 創建必要的工作表
    const requiredSheets = [
      {
        name: 'EmployeeData',
        headers: ['員工編號', '姓名', '身分證號', '出生日期', '性別', '駕照', '手機號碼', '地址', '職位', '分店', '權限', '狀態', '註冊時間', '備註']
      },
      {
        name: 'AttendanceLog', 
        headers: ['記錄ID', '員工編號', '員工姓名', '打卡類型', '打卡時間', '分店名稱', 'GPS座標', '距離', '設備指紋', '異常標記', '照片路徑', '備註']
      },
      {
        name: 'RevenueLog',
        headers: ['記錄ID', '員工編號', '員工姓名', '營業日期', '分店名稱', '現場訂單數', '現場營業額', '外送營業額', '其他收入', '材料成本', '其他支出', '總收入', '總支出', '淨收入', '獎金類別', '獎金金額', '提交時間', '備註']
      },
      {
        name: 'OrderLog',
        headers: ['記錄ID', '員工編號', '員工姓名', '叫貨日期', '分店名稱', '品項清單', '總金額', '供應商', '預計到貨日', '實際到貨日', '狀態', '異常標記', '照片路徑', '提交時間', '備註']
      },
      {
        name: 'ScheduleLog',
        headers: ['班表ID', '員工編號', '員工姓名', '分店名稱', '排班日期', '班別', '開始時間', '結束時間', '職位', '工作時數', '假日', '狀態', '建立者', '建立時間', '備註']
      },
      {
        name: 'PromotionVotes',
        headers: ['投票ID', '申請人ID', '申請人姓名', '分店', '當前職位', '目標職位', '發起日期', '截止日期', '同意票數', '反對票數', '合格投票人數', '狀態', '申請理由', '創建時間', '投票人列表']
      },
      {
        name: 'VoteRecords',
        headers: ['記錄ID', '投票ID', '投票人ID', '投票人姓名', '投票選擇', '投票時間', '投票意見', '投票人職位', '投票人分店']
      },
      {
        name: 'MaintenanceLog',
        headers: ['維修單號', '報修人ID', '報修人姓名', '分店名稱', '設備名稱', '設備位置', '故障描述', '緊急程度', '狀態', '報修時間', '受理時間', '完成時間', '維修人員', '預計完成時間', '維修結果', '照片路徑', '聯絡電話', '維修費用', '備註']
      },
      {
        name: 'NotificationsLog',
        headers: ['通知ID', '通知類型', '發送對象', '通知內容', '發送時間', '發送狀態', 'Telegram訊息ID', '錯誤訊息']
      },
      {
        name: 'ErrorLog',
        headers: ['錯誤ID', '發生時間', '函式名稱', '錯誤訊息', '堆疊追蹤', '用戶數據', '嚴重程度', '請求數據']
      },
      {
        name: 'SystemSettings',
        headers: ['設定鍵', '設定值', '描述', '更新時間']
      }
    ];
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    requiredSheets.forEach(sheetConfig => {
      let sheet = spreadsheet.getSheetByName(sheetConfig.name);
      if (!sheet) {
        console.log(`創建工作表: ${sheetConfig.name}`);
        sheet = spreadsheet.insertSheet(sheetConfig.name);
        
        // 設定標題行
        if (sheetConfig.headers && sheetConfig.headers.length > 0) {
          sheet.getRange(1, 1, 1, sheetConfig.headers.length).setValues([sheetConfig.headers]);
          
          // 設定標題樣式
          const headerRange = sheet.getRange(1, 1, 1, sheetConfig.headers.length);
          headerRange.setBackground('#4285f4');
          headerRange.setFontColor('#ffffff');
          headerRange.setFontWeight('bold');
          headerRange.setWrap(true);
        }
        
        // 凍結標題行
        sheet.setFrozenRows(1);
      }
    });
    
    // 2. 設定系統預設值
    const defaultSettings = [
      ['SYSTEM_NAME', '企業員工管理系統', '系統名稱'],
      ['VERSION', '2.0.0', '系統版本'],
      ['GPS_TOLERANCE', '100', 'GPS打卡容許距離(公尺)'],
      ['LATE_THRESHOLD', '10', '遲到門檻(分鐘)'],
      ['BONUS_RATE_WEEKDAY', '0.05', '平日獎金比例'],
      ['BONUS_RATE_HOLIDAY', '0.08', '假日獎金比例'],
      ['LOW_STOCK_THRESHOLD', '10', '低庫存警告門檻'],
      ['CRITICAL_STOCK_THRESHOLD', '3', '緊急庫存警告門檻'],
      ['VOTE_DURATION_DAYS', '7', '升遷投票期限(天)'],
      ['MAINTENANCE_URGENT_HOURS', '2', '緊急維修處理時間(小時)'],
      ['AUTO_BACKUP_ENABLED', 'true', '自動備份啟用'],
      ['NOTIFICATION_ENABLED', 'true', '通知功能啟用']
    ];
    
    const settingsSheet = getSheet('SystemSettings');
    if (settingsSheet.getLastRow() <= 1) {
      console.log('設定系統預設值...');
      const currentTime = new Date().toISOString();
      const settingsData = defaultSettings.map(([key, value, desc]) => [key, value, desc, currentTime]);
      settingsSheet.getRange(2, 1, settingsData.length, 4).setValues(settingsData);
    }
    
    // 3. 設定觸發器（定期清理、備份等）
    try {
      // 刪除現有觸發器避免重複
      ScriptApp.getProjectTriggers().forEach(trigger => {
        if (trigger.getHandlerFunction() === 'dailyMaintenance' || 
            trigger.getHandlerFunction() === 'hourlyHealthCheck') {
          ScriptApp.deleteTrigger(trigger);
        }
      });
      
      // 創建每日維護觸發器
      ScriptApp.newTrigger('dailyMaintenance')
        .timeBased()
        .everyDays(1)
        .atHour(2) // 凌晨2點執行
        .create();
        
      // 創建每小時健康檢查觸發器
      ScriptApp.newTrigger('hourlyHealthCheck')
        .timeBased()
        .everyHours(1)
        .create();
        
      console.log('觸發器設定完成');
    } catch (error) {
      console.error('設定觸發器失敗:', error);
    }
    
    console.log('✅ 系統初始化完成！');
    
    // 發送初始化完成通知
    try {
      TelegramUtils.sendSystemNotification('🎉 企業員工管理系統初始化完成！系統已準備就緒。');
    } catch (error) {
      console.log('Telegram通知發送失敗（可能尚未配置）:', error);
    }
    
    return {
      success: true,
      message: '系統初始化完成',
      details: {
        sheetsCreated: requiredSheets.length,
        settingsConfigured: defaultSettings.length,
        triggersCreated: 2
      }
    };
    
  } catch (error) {
    console.error('系統初始化失敗:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 每日維護任務
 */
function dailyMaintenance() {
  try {
    console.log('執行每日維護任務...');
    
    // 1. 檢查逾期維修申請
    MaintenanceModule.checkOverdueMaintenanceRequests();
    
    // 2. 發送每日營運摘要
    TelegramUtils.sendDailySummary();
    
    // 3. 清理過期的錯誤日誌（保留30天）
    cleanupOldLogs('ErrorLog', 30);
    
    // 4. 清理過期的通知日誌（保留7天）
    cleanupOldLogs('NotificationsLog', 7);
    
    console.log('每日維護任務完成');
    
  } catch (error) {
    console.error('每日維護任務失敗:', error);
    
    // 發送維護失敗通知
    try {
      TelegramUtils.sendSystemNotification(`⚠️ 每日維護任務失敗: ${error.message}`);
    } catch (notifError) {
      console.error('維護失敗通知發送失敗:', notifError);
    }
  }
}

/**
 * 每小時健康檢查
 */
function hourlyHealthCheck() {
  try {
    // 簡單的健康檢查，確保系統正常運行
    const status = getSystemStatus();
    
    if (!status.success) {
      throw new Error('系統狀態檢查失敗');
    }
    
    // 記錄健康檢查
    logDebug('健康檢查', { status: 'healthy', timestamp: new Date().toISOString() });
    
  } catch (error) {
    console.error('健康檢查失敗:', error);
    
    // 發送健康檢查失敗通知
    try {
      TelegramUtils.sendSystemNotification(`🚨 系統健康檢查異常: ${error.message}`);
    } catch (notifError) {
      console.error('健康檢查通知發送失敗:', notifError);
    }
  }
}

/**
 * 清理舊日誌
 */
function cleanupOldLogs(sheetName, retentionDays) {
  try {
    const sheet = getSheet(sheetName);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) return; // 只有標題行
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    const rowsToDelete = [];
    
    // 找出需要刪除的行（從底部開始，避免行號變化問題）
    for (let i = data.length - 1; i >= 1; i--) {
      const row = data[i];
      const timestamp = new Date(row[1] || row[4] || row[13]); // 嘗試不同的時間戳欄位
      
      if (timestamp < cutoffDate) {
        rowsToDelete.push(i + 1); // Google Sheets 行號從1開始
      }
    }
    
    // 刪除過期記錄
    rowsToDelete.forEach(rowNumber => {
      sheet.deleteRow(rowNumber);
    });
    
    if (rowsToDelete.length > 0) {
      console.log(`${sheetName}: 清理了 ${rowsToDelete.length} 條過期記錄`);
    }
    
  } catch (error) {
    console.error(`清理 ${sheetName} 失敗:`, error);
  }
}

/**
 * 調試日誌函數
 */
function logDebug(message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  
  if (data) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
  
  // 在開發模式下，也可以寫入到特定的日誌表
  // 這裡為了性能考慮暫時只輸出到控制台
}