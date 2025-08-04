# 企業員工管理系統 (Employee Management System)

[![部署狀態](https://github.com/your-org/employee-management/workflows/Deploy%20Employee%20Management%20System/badge.svg)](https://github.com/your-org/employee-management/actions)
[![許可證](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![版本](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/your-org/employee-management/releases)

一個現代化的企業員工管理系統，支援員工註冊、打卡管理、營收記錄、排班系統等完整功能。基於 Google Apps Script 和 Google Sheets 構建，提供高可用性和低成本的解決方案。

## ✨ 主要功能

### 👥 員工管理
- **員工註冊**: 完整的員工資料登記，包含身分證驗證
- **登入系統**: 支援員工編號和身分證號登入
- **權限管理**: 多級權限控制（員工/主管/管理員）
- **個人資料**: 安全的個人資訊管理

### ⏰ 打卡系統
- **GPS 定位**: 精確的位置驗證，防止異地打卡
- **設備指紋**: 防止打卡欺詐的多重驗證
- **即時通知**: Telegram 即時通知管理層
- **異常檢測**: 自動識別遲到、異常位置等情況

### 💰 營收管理
- **營收記錄**: 詳細的日營收數據輸入
- **獎金計算**: 自動化獎金計算系統
- **報表分析**: 完整的營收分析報告
- **多元收入**: 支援現場、外送、其他收入分類

### 📊 其他功能
- **叫貨系統**: 庫存管理和供應商對接
- **排班管理**: 靈活的員工排班系統
- **升遷投票**: 民主化的職位升遷機制
- **維修回報**: 設備故障報修系統

## 技術架構
- **前端**: HTML5 + CSS3 + Vanilla JavaScript
- **後端**: Google Apps Script
- **數據庫**: Google Sheets
- **通知**: Telegram Bot API
- **部署**: Google Apps Script Web App

## 核心模組
1. **員工註冊系統** - 員工資料管理和身份驗證
2. **打卡系統** - GPS定位 + 設備指紋驗證
3. **營收系統** - 收支記錄 + 獎金計算
4. **叫貨系統** - 庫存管理 + 異常監控
5. **排班系統** - 獨佔計時 + 衝突檢測
6. **升遷投票系統** - 名額鎖定 + 投票流程
7. **維修系統** - 設備報修 + 進度追蹤

## 開發階段
- **第1階段**: 基礎架構 + 員工註冊 + 打卡系統
- **第2階段**: 營收系統 + 叫貨系統 + Telegram通知
- **第3階段**: 排班系統 + 升遷投票系統 + 維修系統
- **第4階段**: 測試優化 + 生產部署

## 安全特性
- GPS定位驗證
- 設備指紋檢測
- LockService併發控制
- 操作日誌記錄
- 權限分級管理

## 聯絡資訊
- 開發團隊: [待填入]
- Telegram群組: -1002658082392
- 系統狀態: 開發中

---
最後更新: 2025-08-02