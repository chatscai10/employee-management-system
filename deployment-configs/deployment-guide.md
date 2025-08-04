# Google Cloud Run (進階方案) 部署指南

## 概述

適合中型團隊，serverless架構，按使用量付費

**適用場景：** 15 人團隊，低預算 ($0-50/月)預算

## 前置需求

- GCP帳號
- 自定義域名(選用)
- Telegram Bot

## 部署步驟

### 1. 準備環境

```bash
# 複製環境變數配置
cp .env.deployment .env

# 編輯環境變數，填入實際值
nano .env
```

### 2. 執行部署

```bash
# 給部署腳本執行權限
chmod +x deploy.sh

# 執行部署
./deploy.sh
```

### 3. 後續配置

1. 配置自定義域名 (選用)
2. 設定 HTTPS 憑證
3. 配置 Cloud SQL 或 Firebase (如需要)
4. 設定監控和警報
5. 配置 CI/CD 流程

## 系統功能

- ✅ 完整員工管理
- ✅ 高級報表
- ✅ 文件上傳
- ✅ 自動備份
- ✅ API擴展

## 限制說明

- ⚠️ 冷啟動時間
- ⚠️ 區域限制

## 維護建議

- 設定 Cloud Monitoring 警報
- 定期檢查 Cloud Run 用量和成本
- 更新 Docker 映像安全補丁
- 監控應用程式效能指標

## 擴展路徑

擴展選項：
- 增加 Cloud Run 實例和記憶體
- 整合 Cloud SQL 提升數據處理能力
- 使用 Cloud Load Balancing 實現高可用性
- 升級到 Kubernetes 獲得更多控制權

## 故障排除

### 常見問題

1. **部署失敗**
   - 檢查網路連接
   - 驗證帳號權限
   - 查看錯誤日誌

2. **功能異常**
   - 檢查環境變數配置
   - 驗證 API 金鑰
   - 查看系統日誌

### 技術支援

- 📚 查看完整文檔：[deployment/deployment-guide.md](../deployment/deployment-guide.md)
- 🐛 回報問題：創建 GitHub Issue
- 💬 社群支援：加入 Telegram 群組

## 成本預估

**按使用量付費 (~$10-50/月)**

- Cloud Run：$5-30/月 (依使用量)
- Cloud Storage：$1-5/月
- Cloud Build：$0-10/月
- 網路流量：$0-5/月
- 總計：約 $10-50/月

---

*最後更新：2025-08-02*
