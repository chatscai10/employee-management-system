// 📢 公告系統模組
class AnnouncementModal {
    constructor() {
        this.API_BASE = 'http://localhost:3002';
        this.currentUser = null;
        this.announcements = [];
        this.currentIndex = 0;
        
        this.init();
    }
    
    init() {
        // 從localStorage載入用戶資料
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
        
        // 創建公告模態框HTML
        this.createModalHTML();
    }
    
    createModalHTML() {
        const modalHTML = `
            <div id="announcementModal" class="announcement-modal" style="display: none;">
                <div class="announcement-modal-overlay" onclick="announcementSystem.closeModal()"></div>
                <div class="announcement-modal-content">
                    <div class="announcement-header">
                        <h3 id="announcementTitle">📢 系統公告</h3>
                        <div class="announcement-nav">
                            <span id="announcementCounter">1 / 1</span>
                            <button id="prevAnnouncement" onclick="announcementSystem.previousAnnouncement()">&lt;</button>
                            <button id="nextAnnouncement" onclick="announcementSystem.nextAnnouncement()">&gt;</button>
                            <button class="close-btn" onclick="announcementSystem.closeModal()">&times;</button>
                        </div>
                    </div>
                    
                    <div class="announcement-body">
                        <div class="announcement-meta">
                            <span id="announcementPriority" class="priority-badge">一般</span>
                            <span id="announcementDate" class="announcement-date">2025-08-03</span>
                        </div>
                        
                        <div id="announcementContent" class="announcement-content">
                            載入中...
                        </div>
                        
                        <div class="announcement-actions">
                            <button id="markAsReadBtn" class="btn btn-primary" onclick="announcementSystem.markAsRead()">
                                ✓ 已讀
                            </button>
                            <button class="btn btn-secondary" onclick="announcementSystem.closeModal()">
                                稍後提醒
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 添加樣式
        const style = document.createElement('style');
        style.textContent = `
            .announcement-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .announcement-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
            }
            
            .announcement-modal-content {
                position: relative;
                background: white;
                border-radius: 15px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                animation: modalSlideIn 0.3s ease-out;
            }
            
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-50px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            .announcement-header {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .announcement-header h3 {
                margin: 0;
                font-size: 18px;
            }
            
            .announcement-nav {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .announcement-nav button {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .announcement-nav button:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            .close-btn {
                font-size: 20px !important;
                font-weight: bold;
            }
            
            .announcement-body {
                padding: 25px;
            }
            
            .announcement-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .priority-badge {
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
            }
            
            .priority-badge.high {
                background: #ff6b6b;
                color: white;
            }
            
            .priority-badge.medium {
                background: #ffa726;
                color: white;
            }
            
            .priority-badge.low {
                background: #66bb6a;
                color: white;
            }
            
            .announcement-date {
                color: #666;
                font-size: 14px;
            }
            
            .announcement-content {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 25px;
                line-height: 1.6;
                min-height: 120px;
                font-size: 15px;
            }
            
            .announcement-actions {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }
            
            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s;
            }
            
            .btn-primary {
                background: #4CAF50;
                color: white;
            }
            
            .btn-primary:hover {
                background: #45a049;
                transform: translateY(-2px);
            }
            
            .btn-secondary {
                background: #f0f0f0;
                color: #333;
            }
            
            .btn-secondary:hover {
                background: #e0e0e0;
            }
            
            @media (max-width: 600px) {
                .announcement-modal-content {
                    width: 95%;
                    margin: 20px;
                }
                
                .announcement-header {
                    padding: 15px;
                }
                
                .announcement-body {
                    padding: 20px;
                }
                
                .announcement-actions {
                    flex-direction: column;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    async loadAnnouncements() {
        try {
            if (!this.currentUser) {
                console.log('無用戶資料，跳過公告載入');
                return;
            }
            
            const response = await fetch(`${this.API_BASE}/api/announcements?employeeId=${this.currentUser.employeeId}`);
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
                this.announcements = result.data.filter(ann => 
                    !ann.readBy.includes(this.currentUser.employeeId)
                );
                
                if (this.announcements.length > 0) {
                    this.currentIndex = 0;
                    this.showModal();
                }
            }
        } catch (error) {
            console.error('載入公告失敗:', error);
        }
    }
    
    showModal() {
        if (this.announcements.length === 0) return;
        
        const modal = document.getElementById('announcementModal');
        modal.style.display = 'flex';
        
        this.displayCurrentAnnouncement();
        this.updateNavigation();
    }
    
    displayCurrentAnnouncement() {
        const current = this.announcements[this.currentIndex];
        if (!current) return;
        
        document.getElementById('announcementTitle').textContent = current.title;
        document.getElementById('announcementContent').textContent = current.content;
        document.getElementById('announcementDate').textContent = 
            new Date(current.createdAt).toLocaleDateString('zh-TW');
        
        const priorityBadge = document.getElementById('announcementPriority');
        priorityBadge.textContent = this.getPriorityText(current.priority);
        priorityBadge.className = `priority-badge ${current.priority}`;
    }
    
    getPriorityText(priority) {
        switch (priority) {
            case 'high': return '重要';
            case 'medium': return '一般';
            case 'low': return '通知';
            default: return '一般';
        }
    }
    
    updateNavigation() {
        const counter = document.getElementById('announcementCounter');
        counter.textContent = `${this.currentIndex + 1} / ${this.announcements.length}`;
        
        document.getElementById('prevAnnouncement').style.opacity = 
            this.currentIndex > 0 ? '1' : '0.3';
        document.getElementById('nextAnnouncement').style.opacity = 
            this.currentIndex < this.announcements.length - 1 ? '1' : '0.3';
    }
    
    previousAnnouncement() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.displayCurrentAnnouncement();
            this.updateNavigation();
        }
    }
    
    nextAnnouncement() {
        if (this.currentIndex < this.announcements.length - 1) {
            this.currentIndex++;
            this.displayCurrentAnnouncement();
            this.updateNavigation();
        }
    }
    
    async markAsRead() {
        try {
            const current = this.announcements[this.currentIndex];
            if (!current) return;
            
            const response = await fetch(`${this.API_BASE}/api/announcements/${current.id}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    employeeId: this.currentUser.employeeId
                })
            });
            
            if (response.ok) {
                // 從未讀列表中移除
                this.announcements.splice(this.currentIndex, 1);
                
                if (this.announcements.length === 0) {
                    this.closeModal();
                    return;
                }
                
                // 調整索引
                if (this.currentIndex >= this.announcements.length) {
                    this.currentIndex = this.announcements.length - 1;
                }
                
                this.displayCurrentAnnouncement();
                this.updateNavigation();
            }
        } catch (error) {
            console.error('標記已讀失敗:', error);
        }
    }
    
    closeModal() {
        const modal = document.getElementById('announcementModal');
        modal.style.display = 'none';
        
        // 保存未讀狀態到localStorage，避免重複顯示
        const unreadIds = this.announcements.map(ann => ann.id);
        localStorage.setItem('dismissedAnnouncements', JSON.stringify(unreadIds));
    }
    
    // 檢查是否需要顯示公告（登入後調用）
    async checkAndShowAnnouncements() {
        // 延遲顯示，確保頁面完全載入
        setTimeout(async () => {
            await this.loadAnnouncements();
        }, 1500);
    }
}

// 創建全域公告系統實例
window.announcementSystem = new AnnouncementModal();

// 導出給其他檔案使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnnouncementModal;
}