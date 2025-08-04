/**
 * Telegram 通知工具模組 - 統一管理所有 Telegram 通知功能
 */

const TelegramUtils = {
  
  /**
   * 發送 Telegram 訊息的核心函式
   */
  sendMessage(chatId, message, parseMode = 'HTML') {
    try {
      const settings = DatabaseUtils.getSystemSettings();
      const botToken = settings.botToken || CONFIG.TELEGRAM_BOT_TOKEN;
      
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const payload = {
        chat_id: chatId,
        text: message,
        parse_mode: parseMode
      };
      
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify(payload)
      };
      
      const response = UrlFetchApp.fetch(url, options);
      const result = JSON.parse(response.getContentText());
      
      if (result.ok) {
        // 記錄成功的通知
        this.logNotification({
          type: 'MESSAGE',
          target: chatId,
          content: message,
          status: '成功',
          telegramMessageId: result.result.message_id
        });
        
        return { success: true, messageId: result.result.message_id };
      } else {
        throw new Error(`Telegram API錯誤: ${result.description}`);
      }
      
    } catch (error) {
      // 記錄失敗的通知
      this.logNotification({
        type: 'MESSAGE',
        target: chatId,
        content: message,
        status: '失敗',
        error: error.message
      });
      
      throw new Error(`發送Telegram訊息失敗: ${error.message}`);
    }
  },
  
  /**
   * 發送雙通道通知（老闆群組 + 員工群組）
   */
  sendDualChannelNotification(eventType, data) {
    try {
      const settings = DatabaseUtils.getSystemSettings();
      const bossGroupId = settings.bossGroupId || CONFIG.TELEGRAM_BOSS_GROUP;
      const employeeGroupId = settings.employeeGroupId || CONFIG.TELEGRAM_EMPLOYEE_GROUP;
      
      const bossMessage = this.formatBossMessage(eventType, data);
      const employeeMessage = this.formatEmployeeMessage(eventType, data);
      
      const results = [];
      
      // 發送到老闆群組
      if (bossMessage) {
        results.push(this.sendMessage(bossGroupId, bossMessage));
      }
      
      // 發送到員工群組
      if (employeeMessage) {
        results.push(this.sendMessage(employeeGroupId, employeeMessage));
      }
      
      return { success: true, results: results };
      
    } catch (error) {
      throw new Error(`發送雙通道通知失敗: ${error.message}`);
    }
  },
  
  /**
   * 格式化老闆群組訊息
   */
  formatBossMessage(eventType, data) {
    switch (eventType) {
      case 'attendance':
        return `🕐 <b>員工打卡記錄</b>
👤 員工: ${data.employeeName}
⏰ 時間: ${data.timestamp}
🏪 分店: ${data.storeName}
📍 座標: ${data.coordinates}
📏 距離: ${data.distance}公尺
📱 設備: ${data.deviceInfo}
✅ 狀態: ${data.status}
${data.isLate ? `⚠️ 遲到：遲到${data.lateMinutes}分鐘，本月累計共${data.totalLateMinutes}分鐘` : ''}`;

      case 'revenue':
        return `💰 <b>營收記錄</b>
🏪 分店: ${data.storeName}
👤 提交人: ${data.employeeName}
📅 日期: ${data.businessDate}
📝 現場訂單: ${data.orderCount} 張

💵 <b>收入明細:</b>
• 現場訂單: $${data.revenueDetails.field}
• 外送訂單: $${data.revenueDetails.delivery}

💸 <b>支出明細:</b>
• 材料成本: $${data.expenseDetails.material}

📊 <b>總計:</b>
收入總額: $${data.totalRevenue}
支出總額: $${data.totalExpense}
淨收入: $${data.netIncome}

🎁 獎金類別: ${data.bonusType}
💎 今日獎金: $${data.bonus}
📈 訂單平均: $${data.avgOrderValue}/單
📝 備註: ${data.notes || '無'}`;

      case 'order':
        return `📦 <b>叫貨記錄</b>
🏪 分店: ${data.storeName}
👤 叫貨人: ${data.employeeName}
📅 叫貨日期: ${data.orderDate}
🏢 供應商: ${data.supplier}
💰 總金額: $${data.totalAmount}
📋 品項清單:
${data.items.map(item => `• ${item.name} x${item.quantity}`).join('\n')}
📅 預計到貨: ${data.expectedDeliveryDate}`;

      case 'promotion_vote':
        return `🗳️ <b>升遷投票</b>
👤 申請人: ${data.applicantName}
🎯 目標職位: ${data.targetPosition}
📅 發起日期: ${data.initiateDate}
⏰ 截止時間: ${data.deadline}
👍 同意票: ${data.agreeCount}
👎 反對票: ${data.disagreeCount}
📊 狀態: ${data.status}`;

      case 'maintenance':
        return `🔧 <b>維修申請</b>
🏪 分店: ${data.storeName}
👤 報修人: ${data.employeeName}
🔧 設備: ${data.equipmentName}
❗ 緊急程度: ${data.urgency}
📝 問題描述: ${data.description}
📅 報修時間: ${data.reportTime}`;

      case 'schedule':
        return `📅 <b>排班通知</b>
👤 員工: ${data.employeeName}
🏪 分店: ${data.storeName}
📅 日期: ${data.scheduleDate}
🕐 班別: ${data.shiftType}
⏰ 時間: ${data.startTime} - ${data.endTime}
⏱️ 工時: ${data.workHours}小時`;

      case 'vote_result':
        return `🗳️ <b>升遷投票結果</b>
👤 申請人: ${data.applicantName}
🎯 目標職位: ${data.targetPosition}
📊 結果: ${data.result}
👍 同意票: ${data.agreeCount}
👎 反對票: ${data.disagreeCount}
📈 總票數: ${data.totalVotes}`;

      case 'error':
        return `🚨 <b>系統錯誤警報</b>
🆔 錯誤ID: ${data.errorId}
⏰ 發生時間: ${data.timestamp}
🔧 函式: ${data.functionName}
❌ 錯誤: ${data.errorMessage}
👤 用戶: ${data.userData ? data.userData.employeeName : '未知'}
⚠️ 嚴重程度: ${data.severity}`;

      default:
        return null;
    }
  },
  
  /**
   * 格式化員工群組訊息
   */
  formatEmployeeMessage(eventType, data) {
    switch (eventType) {
      case 'attendance':
        return `👋 ${data.employeeName} 到 ${data.storeName} ${data.type === '上班' ? '上班' : '下班'}了~`;

      case 'revenue':
        return `💰 營業額記錄成功
🏪 分店: ${data.storeName}
📅 日期: ${data.businessDate}
🎁 獎金類別: ${data.bonusType}
💎 今日獎金: $${data.bonus}`;

      case 'order':
        return `📦 叫貨申請已提交
🏪 分店: ${data.storeName}
🏢 供應商: ${data.supplier}
💰 金額: $${data.totalAmount}`;

      case 'promotion_vote':
        return `🗳️ 升遷投票通知
👤 ${data.applicantName} 申請升遷至 ${data.targetPosition}
📅 投票截止: ${data.deadline}
請符合條件的同事踴躍投票！`;

      case 'maintenance':
        return `🔧 設備維修通知
🏪 ${data.storeName} 的 ${data.equipmentName} 需要維修
⚠️ 緊急程度: ${data.urgency}`;

      case 'system':
        return data.message;

      default:
        return null;
    }
  },
  
  /**
   * 發送員工打卡通知
   */
  sendAttendanceNotification(attendanceData) {
    return this.sendDualChannelNotification('attendance', attendanceData);
  },
  
  /**
   * 發送營收記錄通知
   */
  sendRevenueNotification(revenueData) {
    return this.sendDualChannelNotification('revenue', revenueData);
  },
  
  /**
   * 發送叫貨通知
   */
  sendOrderNotification(orderData) {
    return this.sendDualChannelNotification('order', orderData);
  },
  
  /**
   * 發送升遷投票通知
   */
  sendPromotionVoteNotification(voteData) {
    return this.sendDualChannelNotification('promotion_vote', voteData);
  },
  
  /**
   * 發送維修申請通知
   */
  sendMaintenanceNotification(maintenanceData) {
    return this.sendDualChannelNotification('maintenance', maintenanceData);
  },
  
  /**
   * 發送排班通知
   */
  sendScheduleNotification(scheduleData) {
    return this.sendDualChannelNotification('schedule', scheduleData);
  },
  
  /**
   * 發送投票結果通知
   */
  sendVoteResultNotification(voteResultData) {
    return this.sendDualChannelNotification('vote_result', voteResultData);
  },
  
  /**
   * 發送緊急維修警告
   */
  sendUrgentMaintenanceAlert(maintenanceData) {
    try {
      const settings = DatabaseUtils.getSystemSettings();
      const bossGroupId = settings.bossGroupId || CONFIG.TELEGRAM_BOSS_GROUP;
      
      const message = `🚨🔧 <b>緊急維修警報</b>
🏪 分店: ${maintenanceData.storeName}
👤 報修人: ${maintenanceData.employeeName}
🔧 設備: ${maintenanceData.equipmentName}
⚠️ 此為緊急維修，請立即處理！
📞 聯絡電話: ${maintenanceData.contactPhone}
📝 問題: ${maintenanceData.description}`;
      
      return this.sendMessage(bossGroupId, message);
      
    } catch (error) {
      console.error('發送緊急維修警告失敗:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * 發送逾期維修警告
   */
  sendOverdueMaintenanceAlert(overdueData) {
    try {
      const settings = DatabaseUtils.getSystemSettings();
      const bossGroupId = settings.bossGroupId || CONFIG.TELEGRAM_BOSS_GROUP;
      
      const message = `⏰🔧 <b>維修逾期警告</b>
📊 逾期維修單數量: ${overdueData.count}

📋 <b>部分逾期清單:</b>
${overdueData.requests.map(req => 
  `• ${req.equipmentName} (${req.storeName}) - ${req.urgency}`
).join('\n')}

請盡快處理逾期維修事項！`;
      
      return this.sendMessage(bossGroupId, message);
      
    } catch (error) {
      console.error('發送逾期維修警告失敗:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * 發送維修分配通知
   */
  sendMaintenanceAssignNotification(assignData) {
    try {
      const settings = DatabaseUtils.getSystemSettings();
      const bossGroupId = settings.bossGroupId || CONFIG.TELEGRAM_BOSS_GROUP;
      
      const message = `👨‍🔧 <b>維修分配通知</b>
🆔 維修單號: ${assignData.requestId}
👤 分配給: ${assignData.maintainerName}
✅ 狀態已更新為處理中`;
      
      return this.sendMessage(bossGroupId, message);
      
    } catch (error) {
      console.error('發送維修分配通知失敗:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * 發送維修完成通知
   */
  sendMaintenanceCompleteNotification(completeData) {
    try {
      const settings = DatabaseUtils.getSystemSettings();
      const bossGroupId = settings.bossGroupId || CONFIG.TELEGRAM_BOSS_GROUP;
      
      const message = `✅ <b>維修完成通知</b>
🆔 維修單號: ${completeData.requestId}
🏪 分店: ${completeData.storeName}
🔧 設備: ${completeData.equipmentName}
👤 報修人: ${completeData.employeeName}
✅ 維修狀態: 已完成`;
      
      return this.sendMessage(bossGroupId, message);
      
    } catch (error) {
      console.error('發送維修完成通知失敗:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * 發送系統錯誤通知
   */
  sendErrorNotification(errorData) {
    try {
      const settings = DatabaseUtils.getSystemSettings();
      const bossGroupId = settings.bossGroupId || CONFIG.TELEGRAM_BOSS_GROUP;
      
      const message = this.formatBossMessage('error', errorData);
      return this.sendMessage(bossGroupId, message);
      
    } catch (error) {
      console.error('發送錯誤通知失敗:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * 發送系統通知
   */
  sendSystemNotification(message) {
    try {
      const settings = DatabaseUtils.getSystemSettings();
      const bossGroupId = settings.bossGroupId || CONFIG.TELEGRAM_BOSS_GROUP;
      
      return this.sendMessage(bossGroupId, `🤖 <b>系統通知</b>\n${message}`);
      
    } catch (error) {
      console.error('發送系統通知失敗:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * 測試 Telegram 通知功能
   */
  testNotification(data) {
    try {
      const testMessage = data.message || '🧪 這是一條測試訊息，系統運行正常！';
      
      // 測試發送到老闆群組
      const settings = DatabaseUtils.getSystemSettings();
      const bossGroupId = settings.bossGroupId || CONFIG.TELEGRAM_BOSS_GROUP;
      
      const result = this.sendMessage(bossGroupId, `🧪 <b>系統測試</b>\n${testMessage}\n⏰ 測試時間: ${new Date().toLocaleString()}`);
      
      return {
        success: true,
        message: '測試訊息發送成功',
        result: result
      };
      
    } catch (error) {
      return {
        success: false,
        message: '測試訊息發送失敗',
        error: error.message
      };
    }
  },
  
  /**
   * 記錄通知到數據庫
   */
  logNotification(notificationData) {
    try {
      const sheet = getSheet('NotificationsLog');
      
      // 如果表是空的，加入標題行
      if (sheet.getLastRow() === 0) {
        const headers = ['通知ID', '通知類型', '發送對象', '通知內容', '發送時間', 
                        '發送狀態', 'Telegram訊息ID', '錯誤訊息'];
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      }
      
      const notificationId = DatabaseUtils.generateId('NOTIF');
      const row = [
        notificationId,
        notificationData.type,
        notificationData.target,
        notificationData.content.substring(0, 500), // 限制長度
        new Date(),
        notificationData.status,
        notificationData.telegramMessageId || '',
        notificationData.error || ''
      ];
      
      sheet.appendRow(row);
      return { success: true, notificationId: notificationId };
      
    } catch (error) {
      console.error('記錄通知失敗:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * 發送每日摘要報告
   */
  sendDailySummary() {
    try {
      const today = new Date();
      const todayStr = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      
      // 獲取今日統計數據
      const stats = this.getDailyStats(todayStr);
      
      const message = `📊 <b>每日營運摘要 - ${todayStr}</b>

👥 <b>出勤統計:</b>
• 正常打卡: ${stats.attendance.normal}人次
• 遲到記錄: ${stats.attendance.late}人次
• 異常記錄: ${stats.attendance.abnormal}人次

💰 <b>營收統計:</b>
• 總營收: $${stats.revenue.total}
• 總支出: $${stats.revenue.expense}
• 淨收入: $${stats.revenue.net}
• 發放獎金: $${stats.revenue.bonus}

📦 <b>叫貨統計:</b>
• 叫貨次數: ${stats.orders.count}次
• 叫貨金額: $${stats.orders.amount}

🔧 <b>維修統計:</b>
• 新增報修: ${stats.maintenance.new}件
• 處理完成: ${stats.maintenance.completed}件

📈 <b>系統健康度:</b>
• 錯誤次數: ${stats.errors.count}次
• 系統狀態: ${stats.errors.count === 0 ? '✅ 正常' : '⚠️ 需關注'}`;

      return this.sendSystemNotification(message);
      
    } catch (error) {
      console.error('發送每日摘要失敗:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * 獲取每日統計數據
   */
  getDailyStats(dateStr) {
    try {
      // 這裡應該實際查詢各個表格的數據
      // 為了示例，返回模擬數據
      return {
        attendance: {
          normal: 8,
          late: 1,
          abnormal: 0
        },
        revenue: {
          total: 25000,
          expense: 8000,
          net: 17000,
          bonus: 3600
        },
        orders: {
          count: 3,
          amount: 5500
        },
        maintenance: {
          new: 1,
          completed: 2
        },
        errors: {
          count: 0
        }
      };
    } catch (error) {
      console.error('獲取每日統計失敗:', error);
      return null;
    }
  }
  
};