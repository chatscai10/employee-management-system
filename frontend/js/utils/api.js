/**
 * API客戶端工具 - 統一管理所有後端API調用
 */

class APIClient {
    constructor() {
        // 從 HTML meta 或配置中獲取 API 基礎 URL
        this.baseURL = this.getAPIBaseURL();
        this.requestTimeout = 30000; // 30秒超時
        this.retryAttempts = 3; // 重試次數
        this.retryDelay = 1000; // 重試延遲（毫秒）
    }

    /**
     * 獲取API基礎URL
     */
    getAPIBaseURL() {
        // 嘗試從多個來源獲取API URL
        const metaTag = document.querySelector('meta[name="api-base-url"]');
        if (metaTag) {
            return metaTag.getAttribute('content');
        }
        
        // 如果是 Google Apps Script 部署，使用當前域名
        const currentURL = window.location.href;
        if (currentURL.includes('script.google.com')) {
            return currentURL.split('?')[0];
        }
        
        // 開發環境默認值
        return window.location.origin + '/api';
    }

    /**
     * 主要API調用方法
     */
    async call(action, data = {}, options = {}) {
        const requestOptions = {
            timeout: options.timeout || this.requestTimeout,
            retries: options.retries || this.retryAttempts,
            skipAuth: options.skipAuth || false
        };

        for (let attempt = 1; attempt <= requestOptions.retries; attempt++) {
            try {
                const result = await this.makeRequest(action, data, requestOptions);
                
                // 請求成功，返回結果
                if (result.success) {
                    this.logAPICall(action, 'SUCCESS', attempt);
                    return result.data || result;
                } else {
                    // API返回錯誤
                    this.logAPICall(action, 'API_ERROR', attempt, result.error);
                    throw new APIError(result.error?.message || '服務器返回錯誤', result.error);
                }
                
            } catch (error) {
                this.logAPICall(action, 'ERROR', attempt, error);
                
                // 如果是最後一次嘗試，拋出錯誤
                if (attempt === requestOptions.retries) {
                    throw this.handleAPIError(error, action, data);
                }
                
                // 等待後重試
                await this.delay(this.retryDelay * attempt);
            }
        }
    }

    /**
     * 實際的HTTP請求執行
     */
    async makeRequest(action, data, options) {
        const requestPayload = {
            action: action,
            data: data,
            timestamp: new Date().toISOString(),
            clientInfo: this.getClientInfo()
        };

        const requestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestPayload)
        };

        // 添加認證標頭（如果需要）
        if (!options.skipAuth) {
            const authToken = this.getAuthToken();
            if (authToken) {
                requestInit.headers['Authorization'] = `Bearer ${authToken}`;
            }
        }

        // 創建AbortController處理超時
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout);
        requestInit.signal = controller.signal;

        try {
            const response = await fetch(this.baseURL, requestInit);
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new NetworkError(`HTTP ${response.status}: ${response.statusText}`, response.status);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new APIError('服務器返回了非JSON格式的響應');
            }

            return await response.json();

        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new TimeoutError('請求超時');
            }
            
            throw error;
        }
    }

    /**
     * 獲取客戶端資訊
     */
    getClientInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: `${screen.width}x${screen.height}`,
            timestamp: Date.now()
        };
    }

    /**
     * 獲取認證Token
     */
    getAuthToken() {
        try {
            const currentUser = localStorage.getItem('currentUser');
            if (currentUser) {
                const userData = JSON.parse(currentUser);
                return userData.token || userData.employeeId;
            }
        } catch (error) {
            console.warn('無法獲取認證Token:', error);
        }
        return null;
    }

    /**
     * 處理API響應
     */
    handleResponse(response, action) {
        // 標準響應處理
        if (response && typeof response === 'object') {
            if (response.success === true) {
                return response.data || response;
            } else if (response.success === false) {
                throw new APIError(response.message || response.error || 'API調用失敗');
            }
        }
        
        // 如果響應不是標準格式，直接返回
        return response;
    }

    /**
     * 處理錯誤（標準介面）
     */
    handleError(error, context = '') {
        console.error(`API錯誤 ${context}:`, error);
        
        if (error instanceof APIError) {
            return error;
        } else if (error instanceof NetworkError) {
            return new APIError('網絡連接失敗，請檢查網絡設置');
        } else if (error instanceof TimeoutError) {
            return new APIError('請求超時，請稍後再試');
        } else {
            return new APIError('系統錯誤，請稍後再試');
        }
    }

    /**
     * 處理API錯誤
     */
    handleAPIError(error, action, data) {
        // 根據錯誤類型創建適當的錯誤對象
        if (error instanceof APIError || error instanceof NetworkError || error instanceof TimeoutError) {
            return error;
        }

        // 網絡錯誤
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return new NetworkError('網絡連接失敗，請檢查網絡設置');
        }

        // 未知錯誤
        return new APIError('系統錯誤，請稍後再試', { originalError: error.message });
    }

    /**
     * 記錄API調用
     */
    logAPICall(action, status, attempt, error = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            action: action,
            status: status,
            attempt: attempt,
            error: error ? error.message || error : null
        };

        // 開發模式下輸出到控制台
        if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
            console.log('[API Client]', logEntry);
        }

        // 存儲到本地（用於調試）
        try {
            const logs = JSON.parse(localStorage.getItem('apiLogs') || '[]');
            logs.push(logEntry);
            
            // 只保留最近100條日誌
            if (logs.length > 100) {
                logs.splice(0, logs.length - 100);
            }
            
            localStorage.setItem('apiLogs', JSON.stringify(logs));
        } catch (e) {
            // 忽略存儲錯誤
        }
    }

    /**
     * 延遲工具函數
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 獲取API調用日誌（調試用）
     */
    getAPILogs() {
        try {
            return JSON.parse(localStorage.getItem('apiLogs') || '[]');
        } catch (e) {
            return [];
        }
    }

    /**
     * 清除API調用日誌
     */
    clearAPILogs() {
        localStorage.removeItem('apiLogs');
    }

    /**
     * 檢查網絡連接狀態
     */
    async checkConnection() {
        try {
            const result = await this.call('ping', {}, { timeout: 5000, retries: 1 });
            return { connected: true, latency: Date.now() };
        } catch (error) {
            return { connected: false, error: error.message };
        }
    }

    /**
     * 批量API調用
     */
    async batchCall(requests) {
        const results = await Promise.allSettled(
            requests.map(req => this.call(req.action, req.data, req.options))
        );

        return results.map((result, index) => ({
            request: requests[index],
            success: result.status === 'fulfilled',
            data: result.status === 'fulfilled' ? result.value : null,
            error: result.status === 'rejected' ? result.reason : null
        }));
    }
}

/**
 * 自定義錯誤類型
 */
class APIError extends Error {
    constructor(message, details = null) {
        super(message);
        this.name = 'APIError';
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}

class NetworkError extends Error {
    constructor(message, statusCode = null) {
        super(message);
        this.name = 'NetworkError';
        this.statusCode = statusCode;
        this.timestamp = new Date().toISOString();
    }
}

class TimeoutError extends Error {
    constructor(message = '請求超時') {
        super(message);
        this.name = 'TimeoutError';
        this.timestamp = new Date().toISOString();
    }
}

/**
 * API客戶端便利方法
 */
const createAPIClient = () => new APIClient();

// 全域導出
if (typeof window !== 'undefined') {
    window.APIClient = APIClient;
    window.APIError = APIError;
    window.NetworkError = NetworkError;
    window.TimeoutError = TimeoutError;
}