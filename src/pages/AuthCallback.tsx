import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// หน้ารับผลจาก OAuth: backend redirect มาที่ /auth/callback#token=<JWT>
// token อยู่ใน fragment จึงไม่ถูกส่งไปกับ request/ติดใน log ของ server
export default function AuthCallback() {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('token');
    // ลบ token ออกจาก URL/ประวัติทันที
    window.history.replaceState(null, '', window.location.pathname);

    if (token) {
      loginWithToken(token);
      navigate('/', { replace: true });
    } else {
      navigate('/login?error=oauth_failed', { replace: true });
    }
  }, [loginWithToken, navigate]);

  return <div className="p-12 text-center text-gray-500">กำลังเข้าสู่ระบบ...</div>;
}
