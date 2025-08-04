/**
 * 前端數據驗證工具模組 - 與後端驗證邏輯保持一致
 */

class ValidationUtils {
    constructor() {
        this.errorMessages = {
            required: '此欄位為必填',
            minLength: '長度不能少於 {min} 個字元',
            maxLength: '長度不能超過 {max} 個字元',
            pattern: '格式不正確',
            email: '請輸入有效的電子郵件地址',
            phone: '請輸入有效的手機號碼',
            idNumber: '請輸入有效的身分證號碼',
            date: '請輸入有效的日期',
            number: '請輸入有效的數字',
            positive: '必須為正數',
            range: '數值必須在 {min} 到 {max} 之間'
        };
    }

    /**
     * 驗證台灣身分證號碼
     */
    validateIdNumber(idNumber) {
        if (!idNumber) {
            return { valid: false, message: '身分證號碼不能為空' };
        }

        // 移除空格並轉大寫
        idNumber = idNumber.trim().toUpperCase();

        // 基本格式檢查
        const idPattern = /^[A-Z][12][0-9]{8}$/;
        if (!idPattern.test(idNumber)) {
            return { valid: false, message: '身分證號碼格式不正確（應為1位英文字母+1位數字+8位數字）' };
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

        return { valid: true, formatted: idNumber };
    }

    /**
     * 驗證手機號碼
     */
    validatePhone(phone) {
        if (!phone) {
            return { valid: false, message: '手機號碼不能為空' };
        }

        // 移除空格和特殊字元
        phone = phone.replace(/[\s\-\(\)]/g, '');

        // 台灣手機號碼格式：09開頭，共10碼
        const phonePattern = /^09[0-9]{8}$/;
        if (!phonePattern.test(phone)) {
            return { valid: false, message: '手機號碼格式不正確（應為09開頭的10位數字）' };
        }

        return { valid: true, formatted: phone };
    }

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
            const monthDiff = now.getMonth() - date.getMonth();
            const dayDiff = now.getDate() - date.getDate();

            let actualAge = age;
            if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
                actualAge--;
            }

            if (actualAge < 15 || actualAge > 80) {
                return { valid: false, message: '年齡必須在15-80歲之間' };
            }

            return { valid: true, age: actualAge, formatted: date.toISOString().split('T')[0] };
        } catch (error) {
            return { valid: false, message: '出生日期格式錯誤' };
        }
    }

    /**
     * 驗證電子郵件
     */
    validateEmail(email) {
        if (!email) {
            return { valid: false, message: '電子郵件不能為空' };
        }

        email = email.trim().toLowerCase();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailPattern.test(email)) {
            return { valid: false, message: '請輸入有效的電子郵件地址' };
        }

        return { valid: true, formatted: email };
    }

    /**
     * 驗證密碼強度
     */
    validatePassword(password, requirements = {}) {
        const defaultRequirements = {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: false
        };

        const config = { ...defaultRequirements, ...requirements };
        const errors = [];

        if (!password) {
            return { valid: false, message: '密碼不能為空' };
        }

        if (password.length < config.minLength) {
            errors.push(`密碼長度至少需要${config.minLength}個字元`);
        }

        if (config.requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('密碼必須包含至少一個大寫字母');
        }

        if (config.requireLowercase && !/[a-z]/.test(password)) {
            errors.push('密碼必須包含至少一個小寫字母');
        }

        if (config.requireNumbers && !/[0-9]/.test(password)) {
            errors.push('密碼必須包含至少一個數字');
        }

        if (config.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('密碼必須包含至少一個特殊字元');
        }

        return {
            valid: errors.length === 0,
            message: errors.length > 0 ? errors[0] : undefined,
            errors: errors,
            strength: this.calculatePasswordStrength(password)
        };
    }

    /**
     * 計算密碼強度
     */
    calculatePasswordStrength(password) {
        let score = 0;

        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        const strengthLevels = ['很弱', '弱', '普通', '強', '很強'];
        const level = Math.min(Math.floor(score / 1.2), 4);

        return {
            score: score,
            level: level,
            text: strengthLevels[level]
        };
    }

    /**
     * 驗證數字範圍
     */
    validateNumber(value, options = {}) {
        const { min, max, allowFloat = true, required = true } = options;

        if (!value && value !== 0) {
            if (required) {
                return { valid: false, message: '數字不能為空' };
            }
            return { valid: true };
        }

        const num = allowFloat ? parseFloat(value) : parseInt(value);

        if (isNaN(num)) {
            return { valid: false, message: '請輸入有效的數字' };
        }

        if (min !== undefined && num < min) {
            return { valid: false, message: `數值不能小於 ${min}` };
        }

        if (max !== undefined && num > max) {
            return { valid: false, message: `數值不能大於 ${max}` };
        }

        return { valid: true, value: num };
    }

    /**
     * 驗證日期範圍
     */
    validateDateRange(date, options = {}) {
        const { minDate, maxDate, required = true } = options;

        if (!date) {
            if (required) {
                return { valid: false, message: '日期不能為空' };
            }
            return { valid: true };
        }

        try {
            const inputDate = new Date(date);
            
            if (isNaN(inputDate.getTime())) {
                return { valid: false, message: '請輸入有效的日期' };
            }

            if (minDate) {
                const minDateTime = new Date(minDate);
                if (inputDate < minDateTime) {
                    return { valid: false, message: `日期不能早於 ${minDate}` };
                }
            }

            if (maxDate) {
                const maxDateTime = new Date(maxDate);
                if (inputDate > maxDateTime) {
                    return { valid: false, message: `日期不能晚於 ${maxDate}` };
                }
            }

            return { valid: true, date: inputDate };
        } catch (error) {
            return { valid: false, message: '日期格式錯誤' };
        }
    }

    /**
     * 驗證員工註冊數據
     */
    validateEmployeeRegistration(data) {
        const errors = [];

        // 姓名驗證
        if (!data.name || data.name.trim().length < 2) {
            errors.push('姓名至少需要2個字元');
        } else if (data.name.trim().length > 50) {
            errors.push('姓名不能超過50個字元');
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
        } else if (data.address.trim().length > 200) {
            errors.push('地址不能超過200個字元');
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
    }

    /**
     * 驗證營收數據
     */
    validateRevenueData(data) {
        const errors = [];

        // 營業日期驗證
        const dateValidation = this.validateDateRange(data.businessDate, {
            maxDate: new Date().toISOString().split('T')[0],
            required: true
        });
        if (!dateValidation.valid) {
            errors.push(dateValidation.message);
        }

        // 分店驗證
        if (!data.storeName) {
            errors.push('分店名稱不能為空');
        }

        // 數字欄位驗證
        const numericFields = [
            { field: 'orderCount', name: '訂單數量', min: 0 },
            { field: 'fieldOrderRevenue', name: '現場訂單收入', min: 0 },
            { field: 'deliveryRevenue', name: '外送收入', min: 0 },
            { field: 'otherRevenue', name: '其他收入', min: 0 },
            { field: 'materialCost', name: '材料成本', min: 0 },
            { field: 'otherExpense', name: '其他支出', min: 0 }
        ];

        numericFields.forEach(({ field, name, min }) => {
            if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
                const validation = this.validateNumber(data[field], { min, required: false });
                if (!validation.valid) {
                    errors.push(`${name}: ${validation.message}`);
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
    }

    /**
     * 驗證GPS座標
     */
    validateGPSCoordinates(lat, lng) {
        const latValidation = this.validateNumber(lat, { min: -90, max: 90, required: true });
        if (!latValidation.valid) {
            return { valid: false, message: '緯度無效: ' + latValidation.message };
        }

        const lngValidation = this.validateNumber(lng, { min: -180, max: 180, required: true });
        if (!lngValidation.valid) {
            return { valid: false, message: '經度無效: ' + lngValidation.message };
        }

        return { 
            valid: true, 
            coordinates: { 
                latitude: latValidation.value, 
                longitude: lngValidation.value 
            } 
        };
    }

    /**
     * 清理和格式化輸入
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
    }

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

    /**
     * 即時驗證單一欄位
     */
    validateField(fieldName, value, rules = {}) {
        const validations = [];

        // 必填驗證
        if (rules.required && (!value || value.toString().trim() === '')) {
            validations.push({ valid: false, message: this.errorMessages.required });
        }

        // 如果值為空且不是必填，則跳過其他驗證
        if (!value && !rules.required) {
            return { valid: true };
        }

        // 長度驗證
        if (rules.minLength && value.length < rules.minLength) {
            validations.push({ 
                valid: false, 
                message: this.errorMessages.minLength.replace('{min}', rules.minLength) 
            });
        }

        if (rules.maxLength && value.length > rules.maxLength) {
            validations.push({ 
                valid: false, 
                message: this.errorMessages.maxLength.replace('{max}', rules.maxLength) 
            });
        }

        // 格式驗證
        if (rules.pattern && !rules.pattern.test(value)) {
            validations.push({ valid: false, message: rules.message || this.errorMessages.pattern });
        }

        // 特殊類型驗證
        if (rules.type) {
            let typeValidation;
            switch (rules.type) {
                case 'email':
                    typeValidation = this.validateEmail(value);
                    break;
                case 'phone':
                    typeValidation = this.validatePhone(value);
                    break;
                case 'idNumber':
                    typeValidation = this.validateIdNumber(value);
                    break;
                case 'date':
                    typeValidation = this.validateDateRange(value, rules);
                    break;
                case 'number':
                    typeValidation = this.validateNumber(value, rules);
                    break;
            }
            
            if (typeValidation && !typeValidation.valid) {
                validations.push(typeValidation);
            }
        }

        // 返回第一個錯誤，或成功狀態
        const firstError = validations.find(v => !v.valid);
        return firstError || { valid: true };
    }

    /**
     * 獲取錯誤訊息
     */
    getErrorMessage(messageKey, params = {}) {
        let message = this.errorMessages[messageKey] || messageKey;
        
        // 替換參數
        Object.keys(params).forEach(key => {
            message = message.replace(`{${key}}`, params[key]);
        });
        
        return message;
    }

    /**
     * 驗證打卡數據
     */
    validateAttendance(data) {
        const errors = [];

        // 員工ID驗證
        if (!data.employeeId) {
            errors.push('員工ID不能為空');
        }

        // 分店名稱驗證
        if (!data.storeName) {
            errors.push('分店名稱不能為空');
        }

        // 打卡類型驗證
        if (!data.attendanceType || !['上班', '下班'].includes(data.attendanceType)) {
            errors.push('打卡類型必須為上班或下班');
        }

        // GPS座標驗證（如果提供）
        if (data.latitude && data.longitude) {
            const gpsValidation = this.validateGPSCoordinates(data.latitude, data.longitude);
            if (!gpsValidation.valid) {
                errors.push(gpsValidation.message);
            }
        }

        // 設備指紋驗證
        if (!data.deviceFingerprint) {
            errors.push('設備指紋不能為空');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
}

// 全域導出
if (typeof window !== 'undefined') {
    window.ValidationUtils = ValidationUtils;
}