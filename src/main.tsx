import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useAppStore } from './store/useAppStore';


// ============================================================================
// Global API Interceptor: แนบ x-user-id header ให้ทุกคำขอ fetch() โดยอัตโนมัติ (ถ้ามี User ในแท็บปัจจุบัน)
// ============================================================================
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  // ดึง User ของแท็บปัจจุบันจาก Zustand (ซึ่งเก็บใน sessionStorage แยกแต่ละแท็บ)
  const currentUser = useAppStore.getState().currentUser;

  const headers = new Headers(init?.headers || {});
  if (currentUser?.userId && !headers.has('x-user-id')) {
    headers.set('x-user-id', currentUser.userId);
  }

  return originalFetch(input, {
    ...init,
    headers,
  });
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
