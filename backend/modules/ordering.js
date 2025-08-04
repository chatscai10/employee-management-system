/**
 * 叫貨管理模組 - 處理庫存管理和供應商訂購
 */

const OrderingModule = {
  
  /**
   * 提交叫貨單
   */
  submitOrder(data) {
    try {
      // 清理和驗證輸入數據
      const sanitizedData = ValidationUtils.sanitizeObject(data);
      const validation = ValidationUtils.validateOrderData(sanitizedData);
      
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors
        };
      }
      
      const lock = LockService.getScriptLock();
      lock.waitLock(30000);
      
      try {
        // 生成叫貨單編號
        const orderId = DatabaseUtils.generateId('ORD');
        
        // 計算總金額
        const totalAmount = this.calculateOrderTotal(sanitizedData.items);
        
        // 獲取員工資訊
        const employee = EmployeeModule.getEmployeeById(sanitizedData.employeeId);
        if (!employee) {
          return {
            success: false,
            errors: ['找不到員工資訊']
          };
        }
        
        // 檢查庫存警告
        const stockAlerts = this.checkStockLevels(sanitizedData.storeName, sanitizedData.items);
        
        // 準備叫貨數據
        const orderData = [
          orderId,
          sanitizedData.employeeId,
          employee.name,
          new Date().toISOString().split('T')[0], // 叫貨日期
          sanitizedData.storeName,
          JSON.stringify(sanitizedData.items), // 品項清單JSON
          totalAmount,
          sanitizedData.supplier,
          sanitizedData.expectedDeliveryDate,
          '', // 實際到貨日 (稍後更新)
          '已下單',
          '', // 異常標記
          sanitizedData.photoPath || '',
          new Date().toISOString(), // 提交時間
          sanitizedData.notes || ''
        ];
        
        // 寫入叫貨記錄表
        const sheet = getSheet('OrderLog');
        
        // 如果表是空的，加入標題行
        if (sheet.getLastRow() === 0) {
          const headers = ['記錄ID', '員工編號', '員工姓名', '叫貨日期', '分店名稱', 
                          '品項清單', '總金額', '供應商', '預計到貨日', '實際到貨日', 
                          '狀態', '異常標記', '照片路徑', '提交時間', '備註'];
          sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        }
        
        // 新增叫貨記錄
        sheet.appendRow(orderData);
        
        // 更新庫存警告表
        if (stockAlerts.length > 0) {
          this.updateStockAlerts(sanitizedData.storeName, stockAlerts);
        }
        
        // 發送 Telegram 通知
        const notificationData = {
          orderId: orderId,
          employeeName: employee.name,
          storeName: sanitizedData.storeName,
          supplier: sanitizedData.supplier,
          itemCount: sanitizedData.items.length,
          totalAmount: totalAmount,
          expectedDelivery: sanitizedData.expectedDeliveryDate
        };
        
        try {
          TelegramUtils.sendSystemNotification(
            `📦 <b>新叫貨單</b>\n🆔 單號: ${notificationData.orderId}\n👤 員工: ${notificationData.employeeName}\n🏪 分店: ${notificationData.storeName}\n🏭 供應商: ${notificationData.supplier}\n📋 品項數: ${notificationData.itemCount}\n💰 金額: $${notificationData.totalAmount.toLocaleString()}\n🚚 預計到貨: ${notificationData.expectedDelivery}`
          );
        } catch (telegramError) {
          logDebug('Telegram通知發送失敗', telegramError);
        }
        
        logDebug('叫貨單提交成功', { orderId, employeeName: employee.name });
        
        return {
          success: true,
          orderId: orderId,
          message: '叫貨單提交成功',
          data: {
            orderId: orderId,
            totalAmount: totalAmount,
            stockAlerts: stockAlerts
          }
        };
        
      } finally {
        lock.releaseLock();
      }
      
    } catch (error) {
      logDebug('叫貨單提交錯誤', error);
      DatabaseUtils.logError({
        errorId: DatabaseUtils.generateId('ERR'),
        timestamp: new Date().toISOString(),
        functionName: 'submitOrder',
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
   * 計算叫貨單總金額
   */
  calculateOrderTotal(items) {
    let total = 0;
    
    // 這裡可以連接到產品價格數據庫
    // 目前使用簡化的計算方式
    items.forEach(item => {
      const quantity = parseInt(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      total += quantity * unitPrice;
    });
    
    return Math.round(total * 100) / 100; // 精確到小數點後2位
  },
  
  /**
   * 獲取叫貨歷史
   */
  getOrderHistory(data) {
    try {
      const { employeeId, storeName, startDate, endDate, status } = data;
      
      const sheet = getSheet('OrderLog');
      const orderData = sheet.getDataRange().getValues();
      
      if (orderData.length <= 1) {
        return {
          success: true,
          data: []
        };
      }
      
      const orders = [];
      for (let i = 1; i < orderData.length; i++) {
        const row = orderData[i];
        const order = {
          orderId: row[0],
          employeeId: row[1],
          employeeName: row[2],
          orderDate: row[3],
          storeName: row[4],
          items: this.parseItemsJson(row[5]),
          totalAmount: row[6],
          supplier: row[7],
          expectedDeliveryDate: row[8],
          actualDeliveryDate: row[9],
          status: row[10],
          anomalyFlag: row[11],
          photoPath: row[12],
          submitTime: row[13],
          notes: row[14]
        };
        
        // 應用篩選條件
        if (employeeId && order.employeeId !== employeeId) continue;
        if (storeName && order.storeName !== storeName) continue;
        if (status && order.status !== status) continue;
        
        // 日期範圍篩選
        if (startDate || endDate) {
          const orderDate = new Date(order.orderDate);
          if (startDate && orderDate < new Date(startDate)) continue;
          if (endDate && orderDate > new Date(endDate)) continue;
        }
        
        orders.push(order);
      }
      
      // 按提交時間降序排列
      orders.sort((a, b) => new Date(b.submitTime) - new Date(a.submitTime));
      
      return {
        success: true,
        data: orders
      };
      
    } catch (error) {
      logDebug('獲取叫貨歷史失敗', error);
      return {
        success: false,
        message: '獲取叫貨歷史失敗'
      };
    }
  },
  
  /**
   * 解析品項JSON字串
   */
  parseItemsJson(itemsString) {
    try {
      return JSON.parse(itemsString || '[]');
    } catch (error) {
      logDebug('解析品項JSON失敗', error);
      return [];
    }
  },
  
  /**
   * 檢查庫存警告
   */
  checkStockLevels(storeName, orderItems = null) {
    try {
      // 獲取庫存設定
      const settings = DatabaseUtils.getSystemSettings();
      const stockSettings = settings.stock || {
        lowStockThreshold: 10,
        criticalStockThreshold: 3
      };
      
      // 獲取實際庫存數據 (從InventoryLog表)
      const inventorySheet = getSheet('InventoryLog');
      const inventoryData = inventorySheet.getDataRange().getValues();
      const currentInventory = {};
      
      // 解析庫存數據
      if (inventoryData.length > 1) {
        for (let i = 1; i < inventoryData.length; i++) {
          const row = inventoryData[i];
          const itemName = row[1];
          const storeName = row[2];
          const currentStock = parseInt(row[3]) || 0;
          const minStock = parseInt(row[4]) || 10;
          
          if (storeName === storeName) {
            currentInventory[itemName] = {
              current: currentStock,
              min: minStock
            };
          }
        }
      } else {
        // 如果沒有庫存表，使用模擬數據
        currentInventory = {
          '雞腿': { current: 5, min: 10 },
          '雞翅': { current: 2, min: 15 },
          '薯條': { current: 8, min: 20 },
          '可樂': { current: 1, min: 12 },
          '漢堡肉': { current: 12, min: 15 }
        };
      }
      
      const alerts = [];
      
      // 檢查所有庫存項目
      Object.entries(currentInventory).forEach(([itemName, stock]) => {
        let alertLevel = null;
        
        if (stock.current <= stockSettings.criticalStockThreshold) {
          alertLevel = 'CRITICAL';
        } else if (stock.current <= stockSettings.lowStockThreshold) {
          alertLevel = 'LOW';
        }
        
        if (alertLevel) {
          alerts.push({
            itemName: itemName,
            currentStock: stock.current,
            minimumStock: stock.min,
            alertLevel: alertLevel,
            storeName: storeName,
            timestamp: new Date().toISOString()
          });
        }
      });
      
      return alerts;
      
    } catch (error) {
      logDebug('檢查庫存警告失敗', error);
      return [];
    }
  },
  
  /**
   * 更新庫存警告表
   */
  updateStockAlerts(storeName, alerts) {
    try {
      if (alerts.length === 0) return;
      
      // 這裡可以寫入到庫存警告表
      // 目前只記錄到日誌
      logDebug('庫存警告', { storeName, alerts });
      
      // 發送緊急庫存警告通知
      const criticalAlerts = alerts.filter(alert => alert.alertLevel === 'CRITICAL');
      if (criticalAlerts.length > 0) {
        const alertMessage = `🚨 <b>緊急庫存警告</b>\n🏪 分店: ${storeName}\n` +
          criticalAlerts.map(alert => 
            `⚠️ ${alert.itemName}: 僅剩 ${alert.currentStock} (最低需求: ${alert.minimumStock})`
          ).join('\n');
        
        try {
          TelegramUtils.sendSystemNotification(alertMessage);
        } catch (telegramError) {
          logDebug('庫存警告通知發送失敗', telegramError);
        }
      }
      
    } catch (error) {
      logDebug('更新庫存警告失敗', error);
    }
  },
  
  /**
   * 更新訂單狀態
   */
  updateOrderStatus(orderId, status, actualDeliveryDate = null, anomalyFlag = null) {
    try {
      const lock = LockService.getScriptLock();
      lock.waitLock(30000);
      
      try {
        const sheet = getSheet('OrderLog');
        const data = sheet.getDataRange().getValues();
        
        for (let i = 1; i < data.length; i++) {
          if (data[i][0] === orderId) {
            // 更新狀態
            if (status) sheet.getRange(i + 1, 11).setValue(status);
            
            // 更新實際到貨日
            if (actualDeliveryDate) sheet.getRange(i + 1, 10).setValue(actualDeliveryDate);
            
            // 更新異常標記
            if (anomalyFlag) sheet.getRange(i + 1, 12).setValue(anomalyFlag);
            
            logDebug('訂單狀態更新成功', { orderId, status });
            return { success: true, message: '訂單狀態更新成功' };
          }
        }
        
        return { success: false, message: '找不到指定的訂單' };
        
      } finally {
        lock.releaseLock();
      }
      
    } catch (error) {
      logDebug('更新訂單狀態失敗', error);
      return { success: false, message: '更新訂單狀態失敗' };
    }
  },
  
  /**
   * 獲取供應商列表
   */
  getSupplierList() {
    try {
      // 獲取系統設定中的供應商資訊
      const settings = DatabaseUtils.getSystemSettings();
      const suppliers = settings.suppliers || [
        {
          id: 'SUP001',
          name: 'ABC食材行',
          phone: '03-1234567',
          email: 'abc@example.com',
          category: '食材',
          rating: 4.5
        },
        {
          id: 'SUP002', 
          name: 'XYZ包裝材料',
          phone: '03-7654321',
          email: 'xyz@example.com',
          category: '包材',
          rating: 4.2
        }
      ];
      
      return {
        success: true,
        data: suppliers
      };
      
    } catch (error) {
      logDebug('獲取供應商列表失敗', error);
      return {
        success: false,
        message: '獲取供應商列表失敗',
        data: []
      };
    }
  },
  
  /**
   * 產品目錄管理
   */
  getProductCatalog(category = null) {
    try {
      // 模擬產品目錄 (實際應該從產品資料庫獲取)
      const products = [
        { id: 'P001', name: '雞腿', category: '肉類', unit: '支', unitPrice: 35 },
        { id: 'P002', name: '雞翅', category: '肉類', unit: '支', unitPrice: 25 },
        { id: 'P003', name: '薯條', category: '配菜', unit: '包', unitPrice: 15 },
        { id: 'P004', name: '可樂', category: '飲料', unit: '瓶', unitPrice: 20 },
        { id: 'P005', name: '漢堡肉', category: '肉類', unit: '片', unitPrice: 40 }
      ];
      
      let filteredProducts = products;
      if (category) {
        filteredProducts = products.filter(p => p.category === category);
      }
      
      return {
        success: true,
        data: filteredProducts
      };
      
    } catch (error) {
      logDebug('獲取產品目錄失敗', error);
      return {
        success: false,
        message: '獲取產品目錄失敗',
        data: []
      };
    }
  }
  
};