# Budget Tracker (50-30-20)

App untuk mengelola budget bulanan dengan metode **50-30-20** (Kebutuhan 50%, Keinginan 30%, Tabungan 20%).

## Fitur

- Autentikasi email & password (better-auth) dengan proteksi route
- Pembuatan budget dengan pembagian 50-30-20 otomatis dari pendapatan bulanan
- Pencatatan pengeluaran per kategori (needs / wants / savings)
- Dashboard ringkasan: alokasi vs pengeluaran, sisa budget, dan grafik
- Sidebar kolapsibel (icon rail) di desktop, drawer di mobile
- Tema terang / gelap

## Tech Stack

| Layer      | Teknologi                                             |
| ---------- | ----------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack)                     |
| Auth       | better-auth (email & password, `nextCookies` plugin)   |
| Database   | PostgreSQL + Drizzle ORM                              |
| UI         | Tailwind CSS 4, shadcn/ui (base-ui), Phosphor Icons    |
| Chart      | Recharts                                              |
| Form       | react-hook-form + Zod                                 |
| Toast      | sonner                                                |
| E2E        | Playwright                                            |

## Prasyarat

- Node.js 20+
- PostgreSQL 16 (lokal) — atau sesuaikan `DATABASE_URL` ke instance lain

## Setup

1. Install dependencies

```bash
npm install
```

2. Konfigurasi environment — buat file `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/budget_tracker"
BETTER_AUTH_SECRET="<generate dengan: openssl rand -hex 32>"
BETTER_AUTH_URL="http://localhost:3001"
```

3. Buat database dan jalankan migrasi

```bash
createdb budget_tracker          # atau: CREATE DATABASE budget_tracker;
npx drizzle-kit migrate
```

4. Jalankan dev server

```bash
npm run dev
```

Buka `http://localhost:3001` — jika belum login akan diarahkan ke `/signin`.

> Catatan: jika memakai port lain, tambahkan origin tersebut ke `trustedOrigins` di `lib/auth/index.ts` dan sesuaikan `BETTER_AUTH_URL`.

## Scripts

| Script         | Perintah                 | Fungsi                                  |
| -------------- | ------------------------ | --------------------------------------- |
| dev            | `npm run dev`            | Dev server (port 3001)                  |
| build          | `npm run build`          | Production build                        |
| start          | `npm run start`          | Jalankan production build               |
| lint           | `npm run lint`           | ESLint                                  |
| test:e2e       | `npm run test:e2e`       | Playwright e2e (harus dev server jalan) |

## Testing E2E

Playwright menguji dua suite:

- `e2e/flow.spec.ts` — user journey lengkap: guard auth, signup, budget, pengeluaran, edit/delete, logout, login
- `e2e/security.spec.ts` — pengujian keamanan:
  - API menolak kredensial salah (401, tanpa session cookie)
  - Login gagal menampilkan error dan tidak redirect
  - Password lemah (< 8 karakter) ditolak
  - Email duplikat tidak bisa daftar dua kali
  - Session cookie `better-auth.session_token` bersifat HttpOnly
  - Logout menginvalidasi session (dashboard tidak lagi bisa diakses)
  - Orphan/expired session cookie (user dihapus) ditolak — redirect ke `/signin` + cookie dibersihkan, bukan 500 atau loop
  - Isolasi antar-user: data user A tidak terlihat oleh user B (RLS)

Jalankan:

```bash
npm run test:e2e
```

Test membuat akun sekali pakai (email acak). Bersihkan setelahnya:

```bash
node --env-file=.env e2e/cleanup.mjs <email-atau-prefix>
# contoh: node --env-file=.env e2e/cleanup.mjs sec-
```

## Keamanan

- Autentikasi ditangani sepenuhnya oleh better-auth (password di-hash)
- Route non-publik dilindungi oleh `proxy.ts` (redirect ke `/signin`)
- Server actions memverifikasi session via `auth.api.getSession` sebelum akses data
- Tabel `budgets` & `expenses` memakai Row Level Security; kolom `user_id` selalu difilter per session
- Tabel auth (user/session/account/verification) tanpa RLS — dikelola better-auth
- Session cookie HttpOnly diset oleh plugin `nextCookies`

## Struktur Proyek

```
app/
  (auth)/signin/        # halaman login & register (toggle)
  dashboard/            # layout + halaman dashboard, budget, expenses
  api/auth/[...all]/    # endpoint better-auth
  proxy.ts              # route protection (redirect otentikasi)
components/
  ui/                   # komponen shadcn/base-ui
  budget/ expenses/ dashboard/  # komponen fitur
lib/
  auth/                 # konfigurasi better-auth
  db/                   # Drizzle client + schema
  actions/              # server actions (budget, expense)
  validations/          # skema Zod
drizzle/                # migrasi database
e2e/                    # test Playwright
```