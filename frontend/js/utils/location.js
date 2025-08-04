/**
 * GPS定位工具模組 - 處理地理位置相關功能
 */

class LocationUtils {
    constructor() {
        this.watchId = null;
        this.lastKnownPosition = null;
        this.locationTimeout = 15000; // 15秒超時
        this.enableHighAccuracy = true;
        this.maximumAge = 60000; // 1分鐘緩存
    }

    /**
     * 獲取當前位置（一次性）
     */
    async getCurrentPosition(options = {}) {
        return new Promise((resolve, reject) => {
            if (!this.isGeolocationSupported()) {
                reject(new LocationError('此瀏覽器不支援地理位置功能'));
                return;
            }

            const positionOptions = {
                enableHighAccuracy: options.enableHighAccuracy ?? this.enableHighAccuracy,
                timeout: options.timeout ?? this.locationTimeout,
                maximumAge: options.maximumAge ?? this.maximumAge
            };

            const successCallback = (position) => {
                const locationData = this.formatLocationData(position);
                this.lastKnownPosition = locationData;
                this.logLocationEvent('POSITION_SUCCESS', locationData);
                resolve(locationData);
            };

            const errorCallback = (error) => {
                const locationError = this.handleGeolocationError(error);
                this.logLocationEvent('POSITION_ERROR', null, locationError);
                reject(locationError);
            };

            navigator.geolocation.getCurrentPosition(
                successCallback,
                errorCallback,
                positionOptions
            );
        });
    }

    /**
     * 開始監控位置變化
     */
    startWatchingPosition(callback, options = {}) {
        if (!this.isGeolocationSupported()) {
            throw new LocationError('此瀏覽器不支援地理位置功能');
        }

        if (this.watchId !== null) {
            this.stopWatchingPosition();
        }

        const positionOptions = {
            enableHighAccuracy: options.enableHighAccuracy ?? this.enableHighAccuracy,
            timeout: options.timeout ?? this.locationTimeout,
            maximumAge: options.maximumAge ?? this.maximumAge
        };

        const successCallback = (position) => {
            const locationData = this.formatLocationData(position);
            this.lastKnownPosition = locationData;
            this.logLocationEvent('WATCH_SUCCESS', locationData);
            callback(null, locationData);
        };

        const errorCallback = (error) => {
            const locationError = this.handleGeolocationError(error);
            this.logLocationEvent('WATCH_ERROR', null, locationError);
            callback(locationError, null);
        };

        this.watchId = navigator.geolocation.watchPosition(
            successCallback,
            errorCallback,
            positionOptions
        );

        this.logLocationEvent('WATCH_START');
        return this.watchId;
    }

    /**
     * 停止監控位置變化
     */
    stopWatchingPosition() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
            this.logLocationEvent('WATCH_STOP');
        }
    }

    /**
     * 計算兩點間距離（Haversine公式）
     */
    calculateDistance(lat1, lng1, lat2, lng2) {
        if (!this.isValidCoordinate(lat1, lng1) || !this.isValidCoordinate(lat2, lng2)) {
            throw new LocationError('無效的座標參數');
        }

        const R = 6371000; // 地球半徑（公尺）
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lng2 - lng1) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return Math.round(R * c * 100) / 100; // 精確到小數點後2位
    }

    /**
     * 驗證位置是否在允許範圍內
     */
    isWithinRange(userLat, userLng, targetLat, targetLng, allowedRadius) {
        try {
            const distance = this.calculateDistance(userLat, userLng, targetLat, targetLng);
            return {
                isWithin: distance <= allowedRadius,
                distance: distance,
                allowedRadius: allowedRadius,
                difference: distance - allowedRadius
            };
        } catch (error) {
            throw new LocationError(`範圍驗證失敗: ${error.message}`);
        }
    }

    /**
     * 格式化位置數據
     */
    formatLocationData(position) {
        return {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
            formattedTimestamp: new Date(position.timestamp).toISOString(),
            coordinates: `${position.coords.latitude},${position.coords.longitude}`
        };
    }

    /**
     * 檢查地理位置支援
     */
    isGeolocationSupported() {
        return 'geolocation' in navigator;
    }

    /**
     * 驗證座標有效性
     */
    isValidCoordinate(lat, lng) {
        return (
            typeof lat === 'number' && 
            typeof lng === 'number' &&
            lat >= -90 && lat <= 90 &&
            lng >= -180 && lng <= 180 &&
            !isNaN(lat) && !isNaN(lng)
        );
    }

    /**
     * 處理地理位置錯誤
     */
    handleGeolocationError(error) {
        let message = '未知的定位錯誤';
        let code = 'UNKNOWN_ERROR';

        switch (error.code) {
            case error.PERMISSION_DENIED:
                message = '用戶拒絕了定位權限請求';
                code = 'PERMISSION_DENIED';
                break;
            case error.POSITION_UNAVAILABLE:
                message = '無法獲取位置資訊';
                code = 'POSITION_UNAVAILABLE';
                break;
            case error.TIMEOUT:
                message = '定位請求超時';
                code = 'TIMEOUT';
                break;
        }

        return new LocationError(message, code, error);
    }

    /**
     * 獲取位置權限狀態
     */
    async getPermissionStatus() {
        if (!navigator.permissions) {
            return { state: 'unknown', message: '無法檢查權限狀態' };
        }

        try {
            const permission = await navigator.permissions.query({ name: 'geolocation' });
            return {
                state: permission.state,
                message: this.getPermissionMessage(permission.state)
            };
        } catch (error) {
            return { state: 'unknown', message: '檢查權限狀態時發生錯誤' };
        }
    }

    /**
     * 獲取權限狀態說明
     */
    getPermissionMessage(state) {
        switch (state) {
            case 'granted':
                return '已授予定位權限';
            case 'denied':
                return '已拒絕定位權限';
            case 'prompt':
                return '需要請求定位權限';
            default:
                return '未知的權限狀態';
        }
    }

    /**
     * 記錄位置事件
     */
    logLocationEvent(eventType, locationData = null, error = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            eventType: eventType,
            locationData: locationData,
            error: error ? {
                message: error.message,
                code: error.code
            } : null
        };

        // 開發模式下輸出到控制台
        if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
            console.log('[Location Utils]', logEntry);
        }

        // 存儲到本地（用於調試）
        try {
            const logs = JSON.parse(localStorage.getItem('locationLogs') || '[]');
            logs.push(logEntry);
            
            // 只保留最近50條日誌
            if (logs.length > 50) {
                logs.splice(0, logs.length - 50);
            }
            
            localStorage.setItem('locationLogs', JSON.stringify(logs));
        } catch (e) {
            // 忽略存儲錯誤
        }
    }

    /**
     * 獲取最後已知位置
     */
    getLastKnownPosition() {
        return this.lastKnownPosition;
    }

    /**
     * 清除定位日誌
     */
    clearLocationLogs() {
        localStorage.removeItem('locationLogs');
    }

    /**
     * 獲取定位日誌
     */
    getLocationLogs() {
        try {
            return JSON.parse(localStorage.getItem('locationLogs') || '[]');
        } catch (e) {
            return [];
        }
    }

    /**
     * 轉換座標為其他格式
     */
    convertCoordinates(lat, lng, format = 'decimal') {
        if (!this.isValidCoordinate(lat, lng)) {
            throw new LocationError('無效的座標參數');
        }

        switch (format.toLowerCase()) {
            case 'decimal':
                return { latitude: lat, longitude: lng };
            
            case 'dms': // 度分秒格式
                return {
                    latitude: this.decimalToDMS(lat, 'lat'),
                    longitude: this.decimalToDMS(lng, 'lng')
                };
            
            case 'string':
                return `${lat},${lng}`;
            
            default:
                throw new LocationError('不支援的座標格式');
        }
    }

    /**
     * 十進制度數轉度分秒
     */
    decimalToDMS(decimal, type) {
        const absolute = Math.abs(decimal);
        const degrees = Math.floor(absolute);
        const minutesFloat = (absolute - degrees) * 60;
        const minutes = Math.floor(minutesFloat);
        const seconds = Math.round((minutesFloat - minutes) * 60 * 100) / 100;

        const direction = decimal >= 0 ? 
            (type === 'lat' ? 'N' : 'E') : 
            (type === 'lat' ? 'S' : 'W');

        return `${degrees}°${minutes}'${seconds}"${direction}`;
    }
}

/**
 * 位置錯誤類型
 */
class LocationError extends Error {
    constructor(message, code = 'LOCATION_ERROR', originalError = null) {
        super(message);
        this.name = 'LocationError';
        this.code = code;
        this.originalError = originalError;
        this.timestamp = new Date().toISOString();
    }
}

// 全域導出
if (typeof window !== 'undefined') {
    window.LocationUtils = LocationUtils;
    window.LocationError = LocationError;
}