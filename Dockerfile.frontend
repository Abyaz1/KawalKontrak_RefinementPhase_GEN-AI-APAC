# =============================================================
# KawalKontrak.ai — Frontend Next.js
#
# Build : docker build -f Dockerfile.frontend -t kawalkontrak-frontend .
# Run   : docker run --env-file .env.local -p 3000:3000 kawalkontrak-frontend
#
# Cloud Run menyuntikkan $PORT (8080); server.js standalone membacanya
# dari environment. Tanpa $PORT, default tetap 3000 (docker lokal/compose).
# =============================================================

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variabel NEXT_PUBLIC_* di-inline ke bundle saat `next build`, BUKAN
# dibaca saat runtime. Env var Cloud Run bersifat runtime, jadi nilainya
# harus masuk lewat --build-arg. Tanpa ini firebaseEnabled selalu false
# dan fitur login/riwayat cloud mati tanpa error apapun.
ARG NEXT_PUBLIC_FIREBASE_API_KEY=""
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
ARG NEXT_PUBLIC_FIREBASE_APP_ID=""
ARG NEXT_PUBLIC_APP_URL=""

ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY \
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN \
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID \
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET \
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID \
    NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0

# output:'standalone' sudah memuat server.js + node_modules minimal.
# static/ dan public/ berada di luar bundle itu, jadi disalin terpisah.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

# Jangan jalan sebagai root
USER node

EXPOSE 3000
CMD ["node", "server.js"]
