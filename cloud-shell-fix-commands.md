# 修復 Cloud Run 部署問題

## 🔧 指令清單

請按順序複製以下指令到 Cloud Shell：

### 步驟 1：刪除舊的 package.json
```bash
rm package.json
```

### 步驟 2：創建新的 package.json
```bash
echo '{"name":"employee-management-system","version":"1.0.0","main":"server.js","scripts":{"start":"node server.js"},"dependencies":{"express":"4.18.2"},"engines":{"node":"18"}}' > package.json
```

### 步驟 3：刪除舊的 server.js
```bash
rm server.js
```

### 步驟 4：創建新的 server.js
```bash
echo 'const express = require("express"); const app = express(); const PORT = process.env.PORT || 8080; app.get("/", (req, res) => res.send("Employee Management System is running!")); app.get("/api/health", (req, res) => res.json({status: "healthy", timestamp: new Date().toISOString()})); app.listen(PORT, "0.0.0.0", () => console.log("Server running on port " + PORT));' > server.js
```

### 步驟 5：重新部署到 Cloud Run
```bash
gcloud run deploy employee-management-system --source . --region asia-east1 --allow-unauthenticated
```

### 步驟 6：確認部署
當詢問是否繼續時輸入：
```
Y
```

## 📋 使用說明

1. **逐行複製貼上**到 Cloud Shell
2. **每個指令執行完成後**再執行下一個
3. **最後一步輸入 Y** 確認部署
4. **部署成功後**會顯示服務 URL

## 🔍 預期結果

部署成功後應該會看到類似這樣的輸出：
```
Service [employee-management-system] revision [employee-management-system-00002-xxx] has been deployed and is serving 100 percent of traffic.
Service URL: https://employee-management-system-xxxxxxxxxxxx-de.a.run.app
```

## ❗ 重要提醒

- 確保在正確的目錄：`~/employee-management-system/employee-management-system`
- 如果某個指令失敗，請告訴我錯誤訊息
- 部署可能需要 2-5 分鐘完成