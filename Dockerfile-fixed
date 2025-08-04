# 企業管理系統 Docker 配置 - 修復版
FROM node:18-alpine

# 設定工作目錄
WORKDIR /app

# 安裝系統依賴
RUN apk add --no-cache curl

# 複製 package 檔案並安裝依賴
COPY package*.json ./
RUN npm ci --only=production --silent

# 複製應用程式檔案
COPY server-production.js ./
COPY api ./api

# 設定環境變數
ENV NODE_ENV=production
ENV PORT=8080

# 創建非 root 用戶
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# 暴露端口
EXPOSE 8080

# 健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# 啟動應用
CMD ["node", "server-production.js"]