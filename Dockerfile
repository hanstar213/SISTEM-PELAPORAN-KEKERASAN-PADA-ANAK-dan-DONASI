FROM node:20-alpine

WORKDIR /app

# ... (kode sebelumnya)

# 1. Salin file dependensi
COPY package.json package-lock.json* ./

# 2. Salin folder prisma AGAR prisma generate bisa berjalan
COPY prisma ./prisma/

# 3. Jalankan instalasi
RUN npm install --production

# 4. Baru salin sisa kode aplikasi Anda
COPY . .

# ... (kode setelahnya)

RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production
CMD ["npm", "start"]
