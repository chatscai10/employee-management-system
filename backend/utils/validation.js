/**
 * 數據驗證工具模組 - 統一管理所有數據驗證邏輯
 */

const ValidationUtils = {
  
  /**
   * 驗證台灣身分證號碼
   */
  validateIdNumber(idNumber) {
    if (!idNumber) {
      return { valid: false, message: '身分證號碼不能為空' };
    }
    
    // 基本格式檢查
    const idPattern = /^[A-Z][12][0-9]{8}$/;
    if (!idPattern.test(idNumber)) {
      return { valid: false, message: '身分證號碼格式不正確' };
    }
    
    // 驗證碼檢查
    const letters = 'ABCDEFGHJKLMNPQRSTUVXYWZIO';
    const letterValues = [1,10,19,28,37,46,55,64,39,73,82,2,11,20,48,29,38,47,56,65,74,83,21,3,12,30];
    
    const firstLetter = idNumber.charAt(0);
    const letterIndex = letters.indexOf(firstLetter);
    
    if (letterIndex === -1) {
      return { valid: false, message: '身分證號碼首字母不正確' };
    }
    
    let sum = Math.floor(letterValues[letterIndex] / 10) + (letterValues[letterIndex] % 10) * 9;
    
    for (let i = 1; i < 9; i++) {
      sum += parseInt(idNumber.charAt(i)) * (9 - i);
    }
    
    const checkDigit = parseInt(idNumber.charAt(9));
    const calculatedCheck = (10 - (sum % 10)) % 10;
    
    if (checkDigit !== calculatedCheck) {
      return { valid: false, message: '身分證號碼驗證碼不正確' };
    }
    
    return { valid: true };
  },
  
  /**
   * 驗證手機號碼
   */
  validatePhone(phone) {
    if (!phone) {
      return { valid: false, message: '手機號碼不能為空' };
    }
    
    // 台灣手機號碼格式：09開頭，共10碼
    const phonePattern = /^09[0-9]{8}$/;
    if (!phonePattern.test(phone)) {
      return { valid: false, message: '手機號碼格式不正確，應為09開頭的10碼數字' };
    }
    
    return { valid: true };
  },
  
  /**
   * 驗證出生日期
   */
  validateBirthDate(birthDate) {
    if (!birthDate) {
      return { valid: false, message: '出生日期不能為空' };
    }
    
    try {
      const date = new Date(birthDate);
      const now = new Date();
      
      // 檢查日期是否有效
      if (isNaN(date.getTime())) {
        return { valid: false, message: '出生日期格式不正確' };
      }
      
      // 檢查是否為未來日期
      if (date > now) {
        return { valid: false, message: '出生日期不能是未來日期' };
      }
      
      // 檢查年齡是否合理 (15-80歲)
      const age = now.getFullYear() - date.getFullYear();
      if (age < 15 || age > 80) {
        return { valid: false, message: '年齡必須在15-80歲之間' };
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, message: '出生日期格式錯誤' };
    }
  },
  
  /**
   * 驗證員工註冊數據
   */
  validateEmployeeRegistration(data) {
    const errors = [];
    
    // 姓名驗證
    if (!data.name || data.name.trim().length < 2) {
      errors.push('姓名至少需要2個字元');
    }
    
    // 身分證號驗證
    const idValidation = this.validateIdNumber(data.idNumber);
    if (!idValidation.valid) {
      errors.push(idValidation.message);
    }
    
    // 出生日期驗證
    const birthValidation = this.validateBirthDate(data.birthDate);
    if (!birthValidation.valid) {
      errors.push(birthValidation.message);
    }
    
    // 性別驗證
    if (!data.gender || !['男', '女'].includes(data.gender)) {
      errors.push('性別必須為男或女');
    }
    
    // 手機號碼驗證
    const phoneValidation = this.validatePhone(data.phone);
    if (!phoneValidation.valid) {
      errors.push(phoneValidation.message);
    }
    
    // 地址驗證
    if (!data.address || data.address.trim().length < 5) {
      errors.push('地址至少需要5個字元');
    }
    
    // 職位驗證
    if (!data.position) {
      errors.push('必須選擇職位');
    }
    
    // 分店驗證
    if (!data.store) {
      errors.push('必須選擇分店');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  },
  
  /**
   * 驗證GPS座標
   */
  validateGPSCoordinates(lat, lng) {
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return { valid: false, message: 'GPS座標必須為數字' };
    }
    
    if (lat < -90 || lat > 90) {
      return { valid: false, message: '緯度必須在-90到90之間' };
    }
    
    if (lng < -180 || lng > 180) {
      return { valid: false, message: '經度必須在-180到180之間' };
    }
    
    return { valid: true };
  },
  
  /**
   * 驗證打卡數據
   */
  validateAttendanceData(data) {
    const errors = [];
    
    // 員工ID驗證
    if (!data.employeeId) {
      errors.push('員工ID不能為空');
    }
    
    // 打卡類型驗證
    if (!data.type || !['上班', '下班'].includes(data.type)) {
      errors.push('打卡類型必須為上班或下班');
    }
    
    // 分店驗證
    if (!data.storeName) {
      errors.push('分店名稱不能為空');
    }
    
    // GPS座標驗證
    if (data.gpsCoordinates) {
      const coords = data.gpsCoordinates.split(',');
      if (coords.length === 2) {
        const lat = parseFloat(coords[0]);
        const lng = parseFloat(coords[1]);
        const gpsValidation = this.validateGPSCoordinates(lat, lng);
        if (!gpsValidation.valid) {
          errors.push(gpsValidation.message);
        }
      } else {
        errors.push('GPS座標格式不正確');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  },
  
  /**
   * 驗證營收數據
   */
  validateRevenueData(data) {
    const errors = [];
    
    // 員工ID驗證
    if (!data.employeeId) {
      errors.push('員工ID不能為空');
    }
    
    // 營業日期驗證
    if (!data.businessDate) {
      errors.push('營業日期不能為空');
    } else {
      const date = new Date(data.businessDate);
      const now = new Date();
      if (date > now) {
        errors.push('營業日期不能是未來日期');
      }
    }
    
    // 分店驗證
    if (!data.storeName) {
      errors.push('分店名稱不能為空');
    }
    
    // 數字欄位驗證
    const numericFields = [
      'orderCount', 'fieldOrderRevenue', 'deliveryRevenue', 'otherRevenue',
      'materialCost', 'otherExpense'
    ];
    
    numericFields.forEach(field => {
      if (data[field] !== undefined && data[field] !== null) {
        const value = parseFloat(data[field]);
        if (isNaN(value) || value < 0) {
          errors.push(`${field} 必須為非負數`);
        }
      }
    });
    
    // 獎金類別驗證
    if (!data.bonusType || !['平日獎金', '假日獎金'].includes(data.bonusType)) {
      errors.push('獎金類別必須為平日獎金或假日獎金');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  },
  
  /**
   * 驗證叫貨數據
   */
  validateOrderData(data) {
    const errors = [];
    
    // 員工ID驗證
    if (!data.employeeId) {
      errors.push('員工ID不能為空');
    }
    
    // 分店驗證
    if (!data.storeName) {
      errors.push('分店名稱不能為空');
    }
    
    // 品項清單驗證
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      errors.push('至少需要一個品項');
    } else {
      data.items.forEach((item, index) => {
        if (!item.name) {
          errors.push(`品項${index + 1}的名稱不能為空`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`品項${index + 1}的數量必須大於0`);
        }
      });
    }
    
    // 供應商驗證
    if (!data.supplier) {
      errors.push('供應商不能為空');
    }
    
    // 預計到貨日驗證
    if (data.expectedDeliveryDate) {
      const deliveryDate = new Date(data.expectedDeliveryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deliveryDate < today) {
        errors.push('預計到貨日不能是過去日期');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  },
  
  /**
   * 驗證升遷投票數據
   */
  validatePromotionVoteData(data) {
    const errors = [];
    
    // 發起人ID驗證
    if (!data.initiatorId) {
      errors.push('發起人ID不能為空');
    }
    
    // 目標職位驗證
    if (!data.targetPosition) {
      errors.push('目標職位不能為空');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  },
  
  /**
   * 驗證投票數據
   */
  validateVoteData(data) {
    const errors = [];
    
    // 投票ID驗證
    if (!data.voteId) {
      errors.push('投票ID不能為空');
    }
    
    // 投票人ID驗證
    if (!data.voterId) {
      errors.push('投票人ID不能為空');
    }
    
    // 投票選擇驗證
    if (!data.choice || !['同意', '反對'].includes(data.choice)) {
      errors.push('投票選擇必須為同意或反對');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  },
  
  /**
   * 驗證維修數據
   */
  validateMaintenanceData(data) {
    const errors = [];
    
    // 員工ID驗證
    if (!data.employeeId) {
      errors.push('員工ID不能為空');
    }
    
    // 分店驗證
    if (!data.storeName) {
      errors.push('分店名稱不能為空');
    }
    
    // 設備名稱驗證
    if (!data.equipmentName) {
      errors.push('設備名稱不能為空');
    }
    
    // 故障描述驗證
    if (!data.description || data.description.trim().length < 5) {
      errors.push('故障描述至少需要5個字元');
    }
    
    // 緊急程度驗證
    if (!data.urgency || !['低', '中', '高', '緊急'].includes(data.urgency)) {
      errors.push('緊急程度必須為低、中、高或緊急');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  },
  
  /**
   * 驗證排班數據
   */
  validateScheduleData(data) {
    const errors = [];
    
    // 員工ID驗證
    if (!data.employeeId) {
      errors.push('員工ID不能為空');
    }
    
    // 分店驗證
    if (!data.storeName) {
      errors.push('分店名稱不能為空');
    }
    
    // 排班日期驗證
    if (!data.scheduleDate) {
      errors.push('排班日期不能為空');
    } else {
      const scheduleDate = new Date(data.scheduleDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (scheduleDate < today) {
        errors.push('排班日期不能是過去日期');
      }
    }
    
    // 班別驗證
    if (!data.shiftType || !['早班', '中班', '晚班', '全天'].includes(data.shiftType)) {
      errors.push('班別必須為早班、中班、晚班或全天');
    }
    
    // 時間驗證
    if (!data.startTime) {
      errors.push('開始時間不能為空');
    }
    
    if (!data.endTime) {
      errors.push('結束時間不能為空');
    }
    
    // 職位驗證
    if (!data.position) {
      errors.push('職位不能為空');
    }
    
    // 建立者驗證
    if (!data.createdBy) {
      errors.push('建立者不能為空');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  },
  
  /**
   * 清理HTML和潛在的惡意腳本
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  },
  
  /**
   * 清理物件中的所有字串欄位
   */
  sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeInput(value);
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
  
};