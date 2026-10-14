import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { loginSchema, type LoginFormValues } from '../schemas/authSchema';
import AuthLayout from '../components/auth/AuthLayout';
import FormField from '../components/auth/FormField';

// ข้อความสำหรับ error code ที่ backend ส่งกลับมาทาง ?error= หลังล็อกอิน OAuth ไม่สำเร็จ
const OAUTH_ERRORS: Record<string, string> = {
  oauth_invalid_state: 'การยืนยันตัวตนไม่ถูกต้องหรือหมดอายุ กรุณาลองใหม่',
  oauth_token_failed: 'ไม่สามารถยืนยันตัวตนกับ CMU OAuth ได้',
  oauth_no_email: 'ไม่ได้รับอีเมลจาก CMU OAuth',
  oauth_failed: 'เข้าสู่ระบบด้วย CMU OAuth ไม่สำเร็จ กรุณาลองใหม่',
};

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from ?? '/';
  const oauthError = new URLSearchParams(location.search).get('error');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  // ล็อกอินอยู่แล้ว (หรือเพิ่งล็อกอินสำเร็จ) → ไปหน้าที่ตั้งใจจะเข้า ไม่ใช่หน้าหลักเสมอ
  if (isAuthenticated) return <Navigate to={from} replace />;

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await login(values.emailAddress, values.password);
      navigate(from, { replace: true });
    } catch (error) {
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      setServerError(
        err.response?.data?.message ??
          (err.response?.status === 429
            ? 'พยายามเข้าสู่ระบบบ่อยเกินไป กรุณาลองใหม่ภายหลัง'
            : 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง'),
      );
    }
  };

  // OAuth เริ่มที่ backend: /api/auth/cmu -> หน้าล็อกอิน CMU -> /api/auth/callback -> กลับมา /auth/callback
  const startOAuth = () => {
    window.location.assign(`${api.defaults.baseURL}/auth/cmu`);
  };

  const bannerError = serverError ?? (oauthError ? OAUTH_ERRORS[oauthError] ?? 'เข้าสู่ระบบไม่สำเร็จ' : null);

  return (
    <AuthLayout title="เข้าสู่ระบบ" subtitle="ยินดีต้อนรับกลับ เข้าสู่ระบบเพื่อจัดการตั๋วและกิจกรรมของคุณ">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {bannerError && (
          <div role="alert" className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200">
            ❌ {bannerError}
          </div>
        )}

        <FormField
          label="อีเมล"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.emailAddress?.message}
          {...register('emailAddress')}
        />
        <FormField
          label="รหัสผ่าน"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-xl text-sm transition"
        >
          {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5 text-xs text-gray-400">
        <div className="flex-1 h-px bg-gray-200" />
        หรือ
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <button
        type="button"
        onClick={startOAuth}
        className="w-full border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-2.5 rounded-xl text-sm transition"
      >
        🎓 เข้าสู่ระบบด้วย CMU OAuth
      </button>

      <p className="text-center text-sm text-gray-500 mt-6">
        ยังไม่มีบัญชี?{' '}
        <Link to="/register" className="text-indigo-600 font-medium hover:underline">
          สมัครสมาชิก
        </Link>
      </p>
    </AuthLayout>
  );
}
