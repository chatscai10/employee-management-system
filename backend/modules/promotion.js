/**
 * 升遷投票管理模組 - 處理員工升遷投票和評估
 */

const PromotionModule = {
  
  /**
   * 發起升遷投票
   */
  initiatePromotionVote(data) {
    try {
      // 清理和驗證輸入數據
      const sanitizedData = ValidationUtils.sanitizeObject(data);
      const validation = ValidationUtils.validatePromotionVoteData(sanitizedData);
      
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors
        };
      }
      
      const lock = LockService.getScriptLock();
      lock.waitLock(30000);
      
      try {
        // 生成投票編號
        const voteId = DatabaseUtils.generateId('VOTE');
        
        // 檢查是否已有進行中的升遷投票
        const existingVote = this.getActivePromotionVote(sanitizedData.initiatorId);
        if (existingVote.data) {
          return {
            success: false,
            errors: ['您已有進行中的升遷投票申請']
          };
        }
        
        // 獲取申請人資訊
        const applicant = EmployeeModule.getEmployeeById(sanitizedData.initiatorId);
        if (!applicant) {
          return {
            success: false,
            errors: ['找不到申請人資訊']
          };
        }
        
        // 計算投票截止時間 (7天後)
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 7);
        
        // 獲取合格投票人列表
        const eligibleVoters = this.getEligibleVoters(applicant.store, applicant.position);
        
        // 準備投票數據
        const voteData = [
          voteId,
          sanitizedData.initiatorId,
          applicant.name,
          applicant.store,
          applicant.position, // 當前職位
          sanitizedData.targetPosition, // 目標職位
          new Date().toISOString().split('T')[0], // 發起日期
          deadline.toISOString().split('T')[0], // 截止日期
          0, // 同意票數
          0, // 反對票數
          eligibleVoters.length, // 合格投票人數
          '進行中',
          sanitizedData.reason || '',
          new Date().toISOString(), // 創建時間
          JSON.stringify(eligibleVoters) // 合格投票人列表
        ];
        
        // 寫入升遷投票表
        const sheet = getSheet('PromotionVotes');
        
        // 如果表是空的，加入標題行
        if (sheet.getLastRow() === 0) {
          const headers = ['投票ID', '申請人ID', '申請人姓名', '分店', '當前職位', 
                          '目標職位', '發起日期', '截止日期', '同意票數', '反對票數', 
                          '合格投票人數', '狀態', '申請理由', '創建時間', '投票人列表'];
          sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        }
        
        // 新增投票記錄
        sheet.appendRow(voteData);
        
        // 創建個別投票記錄表
        this.initializeVoteRecords(voteId, eligibleVoters);
        
        // 發送通知
        const notificationData = {
          voteId: voteId,
          applicantName: applicant.name,
          currentPosition: applicant.position,
          targetPosition: sanitizedData.targetPosition,
          storeName: applicant.store,
          deadline: deadline.toISOString().split('T')[0],
          eligibleVoterCount: eligibleVoters.length,
          reason: sanitizedData.reason
        };
        
        try {
          TelegramUtils.sendPromotionVoteNotification(notificationData);
        } catch (telegramError) {
          logDebug('升遷投票通知發送失敗', telegramError);
        }
        
        logDebug('升遷投票發起成功', { voteId, applicantName: applicant.name });
        
        return {
          success: true,
          voteId: voteId,
          message: '升遷投票發起成功',
          data: {
            voteId: voteId,
            deadline: deadline.toISOString().split('T')[0],
            eligibleVoterCount: eligibleVoters.length
          }
        };
        
      } finally {
        lock.releaseLock();
      }
      
    } catch (error) {
      logDebug('升遷投票發起錯誤', error);
      DatabaseUtils.logError({
        errorId: DatabaseUtils.generateId('ERR'),
        timestamp: new Date().toISOString(),
        functionName: 'initiatePromotionVote',
        errorMessage: error.message,
        userData: { initiatorId: data.initiatorId, targetPosition: data.targetPosition },
        severity: 'HIGH'
      });
      
      return {
        success: false,
        errors: ['系統錯誤，請稍後再試']
      };
    }
  },
  
  /**
   * 提交投票
   */
  submitVote(data) {
    try {
      // 清理和驗證輸入數據
      const sanitizedData = ValidationUtils.sanitizeObject(data);
      const validation = ValidationUtils.validateVoteData(sanitizedData);
      
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors
        };
      }
      
      const lock = LockService.getScriptLock();
      lock.waitLock(30000);
      
      try {
        // 檢查投票是否存在且進行中
        const voteInfo = this.getPromotionVoteById(sanitizedData.voteId);
        if (!voteInfo.success || !voteInfo.data) {
          return {
            success: false,
            errors: ['找不到投票記錄']
          };
        }
        
        if (voteInfo.data.status !== '進行中') {
          return {
            success: false,
            errors: ['投票已結束']
          };
        }
        
        // 檢查是否過期
        const deadline = new Date(voteInfo.data.deadline);
        if (new Date() > deadline) {
          return {
            success: false,
            errors: ['投票已過期']
          };
        }
        
        // 檢查投票資格
        const voterEligibility = this.checkVoterEligibility(sanitizedData.voteId, sanitizedData.voterId);
        if (!voterEligibility.eligible) {
          return {
            success: false,
            errors: [voterEligibility.reason]
          };
        }
        
        // 檢查是否已投票
        const hasVoted = this.hasAlreadyVoted(sanitizedData.voteId, sanitizedData.voterId);
        if (hasVoted) {
          return {
            success: false,
            errors: ['您已經投過票了']
          };
        }
        
        // 獲取投票人資訊
        const voter = EmployeeModule.getEmployeeById(sanitizedData.voterId);
        if (!voter) {
          return {
            success: false,
            errors: ['找不到投票人資訊']
          };
        }
        
        // 記錄投票
        const voteRecordId = DatabaseUtils.generateId('VREC');
        const voteRecord = [
          voteRecordId,
          sanitizedData.voteId,
          sanitizedData.voterId,
          voter.name,
          sanitizedData.choice,
          new Date().toISOString(),
          sanitizedData.comment || '',
          voter.position,
          voter.store
        ];
        
        // 寫入投票記錄表
        const recordSheet = getSheet('VoteRecords');
        
        // 如果表是空的，加入標題行
        if (recordSheet.getLastRow() === 0) {
          const headers = ['記錄ID', '投票ID', '投票人ID', '投票人姓名', '投票選擇', 
                          '投票時間', '投票意見', '投票人職位', '投票人分店'];
          recordSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        }
        
        recordSheet.appendRow(voteRecord);
        
        // 更新投票統計
        this.updateVoteCount(sanitizedData.voteId, sanitizedData.choice);
        
        // 檢查是否達到結束條件
        this.checkVoteCompletion(sanitizedData.voteId);
        
        logDebug('投票提交成功', { 
          voteId: sanitizedData.voteId, 
          voterId: sanitizedData.voterId,
          choice: sanitizedData.choice 
        });
        
        return {
          success: true,
          message: '投票提交成功'
        };
        
      } finally {
        lock.releaseLock();
      }
      
    } catch (error) {
      logDebug('投票提交錯誤', error);
      return {
        success: false,
        errors: ['投票提交失敗']
      };
    }
  },
  
  /**
   * 獲取升遷投票詳情
   */
  getPromotionVoteById(voteId) {
    try {
      const sheet = getSheet('PromotionVotes');
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[0] === voteId) {
          return {
            success: true,
            data: {
              voteId: row[0],
              applicantId: row[1],
              applicantName: row[2],
              storeName: row[3],
              currentPosition: row[4],
              targetPosition: row[5],
              initiateDate: row[6],
              deadline: row[7],
              agreeCount: row[8],
              disagreeCount: row[9],
              eligibleVoterCount: row[10],
              status: row[11],
              reason: row[12],
              createdTime: row[13],
              eligibleVoters: this.parseVotersList(row[14])
            }
          };
        }
      }
      
      return {
        success: false,
        message: '找不到投票記錄'
      };
      
    } catch (error) {
      logDebug('獲取投票詳情失敗', error);
      return {
        success: false,
        message: '獲取投票詳情失敗'
      };
    }
  },
  
  /**
   * 獲取進行中的升遷投票
   */
  getActivePromotionVote(employeeId) {
    try {
      const sheet = getSheet('PromotionVotes');
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[1] === employeeId && row[11] === '進行中') {
          return {
            success: true,
            data: {
              voteId: row[0],
              targetPosition: row[5],
              deadline: row[7],
              agreeCount: row[8],
              disagreeCount: row[9]
            }
          };
        }
      }
      
      return {
        success: true,
        data: null
      };
      
    } catch (error) {
      logDebug('獲取進行中投票失敗', error);
      return {
        success: false,
        message: '獲取進行中投票失敗'
      };
    }
  },
  
  /**
   * 獲取合格投票人列表
   */
  getEligibleVoters(storeName, currentPosition) {
    try {
      // 獲取同分店的所有員工
      const employees = EmployeeModule.getEmployeesByStore(storeName);
      
      // 職位等級定義
      const positionLevels = {
        '員工': 1,
        '主管': 2,
        '經理': 3,
        '區域經理': 4,
        '總經理': 5
      };
      
      const currentLevel = positionLevels[currentPosition] || 1;
      
      // 篩選合格投票人：同等級或更高等級的員工
      const eligibleVoters = employees.filter(emp => {
        const empLevel = positionLevels[emp.position] || 1;
        return empLevel >= currentLevel && emp.status === '在職';
      });
      
      return eligibleVoters.map(emp => ({
        employeeId: emp.employeeId,
        name: emp.name,
        position: emp.position
      }));
      
    } catch (error) {
      logDebug('獲取合格投票人失敗', error);
      return [];
    }
  },
  
  /**
   * 檢查投票資格
   */
  checkVoterEligibility(voteId, voterId) {
    try {
      const voteInfo = this.getPromotionVoteById(voteId);
      if (!voteInfo.success) {
        return { eligible: false, reason: '找不到投票記錄' };
      }
      
      const eligibleVoters = voteInfo.data.eligibleVoters;
      const isEligible = eligibleVoters.some(voter => voter.employeeId === voterId);
      
      if (!isEligible) {
        return { eligible: false, reason: '您沒有此投票的投票資格' };
      }
      
      return { eligible: true };
      
    } catch (error) {
      logDebug('檢查投票資格失敗', error);
      return { eligible: false, reason: '檢查投票資格失敗' };
    }
  },
  
  /**
   * 檢查是否已投票
   */
  hasAlreadyVoted(voteId, voterId) {
    try {
      const sheet = getSheet('VoteRecords');
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[1] === voteId && row[2] === voterId) {
          return true;
        }
      }
      
      return false;
      
    } catch (error) {
      logDebug('檢查投票狀態失敗', error);
      return false;
    }
  },
  
  /**
   * 更新投票統計
   */
  updateVoteCount(voteId, choice) {
    try {
      const sheet = getSheet('PromotionVotes');
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[0] === voteId) {
          if (choice === '同意') {
            const newCount = (parseInt(row[8]) || 0) + 1;
            sheet.getRange(i + 1, 9).setValue(newCount);
          } else if (choice === '反對') {
            const newCount = (parseInt(row[9]) || 0) + 1;
            sheet.getRange(i + 1, 10).setValue(newCount);
          }
          break;
        }
      }
      
    } catch (error) {
      logDebug('更新投票統計失敗', error);
    }
  },
  
  /**
   * 檢查投票是否完成
   */
  checkVoteCompletion(voteId) {
    try {
      const voteInfo = this.getPromotionVoteById(voteId);
      if (!voteInfo.success) return;
      
      const vote = voteInfo.data;
      const totalVotes = vote.agreeCount + vote.disagreeCount;
      const deadline = new Date(vote.deadline);
      const now = new Date();
      
      let shouldComplete = false;
      let result = '';
      
      // 檢查是否所有人都投票了
      if (totalVotes >= vote.eligibleVoterCount) {
        shouldComplete = true;
      }
      
      // 檢查是否過期
      if (now > deadline) {
        shouldComplete = true;
      }
      
      if (shouldComplete) {
        // 計算結果：需要超過50%同意票
        const approvalRate = vote.agreeCount / totalVotes;
        if (approvalRate > 0.5) {
          result = '通過';
        } else {
          result = '未通過';
        }
        
        this.completeVote(voteId, result);
      }
      
    } catch (error) {
      logDebug('檢查投票完成狀態失敗', error);
    }
  },
  
  /**
   * 完成投票
   */
  completeVote(voteId, result) {
    try {
      const sheet = getSheet('PromotionVotes');
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[0] === voteId) {
          sheet.getRange(i + 1, 12).setValue(result);
          
          // 如果投票通過，處理升遷
          if (result === '通過') {
            this.processPromotion(voteId);
          }
          
          // 發送結果通知
          this.sendVoteResultNotification(voteId, result);
          
          break;
        }
      }
      
    } catch (error) {
      logDebug('完成投票失敗', error);
    }
  },
  
  /**
   * 處理升遷
   */
  processPromotion(voteId) {
    try {
      const voteInfo = this.getPromotionVoteById(voteId);
      if (!voteInfo.success) return;
      
      const vote = voteInfo.data;
      
      // 更新員工職位
      EmployeeModule.updateEmployeePosition(vote.applicantId, vote.targetPosition);
      
      logDebug('升遷處理完成', {
        employeeId: vote.applicantId,
        oldPosition: vote.currentPosition,
        newPosition: vote.targetPosition
      });
      
    } catch (error) {
      logDebug('處理升遷失敗', error);
    }
  },
  
  /**
   * 發送投票結果通知
   */
  sendVoteResultNotification(voteId, result) {
    try {
      const voteInfo = this.getPromotionVoteById(voteId);
      if (!voteInfo.success) return;
      
      const vote = voteInfo.data;
      const notificationData = {
        voteId: voteId,
        applicantName: vote.applicantName,
        targetPosition: vote.targetPosition,
        result: result,
        agreeCount: vote.agreeCount,
        disagreeCount: vote.disagreeCount,
        totalVotes: vote.agreeCount + vote.disagreeCount
      };
      
      TelegramUtils.sendVoteResultNotification(notificationData);
      
    } catch (error) {
      logDebug('發送投票結果通知失敗', error);
    }
  },
  
  /**
   * 解析投票人列表
   */
  parseVotersList(votersString) {
    try {
      return JSON.parse(votersString || '[]');
    } catch (error) {
      return [];
    }
  },
  
  /**
   * 初始化投票記錄表
   */
  initializeVoteRecords(voteId, eligibleVoters) {
    try {
      // 這裡可以為每個合格投票人創建預設記錄
      // 實際實現時可能不需要
      logDebug('投票記錄表初始化', { voteId, voterCount: eligibleVoters.length });
    } catch (error) {
      logDebug('初始化投票記錄失敗', error);
    }
  },
  
  /**
   * 獲取投票歷史
   */
  getVoteHistory(data) {
    try {
      const { employeeId, storeName, startDate, endDate, status } = data;
      
      const sheet = getSheet('PromotionVotes');
      const voteData = sheet.getDataRange().getValues();
      
      if (voteData.length <= 1) {
        return {
          success: true,
          data: []
        };
      }
      
      const votes = [];
      for (let i = 1; i < voteData.length; i++) {
        const row = voteData[i];
        const vote = {
          voteId: row[0],
          applicantId: row[1],
          applicantName: row[2],
          storeName: row[3],
          currentPosition: row[4],
          targetPosition: row[5],
          initiateDate: row[6],
          deadline: row[7],
          agreeCount: row[8],
          disagreeCount: row[9],
          eligibleVoterCount: row[10],
          status: row[11],
          reason: row[12],
          createdTime: row[13]
        };
        
        // 應用篩選條件
        if (employeeId && vote.applicantId !== employeeId) continue;
        if (storeName && vote.storeName !== storeName) continue;
        if (status && vote.status !== status) continue;
        
        // 日期範圍篩選
        if (startDate || endDate) {
          const voteDate = new Date(vote.initiateDate);
          if (startDate && voteDate < new Date(startDate)) continue;
          if (endDate && voteDate > new Date(endDate)) continue;
        }
        
        votes.push(vote);
      }
      
      // 按創建時間降序排列
      votes.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));
      
      return {
        success: true,
        data: votes
      };
      
    } catch (error) {
      logDebug('獲取投票歷史失敗', error);
      return {
        success: false,
        message: '獲取投票歷史失敗'
      };
    }
  }
  
};