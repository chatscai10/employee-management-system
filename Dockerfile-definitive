# 企業管理系統 - 確定性部署版
FROM node:18-alpine

# 設置工作目錄
WORKDIR /app

# 安裝系統依賴
RUN apk add --no-cache curl

# 複製依賴文件
COPY package*.json ./

# 清理 npm 緩存並安裝依賴
RUN npm cache clean --force && npm ci --only=production

# 複製應用文件
COPY server.js ./

# 創建非 root 用戶
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 設置權限
RUN chown -R nodejs:nodejs /app
USER nodejs

# 暴露端口
EXPOSE 8080

# 健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# 啟動命令
CMD ["node", "server.js"]