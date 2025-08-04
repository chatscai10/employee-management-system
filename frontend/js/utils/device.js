/**
 * 設備指紋工具模組 - 生成唯一設備識別
 */

class DeviceUtils {
    constructor() {
        this.fingerprint = null;
        this.fingerprintTimestamp = null;
        this.cacheExpiration = 24 * 60 * 60 * 1000; // 24小時緩存
    }

    /**
     * 生成設備指紋（主要方法）
     */
    async generateFingerprint(forceRefresh = false) {
        // 檢查緩存
        if (!forceRefresh && this.isValidCachedFingerprint()) {
            return this.fingerprint;
        }

        try {
            const components = await this.collectFingerprintComponents();
            const fingerprintString = this.combineComponents(components);
            const hashedFingerprint = await this.hashFingerprint(fingerprintString);
            
            // 創建完整的設備指紋對象
            this.fingerprint = {
                hash: hashedFingerprint,
                components: components,
                timestamp: Date.now(),
                version: '1.0'
            };
            
            this.fingerprintTimestamp = Date.now();
            
            // 保存到localStorage（可選）
            this.saveFingerprintToCache();
            
            this.logDeviceEvent('FINGERPRINT_GENERATED', this.fingerprint);
            return this.fingerprint;
            
        } catch (error) {
            this.logDeviceEvent('FINGERPRINT_ERROR', null, error);
            throw new DeviceError(`設備指紋生成失敗: ${error.message}`);
        }
    }

    /**
     * 收集設備指紋組件
     */
    async collectFingerprintComponents() {
        const components = {};

        try {
            // 基本瀏覽器資訊
            components.userAgent = navigator.userAgent;
            components.language = navigator.language;
            components.languages = navigator.languages ? navigator.languages.join(',') : '';
            components.platform = navigator.platform;
            components.hardwareConcurrency = navigator.hardwareConcurrency || 0;
            components.maxTouchPoints = navigator.maxTouchPoints || 0;

            // 螢幕資訊
            components.screenWidth = screen.width;
            components.screenHeight = screen.height;
            components.screenColorDepth = screen.colorDepth;
            components.screenPixelDepth = screen.pixelDepth;
            components.screenAvailWidth = screen.availWidth;
            components.screenAvailHeight = screen.availHeight;

            // 時區資訊
            components.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            components.timezoneOffset = new Date().getTimezoneOffset();

            // 視窗資訊
            components.windowInnerWidth = window.innerWidth;
            components.windowInnerHeight = window.innerHeight;
            components.windowOuterWidth = window.outerWidth;
            components.windowOuterHeight = window.outerHeight;

            // 瀏覽器功能
            components.cookieEnabled = navigator.cookieEnabled;
            components.doNotTrack = navigator.doNotTrack || 'unspecified';
            components.onlineStatus = navigator.onLine;

            // Canvas指紋
            components.canvasFingerprint = await this.generateCanvasFingerprint();

            // WebGL指紋
            components.webglFingerprint = this.generateWebGLFingerprint();

            // 字體檢測
            components.fonts = await this.detectFonts();

            // 音頻上下文
            components.audioFingerprint = await this.generateAudioFingerprint();

            // 存儲支援
            components.localStorage = this.checkStorageSupport('localStorage');
            components.sessionStorage = this.checkStorageSupport('sessionStorage');
            components.indexedDB = this.checkStorageSupport('indexedDB');

            // 插件資訊（部分瀏覽器支援）
            components.plugins = this.getPluginsInfo();

            // 設備記憶體（如果可用）
            if ('deviceMemory' in navigator) {
                components.deviceMemory = navigator.deviceMemory;
            }

            // 連接資訊（如果可用）
            if ('connection' in navigator) {
                const conn = navigator.connection;
                components.connectionType = conn.effectiveType || 'unknown';
                components.connectionDownlink = conn.downlink || 0;
            }

            return components;

        } catch (error) {
            throw new DeviceError(`收集設備資訊失敗: ${error.message}`);
        }
    }

    /**
     * 生成Canvas指紋
     */
    async generateCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = 200;
            canvas.height = 50;
            
            // 繪製文字
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('Hello 你好 🌟', 2, 15);
            
            // 繪製幾何圖形
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = 'rgb(255,0,255)';
            ctx.beginPath();
            ctx.arc(50, 25, 20, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
            
            return canvas.toDataURL();
        } catch (error) {
            return 'canvas_not_supported';
        }
    }

    /**
     * 生成WebGL指紋
     */
    generateWebGLFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) {
                return 'webgl_not_supported';
            }

            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown';
            const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
            
            return `${vendor}~${renderer}`;
        } catch (error) {
            return 'webgl_error';
        }
    }

    /**
     * 檢測字體
     */
    async detectFonts() {
        const testFonts = [
            'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Georgia',
            'Impact', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings',
            'Microsoft YaHei', 'SimSun', 'SimHei', 'KaiTi', 'FangSong'
        ];

        const availableFonts = [];
        const testString = 'mmmmmmmmmmlli';
        const testSize = '72px';
        const baseFonts = ['monospace', 'sans-serif', 'serif'];

        // 創建測試容器
        const container = document.createElement('span');
        container.style.cssText = 'position:absolute;left:-9999px;font-size:' + testSize + ';';
        document.body.appendChild(container);

        try {
            for (const font of testFonts) {
                let detected = false;
                
                for (const baseFont of baseFonts) {
                    container.style.fontFamily = `"${font}",${baseFont}`;
                    container.textContent = testString;
                    
                    // 測量文字寬度
                    const width = container.offsetWidth;
                    
                    container.style.fontFamily = baseFont;
                    const baseWidth = container.offsetWidth;
                    
                    if (width !== baseWidth) {
                        detected = true;
                        break;
                    }
                }
                
                if (detected) {
                    availableFonts.push(font);
                }
            }
        } finally {
            document.body.removeChild(container);
        }

        return availableFonts.join(',');
    }

    /**
     * 生成音頻指紋
     */
    async generateAudioFingerprint() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const analyser = audioContext.createAnalyser();
            const gainNode = audioContext.createGain();
            const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

            gainNode.gain.value = 0; // 靜音
            oscillator.type = 'triangle';
            oscillator.frequency.value = 10000;

            oscillator.connect(analyser);
            analyser.connect(scriptProcessor);
            scriptProcessor.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.start(0);

            return new Promise((resolve) => {
                let attempt = 0;
                scriptProcessor.onaudioprocess = function(bins) {
                    if (attempt++ > 10) {
                        const floatFreqData = new Float32Array(analyser.frequencyBinCount);
                        analyser.getFloatFrequencyData(floatFreqData);
                        
                        oscillator.stop();
                        scriptProcessor.disconnect();
                        audioContext.close();
                        
                        resolve(floatFreqData.slice(0, 30).join(','));
                        return;
                    }
                };
            });
        } catch (error) {
            return 'audio_not_supported';
        }
    }

    /**
     * 檢查存儲支援
     */
    checkStorageSupport(storageType) {
        try {
            const storage = window[storageType];
            const testKey = '__storage_test__';
            storage.setItem(testKey, 'test');
            storage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * 獲取插件資訊
     */
    getPluginsInfo() {
        try {
            const plugins = [];
            for (let i = 0; i < navigator.plugins.length; i++) {
                const plugin = navigator.plugins[i];
                plugins.push({
                    name: plugin.name,
                    description: plugin.description,
                    filename: plugin.filename
                });
            }
            return plugins.map(p => `${p.name}~${p.description}`).join('|');
        } catch (error) {
            return 'plugins_not_accessible';
        }
    }

    /**
     * 組合指紋組件
     */
    combineComponents(components) {
        const keys = Object.keys(components).sort();
        const values = keys.map(key => `${key}:${components[key]}`);
        return values.join('|');
    }

    /**
     * 對指紋進行雜湊
     */
    async hashFingerprint(fingerprintString) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(fingerprintString);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (error) {
            // 降級到簡單雜湊
            return this.simpleHash(fingerprintString);
        }
    }

    /**
     * 簡單雜湊算法（降級方案）
     */
    simpleHash(str) {
        let hash = 0;
        if (str.length === 0) return hash.toString();
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 轉為32位整數
        }
        
        return Math.abs(hash).toString(16);
    }

    /**
     * 檢查緩存的指紋是否有效
     */
    isValidCachedFingerprint() {
        if (!this.fingerprint || !this.fingerprintTimestamp) {
            return false;
        }
        
        const now = Date.now();
        return (now - this.fingerprintTimestamp) < this.cacheExpiration;
    }

    /**
     * 保存指紋到緩存
     */
    saveFingerprintToCache() {
        try {
            const cacheData = {
                fingerprint: this.fingerprint,
                timestamp: this.fingerprintTimestamp
            };
            localStorage.setItem('deviceFingerprint', JSON.stringify(cacheData));
        } catch (error) {
            // 忽略緩存錯誤
        }
    }

    /**
     * 從緩存載入指紋
     */
    loadFingerprintFromCache() {
        try {
            const cacheData = JSON.parse(localStorage.getItem('deviceFingerprint') || '{}');
            if (cacheData.fingerprint && cacheData.timestamp) {
                this.fingerprint = cacheData.fingerprint;
                this.fingerprintTimestamp = cacheData.timestamp;
                return this.isValidCachedFingerprint();
            }
        } catch (error) {
            // 忽略緩存錯誤
        }
        return false;
    }

    /**
     * 獲取當前設備指紋
     */
    getCurrentFingerprint() {
        return this.fingerprint;
    }

    /**
     * 清除設備指紋緩存
     */
    clearFingerprintCache() {
        this.fingerprint = null;
        this.fingerprintTimestamp = null;
        localStorage.removeItem('deviceFingerprint');
    }

    /**
     * 記錄設備事件
     */
    logDeviceEvent(eventType, data = null, error = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            eventType: eventType,
            data: data,
            error: error ? error.message : null
        };

        // 開發模式下輸出到控制台
        if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
            console.log('[Device Utils]', logEntry);
        }

        // 存儲到本地（用於調試）
        try {
            const logs = JSON.parse(localStorage.getItem('deviceLogs') || '[]');
            logs.push(logEntry);
            
            // 只保留最近30條日誌
            if (logs.length > 30) {
                logs.splice(0, logs.length - 30);
            }
            
            localStorage.setItem('deviceLogs', JSON.stringify(logs));
        } catch (e) {
            // 忽略存儲錯誤
        }
    }

    /**
     * 獲取設備日誌
     */
    getDeviceLogs() {
        try {
            return JSON.parse(localStorage.getItem('deviceLogs') || '[]');
        } catch (e) {
            return [];
        }
    }

    /**
     * 清除設備日誌
     */
    clearDeviceLogs() {
        localStorage.removeItem('deviceLogs');
    }
}

/**
 * 設備錯誤類型
 */
class DeviceError extends Error {
    constructor(message, code = 'DEVICE_ERROR') {
        super(message);
        this.name = 'DeviceError';
        this.code = code;
        this.timestamp = new Date().toISOString();
    }
}

// 全域導出
if (typeof window !== 'undefined') {
    window.DeviceUtils = DeviceUtils;
    window.DeviceError = DeviceError;
}