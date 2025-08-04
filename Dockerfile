# 企業管理系統 v4.0.0 - 完整功能版 Docker 配置
FROM node:18-alpine

# 設定工作目錄
WORKDIR /app

# 安裝系統依賴
RUN apk add --no-cache curl

# 複製 package.json
COPY package*.json ./

# 清理 npm 緩存並安裝依賴
RUN npm cache clean --force && \
    npm ci --only=production

# 複製應用程式檔案
COPY app.js ./

# 建立非 root 用戶
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 設定用戶權限
USER nodejs

# 暴露端口
EXPOSE 8080

# 健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# 啟動命令  
CMD ["node", "app.js"]