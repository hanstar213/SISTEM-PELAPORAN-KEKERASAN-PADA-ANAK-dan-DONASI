# PeduliAnak

Platform untuk pelaporan kasus anak, donasi transparan, dan dashboard admin.

## Arsitektur

```
Browser --> Next.js App (app router) --> Prisma --> PostgreSQL
                  |-- /api/reports
                  |-- /api/donations
                  |-- /api/chatbot
                  |-- /api/notifications
                  |-- /api/push/subscribe
                  |-- /api/push/notify
                  |-- /api/auth/[...nextauth]
                  |-- /admin/* protected by middleware
```

## Fitur utama

- Chatbot PeduliBot dengan Gemini AI
- Sistem notifikasi CRUD
- Web Push notifikasi dengan service worker
- Input sanitization dengan DOMPurify
- API rate limiting sederhana
- CSRF/auth gating menggunakan NextAuth
- Audit log untuk aksi admin
- Docker + Docker Compose untuk local development
- CI/CD workflow untuk lint, build, dan deploy ke Vercel

## Instalasi lokal

1. Salin example env:

```bash
cp .env.example .env
```

2. Isi variabel lingkungan:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GEMINI_API_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`

> Jangan pernah commit API key atau secret ke repo.

3. Install dependencies:

```bash
npm install
```

4. Jalankan Prisma:

```bash
npx prisma db push
npx prisma generate
```

5. Jalankan aplikasi:

```bash
npm run dev
```

## Docker

```bash
docker compose up --build
```

## CI/CD

Workflow GitHub Actions ada di `.github/workflows/ci.yml`.

## Catatan keamanan

- `next.config.js` menambahkan security headers standar
- `middleware.ts` melindungi route `/admin/*`
- API route menggunakan rate limiting dan sanitization
- Chatbot menyimpan history di `sessionStorage`
- Web Push terdaftar melalui `public/sw.js`

## Deployment

1. Set environment variables di Vercel
2. Tambahkan `VERCEL_TOKEN` dan `VERCEL_PROJECT_ID` di repository secrets
3. Push ke branch `main`

## Diagram Deployment

```
[Developer] --> GitHub --> Vercel
                 |         
                 |---> CI: lint, build, test
```
