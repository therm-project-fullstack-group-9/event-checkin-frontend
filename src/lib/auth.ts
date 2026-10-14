// เก็บ JWT ไว้ใน localStorage (ห่อ try/catch เพราะบางโหมดเบราว์เซอร์ปิดการเข้าถึง storage)
const TOKEN_KEY = 'eventscheckin_token';

export const getToken = (): string | null => {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string) => {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ใช้งานต่อได้ในหน่วยความจำ แต่จะไม่คงอยู่หลังรีเฟรช */
  }
};

export const clearToken = () => {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ไม่มีอะไรต้องล้าง */
  }
};
