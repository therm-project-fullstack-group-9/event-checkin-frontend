# Events Check-in — Frontend

เว็บจัดการอีเวนต์และเช็คอินด้วย QR Code (Term Project กลุ่ม 9)
React 19 + Vite + TypeScript + Tailwind 4 + react-router 7

- เว็บที่ deploy แล้ว: https://fsg19.cpecmu.com
- Backend: repo `event-checkin-backend` (Express + Drizzle + PostgreSQL)

## ฟีเจอร์

- สมัครสมาชิก / เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน หรือ **CMU OAuth (Mock)**; session ด้วย JWT
- สำรวจกิจกรรม จองตั๋วตามรอบเวลา ดูตั๋ว QR ของตัวเอง
- ผู้จัด: สร้าง/แก้ไขกิจกรรม ดู dashboard ผู้ลงทะเบียน ส่งออก Excel/PDF
- เจ้าหน้าที่: สแกนตั๋วเข้างาน (กล้อง หรือกรอกรหัสสำรอง)
- ตั๋วที่ไม่มาตามรอบจะเป็นสถานะ `NO_SHOW` และผู้ใช้อาจถูกระงับสิทธิ์จองตามกติกาของ backend
- รองรับมือถือ (เมนู drawer)

## เริ่มพัฒนา

ต้องมี Node 22+ และ pnpm และต้องเปิด backend ไว้ที่พอร์ต 4000 ก่อน (ดู README ของ backend)

```bash
pnpm install
cp .env.example .env     # ค่าเริ่มต้น VITE_API_BASE_URL=/api ใช้ได้เลย
pnpm dev                 # http://localhost:5173
```

ตอนพัฒนา Vite จะส่งต่อทุก request ที่ขึ้นต้นด้วย `/api` ไปที่ `http://localhost:4000`
(เปลี่ยนได้ด้วย `VITE_PROXY_TARGET`) ทำให้ callback ของ OAuth
`http://localhost:5173/api/auth/callback` ใช้งานได้

| คำสั่ง | ทำอะไร |
| --- | --- |
| `pnpm dev` | รัน dev server |
| `pnpm build` | ตรวจ type (`tsc -b`) แล้ว build เป็นไฟล์ static ใน `dist/` |
| `pnpm lint` | oxlint |
| `pnpm cy:run` / `pnpm cy:open` | Cypress E2E (ไม่ต้องเปิด backend, จำลอง API ด้วย intercept) |

## โครงสร้างโค้ด

```
src/
  pages/        หน้าจอแต่ละหน้า
  components/   แยกตามฟีเจอร์: auth, dashboard, events, myevents, scanner, tickets, layout
  context/      AuthContext (token, ผู้ใช้ปัจจุบัน, login/register/logout)
  lib/          api.ts (axios + แนบ JWT + จัดการ 401), auth.ts (เก็บ token)
  schemas/      zod schema ของฟอร์ม
  types/        interface ของข้อมูลจาก API
  constants/    ค่าคงที่
cypress/        E2E specs, fixtures, support
```

## การยืนยันตัวตน

- token เก็บใน `localStorage` และแนบเป็น `Authorization: Bearer` ทุก request
- หน้าที่ต้องล็อกอินครอบด้วย `RequireAuth` ถ้า backend ตอบ 401 จะล้าง token แล้วกลับ `/login`
- OAuth: ปุ่ม "เข้าสู่ระบบด้วย CMU OAuth" ไปที่ `/api/auth/cmu` -> หน้าล็อกอิน CMU ->
  backend `/api/auth/callback` -> กลับมาที่ `/auth/callback#token=...`
- บัญชีทดสอบของ CMU OAuth ดูรายละเอียดในเอกสารของอาจารย์

## Deploy

GitHub Actions (`.github/workflows/docker-publish.yml`) build image แล้ว push ขึ้น Docker Hub
(`<user>/eventscheckin-frontend`) ทุกครั้งที่ push เข้า `main` ต้องตั้ง secret
`DOCKERHUB_USERNAME` และ `DOCKERHUB_TOKEN` ที่ repo

image นี้คือ nginx ที่เสิร์ฟไฟล์ static และส่งต่อ `/api/` ไปที่ service ชื่อ `backend`
(พอร์ต 4000) จึงต้องรันคู่กับ backend ผ่าน docker compose ไฟล์ตั้งค่าอยู่ใน repo backend
ที่ `deploy/docker-compose.prod.yml` (เปิดพอร์ต frontend ออกนอกแค่ตัวเดียว)

build เองด้วยมือ:

```bash
docker build --build-arg VITE_API_BASE_URL=/api -t eventscheckin-frontend .
```
