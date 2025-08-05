@echo off
REM 🔧 Cloud Run IAM權限自動修復腳本 (Windows)
REM 生成時間: 2025-08-04T14:24:09.970Z

echo 🚀 開始Cloud Run IAM權限修復...
echo 服務名稱: employee-management-system
echo 區域: europe-west1
echo 項目ID: 213410885168
echo.

REM 設定項目ID
gcloud config set project 213410885168


echo 步驟1: 檢查Cloud Run服務狀態
echo 優先級: INFO
echo 執行指令: gcloud run services describe employee-management-system --region=europe-west1
gcloud run services describe employee-management-system --region=europe-west1
echo 完成步驟1
echo.

echo 步驟2: 設定服務允許未驗證訪問
echo 優先級: CRITICAL
echo 執行指令: gcloud run services add-iam-policy-binding employee-management-system --region=europe-west1 --member="allUsers" --role="roles/run.invoker"
gcloud run services add-iam-policy-binding employee-management-system --region=europe-west1 --member="allUsers" --role="roles/run.invoker"
echo 完成步驟2
echo.

echo 步驟3: 更新服務配置允許公開訪問
echo 優先級: CRITICAL
echo 執行指令: gcloud run services update employee-management-system --region=europe-west1 --allow-unauthenticated
gcloud run services update employee-management-system --region=europe-west1 --allow-unauthenticated
echo 完成步驟3
echo.

echo 步驟4: 驗證IAM策略綁定
echo 優先級: HIGH
echo 執行指令: gcloud run services get-iam-policy employee-management-system --region=europe-west1
gcloud run services get-iam-policy employee-management-system --region=europe-west1
echo 完成步驟4
echo.

echo 步驟5: 檢查服務最終狀態
echo 優先級: INFO
echo 執行指令: gcloud run services describe employee-management-system --region=europe-west1 --format="value(status.url)"
gcloud run services describe employee-management-system --region=europe-west1 --format="value(status.url)"
echo 完成步驟5
echo.


echo 🎉 Cloud Run IAM權限修復完成！
echo 請等待1-2分鐘後測試服務訪問
echo 服務URL: https://employee-management-system-213410885168.europe-west1.run.app
pause
