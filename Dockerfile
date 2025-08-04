# 🐳 企業庫存管理系統 - 生產環境優化版
FROM node:18-alpine

# 安裝系統依賴和安全更新
RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    curl \
    dumb-init \
    && update-ca-certificates \
    && rm -rf /var/cache/apk/*

# 建立非root用戶
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# 設定時區和工作目錄
ENV TZ=Asia/Taipei
WORKDIR /app

# 優化npm安裝
COPY package*.json ./
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force && \
    rm -rf /tmp/* /var/tmp/*

# 複製應用程式檔案
COPY server-production.js ./
COPY public/ ./public/

# 建立必要目錄並設定權限
RUN mkdir -p /app/logs /app/uploads /app/temp && \
    chown -R nodejs:nodejs /app && \
    chmod -R 755 /app

# 設定環境變數
ENV NODE_ENV=production
ENV PORT=8080
ENV NODE_OPTIONS="--max-old-space-size=1024"

# 健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# 切換用戶並暴露端口
USER nodejs
EXPOSE 8080

# 使用dumb-init處理信號
ENTRYPOINT ["dumb-init", "--"]

# 啟動應用
CMD ["node", "server-production.js"]

# 標籤
LABEL maintainer="Claude Code Ultimate Template" \
      version="3.0.0" \
      description="企業級庫存管理系統 - 終極優化版" \
      security.scan="enabled" \
      performance="optimized"