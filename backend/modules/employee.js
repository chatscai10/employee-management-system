/**
 * 員工管理模組 - 處理員工註冊、登入和資料管理
 */

const EmployeeModule = {
  
  /**
   * 員工註冊功能
   */
  registerEmployee(data) {
    try {
      // 清理和驗證輸入數據
      const sanitizedData = ValidationUtils.sanitizeObject(data);
      const validation = ValidationUtils.validateEmployeeRegistration(sanitizedData);
      
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors
        };
      }
      
      const lock = LockService.getScriptLock();
      lock.waitLock(30000);
      
      try {
        // 檢查身分證號是否已存在
        const existingEmployee = DatabaseUtils.findEmployeeByIdNumber(sanitizedData.idNumber);
        if (existingEmployee) {
          return {
            success: false,
            errors: ['此身分證號碼已被註冊']
          };
        }
        
        // 生成員工編號
        const employeeId = DatabaseUtils.generateEmployeeId();
        
        // 獲取系統設定
        const settings = DatabaseUtils.getSystemSettings();
        const stores = settings.stores || [];
        const positions = this.getAvailablePositions();
        
        // 驗證分店和職位是否有效
        const storeExists = stores.some(store => store.name === sanitizedData.store);
        const positionExists = positions.some(pos => pos.positionName === sanitizedData.position);
        
        if (!storeExists) {
          return {
            success: false,
            errors: ['選擇的分店不存在']
          };
        }
        
        if (!positionExists) {
          return {
            success: false,
            errors: ['選擇的職位不存在']
          };
        }
        
        // 獲取職位薪資資訊
        const positionInfo = positions.find(pos => pos.positionName === sanitizedData.position);
        const salary = positionInfo ? positionInfo.salary : 30000;
        
        // 準備員工數據
        const employeeData = [
          employeeId,
          sanitizedData.name,
          sanitizedData.idNumber,
          sanitizedData.birthDate,
          sanitizedData.gender,
          sanitizedData.drivingLicense || '',
          sanitizedData.phone,
          sanitizedData.address,
          new Date(), // 入職日期
          sanitizedData.position,
          sanitizedData.store,
          salary,
          '在職',
          '員工', // 預設權限
          new Date(), // 提交時間
          new Date(), // 最後更新
          sanitizedData.notes || ''
        ];
        
        // 寫入員工資料表
        const sheet = getSheet('Employees');
        
        // 如果表是空的，加入標題行
        if (sheet.getLastRow() === 0) {
          const headers = ['員工編號', '姓名', '身分證號碼', '出生日期', '性別', '駕照類別',
                          '聯絡電話', '居住地址', '入職日期', '職位', '分店', '薪資',
                          '狀態', '權限等級', '提交時間', '最後更新', '備註'];
          sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        }
        
        // 新增員工資料
        sheet.appendRow(employeeData);
        
        // 發送 Telegram 通知
        const notificationData = {
          employeeName: sanitizedData.name,
          employeeId: employeeId,
          position: sanitizedData.position,
          store: sanitizedData.store,
          registrationTime: new Date().toLocaleString()
        };
        
        try {
          TelegramUtils.sendSystemNotification(
            `🆕 <b>新員工註冊</b>\n👤 姓名: ${notificationData.employeeName}\n🆔 員工編號: ${notificationData.employeeId}\n💼 職位: ${notificationData.position}\n🏪 分店: ${notificationData.store}\n⏰ 註冊時間: ${notificationData.registrationTime}`
          );
        } catch (telegramError) {
          logDebug('Telegram通知發送失敗', telegramError);
        }
        
        logDebug('員工註冊成功', { employeeId, name: sanitizedData.name });
        
        return {
          success: true,
          employeeId: employeeId,
          message: '員工註冊成功',
          data: {
            employeeId: employeeId,
            name: sanitizedData.name,
            position: sanitizedData.position,
            store: sanitizedData.store
          }
        };
        
      } finally {
        lock.releaseLock();
      }
      
    } catch (error) {
      logDebug('員工註冊錯誤', error);
      DatabaseUtils.logError({
        errorId: DatabaseUtils.generateId('ERR'),
        timestamp: new Date().toISOString(),
        functionName: 'registerEmployee',
        errorMessage: error.message,
        userData: { employeeName: data.name },
        severity: 'HIGH'
      });
      
      return {
        success: false,
        errors: ['系統錯誤，請稍後再試']
      };
    }
  },
  
  /**
   * 員工登入驗證
   */
  loginEmployee(data) {
    try {
      const { employeeId, idNumber } = data;
      
      if (!employeeId && !idNumber) {
        return {
          success: false,
          message: '請提供員工編號或身分證號碼'
        };
      }
      
      let employee;
      
      if (idNumber) {
        // 使用身分證號碼登入
        employee = DatabaseUtils.findEmployeeByIdNumber(idNumber);
      } else {
        // 使用員工編號登入
        employee = this.getEmployeeById(employeeId);
      }
      
      if (!employee) {
        return {
          success: false,
          message: '找不到該員工資料'
        };
      }
      
      if (employee.status !== '在職') {
        return {
          success: false,
          message: '該員工目前非在職狀態'
        };
      }
      
      // 更新最後登入時間
      this.updateEmployeeLastLogin(employee.employeeId);
      
      return {
        success: true,
        message: '登入成功',
        data: {
          employeeId: employee.employeeId,
          name: employee.name,
          position: employee.position,
          store: employee.store,
          permission: employee.permission || '員工'
        }
      };
      
    } catch (error) {
      logDebug('員工登入錯誤', error);
      return {
        success: false,
        message: '系統錯誤，請稍後再試'
      };
    }
  },
  
  /**
   * 根據員工ID獲取員工資訊
   */
  getEmployeeById(employeeId) {
    try {
      const sheet = getSheet('Employees');
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === employeeId) {
          return {
            employeeId: data[i][0],
            name: data[i][1],
            idNumber: data[i][2],
            birthDate: data[i][3],
            gender: data[i][4],
            drivingLicense: data[i][5],
            phone: data[i][6],
            address: data[i][7],
            hireDate: data[i][8],
            position: data[i][9],
            store: data[i][10],
            salary: data[i][11],
            status: data[i][12],
            permission: data[i][13],
            submitTime: data[i][14],
            lastUpdate: data[i][15],
            notes: data[i][16]
          };
        }
      }
      
      return null;
    } catch (error) {
      throw new Error(`獲取員工資訊失敗: ${error.message}`);
    }
  },
  
  /**
   * 獲取員工詳細資訊（API端點）
   */
  getEmployeeInfo(employeeId) {
    try {
      if (!employeeId) {
        return {
          success: false,
          message: '員工ID不能為空'
        };
      }
      
      const employee = this.getEmployeeById(employeeId);
      
      if (!employee) {
        return {
          success: false,
          message: '找不到該員工'
        };
      }
      
      // 移除敏感資訊
      const safeEmployeeData = {
        employeeId: employee.employeeId,
        name: employee.name,
        position: employee.position,
        store: employee.store,
        hireDate: employee.hireDate,
        status: employee.status,
        permission: employee.permission
      };
      
      return {
        success: true,
        data: safeEmployeeData
      };
      
    } catch (error) {
      logDebug('獲取員工資訊錯誤', error);
      return {
        success: false,
        message: '系統錯誤'
      };
    }
  },
  
  /**
   * 更新員工最後登入時間
   */
  updateEmployeeLastLogin(employeeId) {
    try {
      const sheet = getSheet('Employees');
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === employeeId) {
          sheet.getRange(i + 1, 16).setValue(new Date()); // 更新最後更新時間
          break;
        }
      }
    } catch (error) {
      logDebug('更新登入時間失敗', error);
    }
  },
  
  /**
   * 獲取可用職位列表
   */
  getAvailablePositions() {
    try {
      const sheet = getSheet('Positions');
      const data = sheet.getDataRange().getValues();
      
      if (data.length <= 1) {
        // 如果沒有職位數據，返回預設職位
        return [
          { positionId: 'POS001', positionName: '店員', salary: 30000 },
          { positionId: 'POS002', positionName: '資深店員', salary: 35000 },
          { positionId: 'POS003', positionName: '副店長', salary: 45000 },
          { positionId: 'POS004', positionName: '店長', salary: 60000 }
        ];
      }
      
      const positions = [];
      for (let i = 1; i < data.length; i++) {
        positions.push({
          positionId: data[i][0],
          positionName: data[i][1],
          level: data[i][2],
          salary: data[i][3],
          bonusMultiplier: data[i][4],
          totalQuota: data[i][5],
          requiredDays: data[i][6]
        });
      }
      
      return positions;
    } catch (error) {
      logDebug('獲取職位列表失敗', error);
      return [];
    }
  },
  
  /**
   * 獲取可用分店列表
   */
  getAvailableStores() {
    try {
      const settings = DatabaseUtils.getSystemSettings();
      return settings.stores || [];
    } catch (error) {
      logDebug('獲取分店列表失敗', error);
      return [];
    }
  },
  
  /**
   * 更新員工資料
   */
  updateEmployee(employeeId, updateData) {
    try {
      // 驗證權限（此功能應該限制管理員使用）
      const validation = ValidationUtils.sanitizeObject(updateData);
      
      const lock = LockService.getScriptLock();
      lock.waitLock(30000);
      
      try {
        const sheet = getSheet('Employees');
        const data = sheet.getDataRange().getValues();
        
        for (let i = 1; i < data.length; i++) {
          if (data[i][0] === employeeId) {
            // 更新指定欄位
            if (updateData.position) sheet.getRange(i + 1, 10).setValue(updateData.position);
            if (updateData.store) sheet.getRange(i + 1, 11).setValue(updateData.store);
            if (updateData.salary) sheet.getRange(i + 1, 12).setValue(updateData.salary);
            if (updateData.status) sheet.getRange(i + 1, 13).setValue(updateData.status);
            if (updateData.permission) sheet.getRange(i + 1, 14).setValue(updateData.permission);
            
            // 更新最後更新時間
            sheet.getRange(i + 1, 16).setValue(new Date());
            
            return { success: true, message: '員工資料更新成功' };
          }
        }
        
        return { success: false, message: '找不到該員工' };
        
      } finally {
        lock.releaseLock();
      }
      
    } catch (error) {
      logDebug('更新員工資料錯誤', error);
      return { success: false, message: '更新失敗' };
    }
  },
  
  /**
   * 獲取員工列表（管理員功能）
   */
  getEmployeeList(filters = {}) {
    try {
      const sheet = getSheet('Employees');
      const data = sheet.getDataRange().getValues();
      
      if (data.length <= 1) {
        return { success: true, data: [] };
      }
      
      const employees = [];
      for (let i = 1; i < data.length; i++) {
        const employee = {
          employeeId: data[i][0],
          name: data[i][1],
          position: data[i][9],
          store: data[i][10],
          status: data[i][12],
          hireDate: data[i][8]
        };
        
        // 應用篩選器
        if (filters.store && employee.store !== filters.store) continue;
        if (filters.position && employee.position !== filters.position) continue;
        if (filters.status && employee.status !== filters.status) continue;
        
        employees.push(employee);
      }
      
      return { success: true, data: employees };
      
    } catch (error) {
      logDebug('獲取員工列表錯誤', error);
      return { success: false, message: '獲取員工列表失敗' };
    }
  },
  
  /**
   * 計算員工在職天數
   */
  calculateWorkingDays(employeeId) {
    try {
      const employee = this.getEmployeeById(employeeId);
      if (!employee || !employee.hireDate) {
        return 0;
      }
      
      const hireDate = new Date(employee.hireDate);
      const today = new Date();
      const diffTime = Math.abs(today - hireDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    } catch (error) {
      logDebug('計算在職天數失敗', error);
      return 0;
    }
  }
  
};