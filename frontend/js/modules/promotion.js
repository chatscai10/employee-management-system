/**
 * 升遷投票模組 - 前端介面與操作
 */

class PromotionModule {
    constructor() {
        this.currentUser = null;
        this.activeVotes = [];
        this.voteHistory = [];
        
        this.initializeModule();
    }

    /**
     * 初始化模組
     */
    async initializeModule() {
        try {
            // 設定事件監聽器
            this.setupEventListeners();
            
            // 初始化UI組件
            this.initializeUI();
            
        } catch (error) {
            console.error('升遷投票模組初始化失敗:', error);
            this.showMessage('升遷投票模組初始化失敗', 'error');
        }
    }

    /**
     * 設定事件監聽器
     */
    setupEventListeners() {
        // 發起升遷投票按鈕
        const initiateVoteBtn = document.getElementById('initiate-promotion-vote-btn');
        if (initiateVoteBtn) {
            initiateVoteBtn.addEventListener('click', () => this.showPromotionForm());
        }

        // 提交升遷申請表單
        const submitPromotionBtn = document.getElementById('submit-promotion-btn');
        if (submitPromotionBtn) {
            submitPromotionBtn.addEventListener('click', () => this.submitPromotionVote());
        }

        // 查看投票歷史按鈕
        const viewHistoryBtn = document.getElementById('view-vote-history-btn');
        if (viewHistoryBtn) {
            viewHistoryBtn.addEventListener('click', () => this.viewVoteHistory());
        }

        // 投票按鈕
        const agreeBtn = document.getElementById('vote-agree-btn');
        const disagreeBtn = document.getElementById('vote-disagree-btn');
        
        if (agreeBtn) {
            agreeBtn.addEventListener('click', () => this.submitVote('同意'));
        }
        
        if (disagreeBtn) {
            disagreeBtn.addEventListener('click', () => this.submitVote('反對'));
        }

        // 關閉投票詳情視窗
        const closeVoteDetailBtn = document.getElementById('close-vote-detail-btn');
        if (closeVoteDetailBtn) {
            closeVoteDetailBtn.addEventListener('click', () => this.hideVoteDetail());
        }

        // 職位變化事件
        const currentPositionSelect = document.getElementById('promotion-current-position');
        if (currentPositionSelect) {
            currentPositionSelect.addEventListener('change', () => this.onCurrentPositionChange());
        }
    }

    /**
     * 初始化UI
     */
    initializeUI() {
        // 設定可升遷職位清單
        this.setupPositionOptions();
        
        // 載入進行中的投票
        this.loadActiveVotes();
    }

    /**
     * 設定職位選項
     */
    setupPositionOptions() {
        const positionHierarchy = {
            '店員': ['資深店員'],
            '資深店員': ['組長'],
            '組長': ['副店長'],
            '副店長': ['店長'],
            '店長': ['區域經理'],
            '區域經理': ['總經理']
        };

        const currentPosSelect = document.getElementById('promotion-current-position');
        const targetPosSelect = document.getElementById('promotion-target-position');
        
        if (currentPosSelect && targetPosSelect) {
            // 設定當前職位選項
            Object.keys(positionHierarchy).forEach(position => {
                const option = document.createElement('option');
                option.value = position;
                option.textContent = position;
                currentPosSelect.appendChild(option);
            });
        }
    }

    /**
     * 當前職位變化事件
     */
    onCurrentPositionChange() {
        const currentPos = document.getElementById('promotion-current-position').value;
        const targetPosSelect = document.getElementById('promotion-target-position');
        
        // 清空目標職位選項
        targetPosSelect.innerHTML = '<option value="">請選擇目標職位</option>';
        
        const positionHierarchy = {
            '店員': ['資深店員'],
            '資深店員': ['組長'],
            '組長': ['副店長'],
            '副店長': ['店長'],
            '店長': ['區域經理'],
            '區域經理': ['總經理']
        };

        if (currentPos && positionHierarchy[currentPos]) {
            positionHierarchy[currentPos].forEach(position => {
                const option = document.createElement('option');
                option.value = position;
                option.textContent = position;
                targetPosSelect.appendChild(option);
            });
        }
    }

    /**
     * 顯示升遷申請表單
     */
    showPromotionForm() {
        const modal = document.getElementById('promotion-form-modal');
        if (modal) {
            modal.style.display = 'block';
            
            // 重置表單
            const form = document.getElementById('promotion-form');
            if (form) {
                form.reset();
                
                // 自動填入用戶當前職位和分店
                if (this.currentUser) {
                    const currentPosSelect = document.getElementById('promotion-current-position');
                    const storeSelect = document.getElementById('promotion-store');
                    
                    if (currentPosSelect) {
                        currentPosSelect.value = this.currentUser.position;
                        this.onCurrentPositionChange();
                    }
                    
                    if (storeSelect) {
                        storeSelect.value = this.currentUser.store;
                    }
                }
            }
        }
    }

    /**
     * 隱藏升遷申請表單
     */
    hidePromotionForm() {
        const modal = document.getElementById('promotion-form-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * 提交升遷投票申請
     */
    async submitPromotionVote() {
        try {
            if (!this.currentUser) {
                this.showMessage('請先登入', 'warning');
                return;
            }

            // 收集表單數據
            const formData = {
                applicantId: this.currentUser.employeeId,
                applicantName: this.currentUser.name,
                storeName: document.getElementById('promotion-store').value,
                currentPosition: document.getElementById('promotion-current-position').value,
                targetPosition: document.getElementById('promotion-target-position').value,
                reason: document.getElementById('promotion-reason').value.trim(),
                voteDurationDays: parseInt(document.getElementById('promotion-vote-duration').value) || 7
            };

            // 前端驗證
            const validation = this.validatePromotionData(formData);
            if (!validation.valid) {
                this.showMessage(validation.errors[0], 'warning');
                return;
            }

            // 顯示載入狀態
            const submitBtn = document.getElementById('submit-promotion-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '提交中...';
            submitBtn.disabled = true;

            // 調用後端API
            const result = await window.api.call('initiate_promotion_vote', formData);

            if (result.success) {
                this.showMessage('升遷投票申請提交成功！', 'success');
                
                // 關閉表單
                this.hidePromotionForm();
                
                // 重新載入投票資料
                await this.loadActiveVotes();
                
            } else {
                this.showMessage(result.message || '升遷投票申請失敗', 'error');
            }

        } catch (error) {
            console.error('提交升遷投票失敗:', error);
            this.showMessage('系統錯誤，請稍後再試', 'error');
        } finally {
            // 恢復按鈕狀態
            const submitBtn = document.getElementById('submit-promotion-btn');
            submitBtn.textContent = '提交申請';
            submitBtn.disabled = false;
        }
    }

    /**
     * 驗證升遷申請數據
     */
    validatePromotionData(data) {
        const errors = [];

        if (!data.currentPosition) {
            errors.push('請選擇當前職位');
        }

        if (!data.targetPosition) {
            errors.push('請選擇目標職位');
        }

        if (!data.storeName) {
            errors.push('請選擇分店');
        }

        if (!data.reason || data.reason.length < 10) {
            errors.push('升遷理由至少需要10個字元');
        }

        if (data.reason && data.reason.length > 500) {
            errors.push('升遷理由不能超過500個字元');
        }

        if (!data.voteDurationDays || data.voteDurationDays < 1 || data.voteDurationDays > 30) {
            errors.push('投票期限必須在1-30天之間');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * 載入進行中的投票
     */
    async loadActiveVotes() {
        try {
            if (!this.currentUser) return;

            const result = await window.api.call('get_active_promotion_vote', {
                employeeId: this.currentUser.employeeId
            });

            if (result.success) {
                this.activeVotes = result.data || [];
                this.renderActiveVotes();
            } else {
                console.warn('載入進行中投票失敗:', result.message);
                this.activeVotes = [];
                this.renderActiveVotes();
            }

        } catch (error) {
            console.error('載入進行中投票失敗:', error);
            this.activeVotes = [];
            this.renderActiveVotes();
        }
    }

    /**
     * 渲染進行中的投票
     */
    renderActiveVotes() {
        const container = document.getElementById('active-votes-container');
        if (!container) return;

        if (this.activeVotes.length === 0) {
            container.innerHTML = `
                <div class="no-votes-message">
                    <p>目前沒有進行中的升遷投票</p>
                </div>
            `;
            return;
        }

        let html = '';
        this.activeVotes.forEach(vote => {
            const deadline = new Date(vote.deadline);
            const daysRemaining = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
            const isExpired = daysRemaining <= 0;
            
            const totalVotes = vote.agreeCount + vote.disagreeCount;
            const agreePercentage = totalVotes > 0 ? (vote.agreeCount / totalVotes * 100).toFixed(1) : 0;
            const disagreePercentage = totalVotes > 0 ? (vote.disagreeCount / totalVotes * 100).toFixed(1) : 0;

            html += `
                <div class="vote-card ${isExpired ? 'expired' : ''}" data-vote-id="${vote.voteId}">
                    <div class="vote-header">
                        <h4>${vote.applicantName} - ${vote.currentPosition} → ${vote.targetPosition}</h4>
                        <span class="vote-status ${vote.status.toLowerCase()}">${vote.status}</span>
                    </div>
                    
                    <div class="vote-info">
                        <div class="vote-meta">
                            <span class="store">分店: ${vote.storeName}</span>
                            <span class="deadline ${isExpired ? 'expired' : ''}">
                                ${isExpired ? '已截止' : `剩餘${daysRemaining}天`}
                            </span>
                        </div>
                        
                        <div class="vote-progress">
                            <div class="progress-bar">
                                <div class="progress-agree" style="width: ${agreePercentage}%"></div>
                                <div class="progress-disagree" style="width: ${disagreePercentage}%"></div>
                            </div>
                            <div class="vote-counts">
                                <span class="agree">同意: ${vote.agreeCount}</span>
                                <span class="disagree">反對: ${vote.disagreeCount}</span>
                                <span class="total">總計: ${totalVotes}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="vote-actions">
                        <button class="btn btn-info" onclick="promotionModule.showVoteDetail('${vote.voteId}')">
                            查看詳情
                        </button>
                        ${!isExpired && this.canVote(vote) ? `
                            <button class="btn btn-success" onclick="promotionModule.showVoteModal('${vote.voteId}', '同意')">
                                同意
                            </button>
                            <button class="btn btn-danger" onclick="promotionModule.showVoteModal('${vote.voteId}', '反對')">
                                反對
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    /**
     * 檢查用戶是否可以投票
     */
    canVote(vote) {
        if (!this.currentUser) return false;
        
        // 申請人不能為自己投票
        if (vote.applicantId === this.currentUser.employeeId) return false;
        
        // 檢查是否已經投過票
        if (vote.voterList && vote.voterList.includes(this.currentUser.employeeId)) return false;
        
        // 檢查職位權限（通常同級或以上職位才能投票）
        return true; // 簡化處理，實際應檢查職位階級
    }

    /**
     * 顯示投票詳情
     */
    async showVoteDetail(voteId) {
        try {
            const result = await window.api.call('get_promotion_vote', { voteId });
            
            if (result.success) {
                this.renderVoteDetail(result.data);
            } else {
                this.showMessage('載入投票詳情失敗', 'error');
            }
        } catch (error) {
            console.error('載入投票詳情失敗:', error);
            this.showMessage('載入投票詳情失敗', 'error');
        }
    }

    /**
     * 渲染投票詳情
     */
    renderVoteDetail(vote) {
        const modal = document.getElementById('vote-detail-modal');
        const content = document.getElementById('vote-detail-content');
        
        if (!modal || !content) return;

        const deadline = new Date(vote.deadline);
        const isExpired = deadline <= new Date();
        
        const html = `
            <h3>升遷投票詳情</h3>
            
            <div class="vote-detail-info">
                <div class="applicant-info">
                    <h4>申請人資訊</h4>
                    <p><strong>姓名:</strong> ${vote.applicantName}</p>
                    <p><strong>分店:</strong> ${vote.storeName}</p>
                    <p><strong>職位:</strong> ${vote.currentPosition} → ${vote.targetPosition}</p>
                </div>
                
                <div class="vote-schedule">
                    <h4>投票時程</h4>
                    <p><strong>發起日期:</strong> ${new Date(vote.initiateDate).toLocaleDateString()}</p>
                    <p><strong>截止日期:</strong> ${deadline.toLocaleDateString()}</p>
                    <p><strong>狀態:</strong> <span class="${isExpired ? 'expired' : 'active'}">${isExpired ? '已截止' : '進行中'}</span></p>
                </div>
                
                <div class="vote-reason">
                    <h4>升遷理由</h4>
                    <p>${vote.reason}</p>
                </div>
                
                <div class="vote-results">
                    <h4>投票結果</h4>
                    <div class="result-summary">
                        <div class="result-item agree">
                            <span class="count">${vote.agreeCount}</span>
                            <span class="label">同意</span>
                        </div>
                        <div class="result-item disagree">
                            <span class="count">${vote.disagreeCount}</span>
                            <span class="label">反對</span>
                        </div>
                        <div class="result-item total">
                            <span class="count">${vote.qualifiedVoterCount}</span>
                            <span class="label">合格投票人</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        content.innerHTML = html;
        modal.style.display = 'block';
    }

    /**
     * 隱藏投票詳情
     */
    hideVoteDetail() {
        const modal = document.getElementById('vote-detail-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * 顯示投票確認視窗
     */
    showVoteModal(voteId, voteChoice) {
        this.currentVoteId = voteId;
        this.currentVoteChoice = voteChoice;
        
        const modal = document.getElementById('vote-confirm-modal');
        const choiceSpan = document.getElementById('vote-choice-display');
        
        if (modal && choiceSpan) {
            choiceSpan.textContent = voteChoice;
            modal.style.display = 'block';
        }
    }

    /**
     * 提交投票
     */
    async submitVote(finalChoice = null) {
        try {
            if (!this.currentUser) {
                this.showMessage('請先登入', 'warning');
                return;
            }

            const voteChoice = finalChoice || this.currentVoteChoice;
            const voteComment = document.getElementById('vote-comment')?.value.trim() || '';

            if (!this.currentVoteId || !voteChoice) {
                this.showMessage('投票資料不完整', 'warning');
                return;
            }

            const voteData = {
                voteId: this.currentVoteId,
                voterId: this.currentUser.employeeId,
                voterName: this.currentUser.name,
                voteChoice: voteChoice,
                voteComment: voteComment,
                voterPosition: this.currentUser.position,
                voterStore: this.currentUser.store
            };

            const result = await window.api.call('submit_vote', voteData);

            if (result.success) {
                this.showMessage(`投票提交成功！您選擇了: ${voteChoice}`, 'success');
                
                // 關閉確認視窗
                this.hideVoteConfirm();
                
                // 重新載入投票資料
                await this.loadActiveVotes();
                
            } else {
                this.showMessage(result.message || '投票提交失敗', 'error');
            }

        } catch (error) {
            console.error('提交投票失敗:', error);
            this.showMessage('系統錯誤，請稍後再試', 'error');
        }
    }

    /**
     * 隱藏投票確認視窗
     */
    hideVoteConfirm() {
        const modal = document.getElementById('vote-confirm-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // 清空暫存資料
        this.currentVoteId = null;
        this.currentVoteChoice = null;
    }

    /**
     * 查看投票歷史
     */
    async viewVoteHistory() {
        try {
            if (!this.currentUser) {
                this.showMessage('請先登入', 'warning');
                return;
            }

            const result = await window.api.call('get_vote_history', {
                employeeId: this.currentUser.employeeId,
                storeName: this.currentUser.store
            });

            if (result.success) {
                this.voteHistory = result.data || [];
                this.renderVoteHistory();
            } else {
                this.showMessage('載入投票歷史失敗', 'error');
            }

        } catch (error) {
            console.error('載入投票歷史失敗:', error);
            this.showMessage('載入投票歷史失敗', 'error');
        }
    }

    /**
     * 渲染投票歷史
     */
    renderVoteHistory() {
        const modal = document.getElementById('vote-history-modal');
        const content = document.getElementById('vote-history-content');
        
        if (!modal || !content) return;

        if (this.voteHistory.length === 0) {
            content.innerHTML = '<p>暫無投票歷史記錄</p>';
        } else {
            let html = `
                <h3>投票歷史</h3>
                <div class="history-list">
            `;

            this.voteHistory.forEach(vote => {
                const status = vote.status === '通過' ? 'passed' : 
                              vote.status === '未通過' ? 'failed' : 'pending';
                
                html += `
                    <div class="history-item ${status}">
                        <div class="history-header">
                            <span class="applicant">${vote.applicantName}</span>
                            <span class="positions">${vote.currentPosition} → ${vote.targetPosition}</span>
                            <span class="status ${status}">${vote.status}</span>
                        </div>
                        <div class="history-meta">
                            <span class="store">${vote.storeName}</span>
                            <span class="date">${new Date(vote.initiateDate).toLocaleDateString()}</span>
                            <span class="votes">同意:${vote.agreeCount} 反對:${vote.disagreeCount}</span>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            content.innerHTML = html;
        }

        modal.style.display = 'block';
    }

    /**
     * 載入模組數據
     */
    async loadData(user) {
        this.currentUser = user;
        
        try {
            // 載入進行中的投票
            await this.loadActiveVotes();
            
        } catch (error) {
            console.error('載入升遷投票模組數據失敗:', error);
        }
    }

    /**
     * 顯示訊息
     */
    showMessage(message, type = 'info') {
        if (window.app && window.app.showMessage) {
            window.app.showMessage(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// 全域導出
if (typeof window !== 'undefined') {
    window.PromotionModule = PromotionModule;
}