# 🔧 Cloud Run IAM權限修復指導

## 🚨 問題描述
Google Cloud Run服務返回403 Forbidden錯誤，表示服務未配置為允許公開訪問。

## ✅ 修復方案

### 方法1: 自動執行修復腳本 (推薦)

**Linux/Mac用戶:**
```bash
chmod +x fix-cloud-run-iam.sh
./fix-cloud-run-iam.sh
```

**Windows用戶:**
```batch
fix-cloud-run-iam.bat
```

### 方法2: 手動執行修復指令

請按順序執行以下指令：


#### 步驟1: 檢查Cloud Run服務狀態 (INFO)
```bash
gcloud run services describe employee-management-system --region=europe-west1
```

#### 步驟2: 設定服務允許未驗證訪問 (CRITICAL)
```bash
gcloud run services add-iam-policy-binding employee-management-system --region=europe-west1 --member="allUsers" --role="roles/run.invoker"
```

#### 步驟3: 更新服務配置允許公開訪問 (CRITICAL)
```bash
gcloud run services update employee-management-system --region=europe-west1 --allow-unauthenticated
```

#### 步驟4: 驗證IAM策略綁定 (HIGH)
```bash
gcloud run services get-iam-policy employee-management-system --region=europe-west1
```

#### 步驟5: 檢查服務最終狀態 (INFO)
```bash
gcloud run services describe employee-management-system --region=europe-west1 --format="value(status.url)"
```


## 🔍 修復驗證

修復完成後，請使用以下方式驗證：

1. **瀏覽器測試**: 訪問 [https://employee-management-system-213410885168.europe-west1.run.app](https://employee-management-system-213410885168.europe-west1.run.app)
2. **API測試**: 
   ```bash
   curl -I https://employee-management-system-213410885168.europe-west1.run.app
   ```
3. **狀態檢查**: 應該返回200 OK而非403 Forbidden

## ⏱️ 預期修復時間
- **執行時間**: 2-3分鐘
- **生效時間**: 1-2分鐘
- **總計時間**: 5分鐘內

## 🆘 如果修復失敗

1. 確認您有足夠的Google Cloud權限
2. 檢查項目ID和服務名稱是否正確
3. 驗證gcloud CLI已正確安裝和認證
4. 如需協助，請查看Cloud Run日誌或聯繫支援

---
生成時間: 2025-08-04T14:24:09.971Z
服務URL: https://employee-management-system-213410885168.europe-west1.run.app
