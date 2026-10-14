import axios from 'axios';
import { getToken, clearToken } from './auth';

// ค่าเริ่มต้น '/api' = เรียกโดเมนเดียวกับหน้าเว็บ
//  - ตอนพัฒนา: Vite proxy ส่งต่อไป backend (ดู vite.config.ts)
//  - ตอน deploy: nginx proxy ส่งต่อไป backend (ดู nginx.conf)
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// แนบ JWT ไปกับทุก request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// token หมดอายุ/ไม่ถูกต้อง -> ล้างแล้วส่งกลับหน้า Login
// (ยกเว้น login/register ซึ่ง 401 หมายถึงรหัสผ่านผิด ไม่ใช่ session หมดอายุ)
const isCredentialRequest = (url?: string) => /\/auth\/(login|register)/.test(url ?? '');

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isCredentialRequest(error.config?.url)) {
      clearToken();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);
