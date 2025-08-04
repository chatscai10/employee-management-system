// 📸 照片上傳系統模組
class PhotoUploader {
    constructor() {
        this.API_BASE = 'http://localhost:3002';
        this.currentUser = null;
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        
        this.init();
    }
    
    init() {
        // 從localStorage載入用戶資料
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    }
    
    // 創建照片上傳組件HTML
    createUploadWidget(containerId, options = {}) {
        const {
            multiple = false,
            preview = true,
            dragDrop = true,
            camera = true,
            maxFiles = 5
        } = options;
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('找不到容器:', containerId);
            return;
        }
        
        const widgetHTML = `
            <div class="photo-upload-widget" id="photoWidget_${containerId}">
                <div class="upload-area ${dragDrop ? 'drag-drop-enabled' : ''}" 
                     ondrop="photoUploader.handleDrop(event, '${containerId}')" 
                     ondragover="photoUploader.handleDragOver(event)"
                     ondragleave="photoUploader.handleDragLeave(event)">
                    
                    <div class="upload-icon">📸</div>
                    <div class="upload-text">
                        <p><strong>點擊上傳照片</strong></p>
                        ${dragDrop ? '<p>或拖拽照片到此處</p>' : ''}
                        <p class="upload-hint">支援 JPG, PNG, GIF (最大 5MB)</p>
                    </div>
                    
                    <input type="file" 
                           id="fileInput_${containerId}"
                           accept="image/*" 
                           ${multiple ? 'multiple' : ''}
                           ${camera ? 'capture="camera"' : ''}
                           style="display: none;"
                           onchange="photoUploader.handleFileSelect(event, '${containerId}')">
                    
                    <div class="upload-buttons">
                        <button type="button" class="btn btn-primary" onclick="photoUploader.triggerFileSelect('${containerId}')">
                            📁 選擇檔案
                        </button>
                        ${camera ? `
                            <button type="button" class="btn btn-secondary" onclick="photoUploader.openCamera('${containerId}')">
                                📷 拍照
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                ${preview ? `
                    <div class="photo-preview-area" id="preview_${containerId}">
                        <!-- 照片預覽將顯示在這裡 -->
                    </div>
                ` : ''}
                
                <div class="upload-progress" id="progress_${containerId}" style="display: none;">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="progress-text">上傳中... 0%</div>
                </div>
            </div>
        `;
        
        container.innerHTML = widgetHTML;
        this.addStyles();
        
        return {
            getFiles: () => this.getUploadedFiles(containerId),
            clearFiles: () => this.clearFiles(containerId),
            disable: () => this.setEnabled(containerId, false),
            enable: () => this.setEnabled(containerId, true)
        };
    }
    
    addStyles() {
        if (document.getElementById('photoUploaderStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'photoUploaderStyles';
        style.textContent = `
            .photo-upload-widget {
                width: 100%;
                margin: 15px 0;
            }
            
            .upload-area {
                border: 2px dashed #ddd;
                border-radius: 10px;
                padding: 30px;
                text-align: center;
                background: #fafafa;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .upload-area:hover {
                border-color: #667eea;
                background: #f0f4ff;
            }
            
            .upload-area.drag-over {
                border-color: #667eea;
                background: #e3f2fd;
                transform: scale(1.02);
            }
            
            .upload-icon {
                font-size: 3em;
                margin-bottom: 15px;
            }
            
            .upload-text p {
                margin: 5px 0;
                color: #666;
            }
            
            .upload-hint {
                font-size: 12px !important;
                color: #999 !important;
            }
            
            .upload-buttons {
                margin-top: 20px;
                display: flex;
                gap: 10px;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s;
            }
            
            .btn-primary {
                background: #667eea;
                color: white;
            }
            
            .btn-primary:hover {
                background: #5a67d8;
                transform: translateY(-2px);
            }
            
            .btn-secondary {
                background: #f0f0f0;
                color: #333;
            }
            
            .btn-secondary:hover {
                background: #e0e0e0;
            }
            
            .photo-preview-area {
                margin-top: 20px;
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: 15px;
            }
            
            .photo-preview-item {
                position: relative;
                border-radius: 8px;
                overflow: hidden;
                background: #f9f9f9;
                border: 1px solid #eee;
            }
            
            .photo-preview-img {
                width: 100%;
                height: 120px;
                object-fit: cover;
                display: block;
            }
            
            .photo-preview-info {
                padding: 10px;
                font-size: 12px;
                color: #666;
                background: white;
            }
            
            .photo-preview-name {
                font-weight: bold;
                margin-bottom: 5px;
                word-break: break-all;
            }
            
            .photo-preview-size {
                color: #999;
            }
            
            .photo-remove-btn {
                position: absolute;
                top: 5px;
                right: 5px;
                background: rgba(255, 0, 0, 0.8);
                color: white;
                border: none;
                border-radius: 50%;
                width: 25px;
                height: 25px;
                cursor: pointer;
                font-size: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .photo-remove-btn:hover {
                background: rgba(255, 0, 0, 1);
            }
            
            .upload-progress {
                margin-top: 15px;
                padding: 10px;
                background: #f9f9f9;
                border-radius: 6px;
            }
            
            .progress-bar {
                width: 100%;
                height: 8px;
                background: #eee;
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 5px;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #667eea, #764ba2);
                transition: width 0.3s ease;
            }
            
            .progress-text {
                text-align: center;
                font-size: 12px;
                color: #666;
            }
            
            .photo-upload-disabled {
                opacity: 0.6;
                pointer-events: none;
            }
            
            @media (max-width: 600px) {
                .upload-area {
                    padding: 20px 15px;
                }
                
                .upload-buttons {
                    flex-direction: column;
                    align-items: center;
                }
                
                .btn {
                    width: 100%;
                    max-width: 200px;
                }
                
                .photo-preview-area {
                    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                    gap: 10px;
                }
                
                .photo-preview-img {
                    height: 100px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    triggerFileSelect(containerId) {
        document.getElementById(`fileInput_${containerId}`).click();
    }
    
    openCamera(containerId) {
        // 使用 HTML5 getUserMedia API 開啟相機
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            this.showCameraModal(containerId);
        } else {
            // 降級到檔案選擇器，但設定capture屬性
            const input = document.getElementById(`fileInput_${containerId}`);
            input.setAttribute('capture', 'camera');
            input.click();
        }
    }
    
    showCameraModal(containerId) {
        const modalHTML = `
            <div id="cameraModal" class="camera-modal">
                <div class="camera-modal-overlay" onclick="photoUploader.closeCameraModal()"></div>
                <div class="camera-modal-content">
                    <div class="camera-header">
                        <h3>📷 拍攝照片</h3>
                        <button class="close-btn" onclick="photoUploader.closeCameraModal()">&times;</button>
                    </div>
                    <div class="camera-body">
                        <video id="cameraVideo" autoplay playsinline></video>
                        <canvas id="cameraCanvas" style="display: none;"></canvas>
                    </div>
                    <div class="camera-controls">
                        <button class="btn btn-primary" onclick="photoUploader.capturePhoto('${containerId}')">
                            📸 拍照
                        </button>
                        <button class="btn btn-secondary" onclick="photoUploader.closeCameraModal()">
                            取消
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.addCameraStyles();
        this.startCamera();
    }
    
    addCameraStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .camera-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .camera-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
            }
            
            .camera-modal-content {
                position: relative;
                background: white;
                border-radius: 15px;
                max-width: 500px;
                width: 90%;
                overflow: hidden;
            }
            
            .camera-header {
                background: #667eea;
                color: white;
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .camera-header h3 {
                margin: 0;
            }
            
            .camera-body {
                padding: 20px;
                text-align: center;
            }
            
            #cameraVideo {
                width: 100%;
                max-width: 400px;
                border-radius: 10px;
            }
            
            .camera-controls {
                padding: 20px;
                display: flex;
                gap: 10px;
                justify-content: center;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    async startCamera() {
        try {
            const video = document.getElementById('cameraVideo');
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment' // 後置攝像頭
                } 
            });
            video.srcObject = stream;
            this.currentStream = stream;
        } catch (error) {
            console.error('無法啟動相機:', error);
            alert('無法啟動相機，請檢查權限設定');
            this.closeCameraModal();
        }
    }
    
    capturePhoto(containerId) {
        const video = document.getElementById('cameraVideo');
        const canvas = document.getElementById('cameraCanvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
            const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
            this.handleFiles([file], containerId);
            this.closeCameraModal();
        }, 'image/jpeg', 0.8);
    }
    
    closeCameraModal() {
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;
        }
        
        const modal = document.getElementById('cameraModal');
        if (modal) {
            modal.remove();
        }
    }
    
    handleFileSelect(event, containerId) {
        const files = Array.from(event.target.files);
        this.handleFiles(files, containerId);
        
        // 清空input以允許選擇相同檔案
        event.target.value = '';
    }
    
    handleDrop(event, containerId) {
        event.preventDefault();
        event.stopPropagation();
        
        const uploadArea = event.currentTarget;
        uploadArea.classList.remove('drag-over');
        
        const files = Array.from(event.dataTransfer.files);
        this.handleFiles(files, containerId);
    }
    
    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.classList.add('drag-over');
    }
    
    handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.classList.remove('drag-over');
    }
    
    handleFiles(files, containerId) {
        for (const file of files) {
            if (!this.validateFile(file)) continue;
            
            this.processFile(file, containerId);
        }
    }
    
    validateFile(file) {
        if (!this.allowedTypes.includes(file.type)) {
            alert(`不支援的檔案類型: ${file.type}`);
            return false;
        }
        
        if (file.size > this.maxFileSize) {
            alert(`檔案太大: ${(file.size / 1024 / 1024).toFixed(2)}MB (最大 5MB)`);
            return false;
        }
        
        return true;
    }
    
    async processFile(file, containerId) {
        try {
            // 顯示進度
            this.showProgress(containerId, 0);
            
            // 讀取檔案為Base64
            const fileData = await this.fileToBase64(file);
            
            // 模擬上傳進度
            for (let i = 20; i <= 80; i += 20) {
                await new Promise(resolve => setTimeout(resolve, 100));
                this.showProgress(containerId, i);
            }
            
            // 上傳到伺服器
            const uploadResult = await this.uploadToServer(file, fileData, containerId);
            
            if (uploadResult.success) {
                this.showProgress(containerId, 100);
                
                // 添加到預覽區域
                this.addToPreview(file, uploadResult.data, containerId);
                
                // 隱藏進度條
                setTimeout(() => {
                    this.hideProgress(containerId);
                }, 1000);
            } else {
                throw new Error(uploadResult.message);
            }
            
        } catch (error) {
            console.error('檔案處理失敗:', error);
            alert(`上傳失敗: ${error.message}`);
            this.hideProgress(containerId);
        }
    }
    
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    async uploadToServer(file, fileData, containerId) {
        try {
            const response = await fetch(`${this.API_BASE}/api/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    filename: file.name,
                    fileData: fileData,
                    fileType: file.type,
                    employeeId: this.currentUser?.employeeId,
                    relatedType: 'ordering', // 預設為叫貨相關
                    relatedId: containerId
                })
            });
            
            return await response.json();
        } catch (error) {
            throw new Error('網路錯誤');
        }
    }
    
    addToPreview(file, uploadData, containerId) {
        const previewArea = document.getElementById(`preview_${containerId}`);
        if (!previewArea) return;
        
        const fileUrl = URL.createObjectURL(file);
        const fileSize = (file.size / 1024).toFixed(1) + ' KB';
        
        const previewHTML = `
            <div class="photo-preview-item" data-upload-id="${uploadData.uploadId}">
                <img src="${fileUrl}" alt="${file.name}" class="photo-preview-img">
                <button class="photo-remove-btn" onclick="photoUploader.removePhoto('${uploadData.uploadId}', '${containerId}')">&times;</button>
                <div class="photo-preview-info">
                    <div class="photo-preview-name">${file.name}</div>
                    <div class="photo-preview-size">${fileSize}</div>
                </div>
            </div>
        `;
        
        previewArea.insertAdjacentHTML('beforeend', previewHTML);
        
        // 保存上傳資訊
        if (!window.uploadedFiles) window.uploadedFiles = {};
        if (!window.uploadedFiles[containerId]) window.uploadedFiles[containerId] = [];
        
        window.uploadedFiles[containerId].push({
            uploadId: uploadData.uploadId,
            filename: uploadData.filename,
            file: file,
            uploadData: uploadData
        });
    }
    
    removePhoto(uploadId, containerId) {
        // 從預覽中移除
        const previewItem = document.querySelector(`[data-upload-id="${uploadId}"]`);
        if (previewItem) {
            previewItem.remove();
        }
        
        // 從記錄中移除
        if (window.uploadedFiles && window.uploadedFiles[containerId]) {
            window.uploadedFiles[containerId] = window.uploadedFiles[containerId]
                .filter(item => item.uploadId !== uploadId);
        }
    }
    
    getUploadedFiles(containerId) {
        return window.uploadedFiles?.[containerId] || [];
    }
    
    clearFiles(containerId) {
        const previewArea = document.getElementById(`preview_${containerId}`);
        if (previewArea) {
            previewArea.innerHTML = '';
        }
        
        if (window.uploadedFiles) {
            window.uploadedFiles[containerId] = [];
        }
    }
    
    setEnabled(containerId, enabled) {
        const widget = document.getElementById(`photoWidget_${containerId}`);
        if (widget) {
            if (enabled) {
                widget.classList.remove('photo-upload-disabled');
            } else {
                widget.classList.add('photo-upload-disabled');
            }
        }
    }
    
    showProgress(containerId, percent) {
        const progressDiv = document.getElementById(`progress_${containerId}`);
        if (progressDiv) {
            progressDiv.style.display = 'block';
            
            const fill = progressDiv.querySelector('.progress-fill');
            const text = progressDiv.querySelector('.progress-text');
            
            if (fill) fill.style.width = percent + '%';
            if (text) text.textContent = `上傳中... ${percent}%`;
        }
    }
    
    hideProgress(containerId) {
        const progressDiv = document.getElementById(`progress_${containerId}`);
        if (progressDiv) {
            progressDiv.style.display = 'none';
        }
    }
}

// 創建全域照片上傳器實例
window.photoUploader = new PhotoUploader();

// 導出給其他檔案使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhotoUploader;
}