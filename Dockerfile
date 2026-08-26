# ── Phụ thuộc ────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# --ignore-scripts KHÔNG phải để chạy nhanh hơn: script `prepare` của
# @google/genai lỗi trên nhiều máy và làm npm bỏ dở cả cây phụ thuộc, để lại
# một node_modules thiếu gói mà triệu chứng lại là Turbopack panic.
# Xem docs/DEPLOYMENT.md, "Hai cái bẫy đã vấp".
RUN npm ci --ignore-scripts

# ── Build ────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Chạy ─────────────────────────────────────────────────────
# Khoá Gemini truyền lúc CHẠY (--set-env-vars), không nhúng vào image.
FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=8080 HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# output:'standalone' KHÔNG gộp .next/static và public/ — phải chép riêng,
# nếu không thì CSS sẽ 404 trên production.
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 8080
CMD ["node", "server.js"]
