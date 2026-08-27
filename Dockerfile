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

# Địa chỉ công khai bị nướng vào thẻ og:image LÚC BUILD — trang chủ là trang dựng
# sẵn, và trên Cloud Run `req.url` chỉ là 0.0.0.0:8080 của container. Bỏ trống thì
# app/layout.tsx lùi về địa chỉ AI Studio, vẫn là một địa chỉ thật.
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Cấu hình Firebase cũng phải có mặt LÚC BUILD — Next nướng NEXT_PUBLIC_* vào
# gói JavaScript gửi xuống trình duyệt, truyền lúc chạy thì không tới nơi.
# Thiếu thì app vẫn dựng được, chỉ là không đồng bộ (xem lib/firebase.client.ts).
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY \
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN \
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID \
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET \
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID \
    NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID

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
