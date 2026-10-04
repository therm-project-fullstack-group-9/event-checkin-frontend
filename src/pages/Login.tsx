import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

// 1. กำหนด Schema ด้วย Zod ฝั่ง Frontend
const loginFormSchema = z.object({
  emailAddress: z
    .string()
    .min(1, 'กรุณากรอกอีเมล')
    .email('รูปแบบอีเมลไม่ถูกต้อง (เช่น worapop.k@cmu.ac.th)'),
  password: z
    .string()
    .min(4, 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export default function Login() {
  const navigate = useNavigate();
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  const [serverError, setServerError] = useState<string | null>(null);
  const [demoUsers, setDemoUsers] = useState<any[]>([]);

  // 2. ผูก React Hook Form เข้ากับ Zod
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      emailAddress: '',
      password: 'hashed_password_123',
    },
  });

  // ดึงรายชื่อบัญชีตัวอย่างมาแสดงเพื่อให้กดสลับเทสต์ 2 แท็บได้ง่าย
  useEffect(() => {
    fetch(`${API_BASE}/auth/demo-users`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDemoUsers(data);
      })
      .catch(() => {});
  }, []);

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) {
        setServerError(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
        return;
      }

      // บันทึก User ลง Zustand (เก็บแยกเฉพาะแท็บนี้ใน sessionStorage)
      setCurrentUser(data.user);
      navigate('/');
    } catch (err) {
      setServerError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">เข้าสู่ระบบ EventsCheckIN</h1>
        <p className="text-sm text-slate-500 mb-6">
          รองรับการเปิดหลายแท็บเพื่อล็อกอินแยกบัญชีพร้อมกัน (Multi-Tab Session)
        </p>

        {serverError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">อีเมล</label>
            <input
              type="email"
              placeholder="worapop.k@cmu.ac.th"
              {...register('emailAddress')}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {errors.emailAddress && (
              <p className="text-xs text-red-500 mt-1">{errors.emailAddress.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่าน</label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition disabled:opacity-50"
          >
            {isSubmitting ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        {/* ปุ่มเลือกบัญชีด่วนสำหรับสาธิตการเปิด 2 แท็บ 2 User */}
        {demoUsers.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              เลือกบัญชีทดสอบด่วน (คลิกเพื่อกรอกอัตโนมัติ)
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {demoUsers.map((u) => (
                <button
                  key={u.userId}
                  type="button"
                  onClick={() => {
                    setValue('emailAddress', u.emailAddress, { shouldValidate: true });
                    setValue('password', 'hashed_password_123', { shouldValidate: true });
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 transition flex items-center justify-between text-sm"
                >
                  <div>
                    <span className="font-medium text-slate-800">
                      {u.firstName} {u.lastName}
                    </span>
                    <span className="block text-xs text-slate-500">{u.emailAddress}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                    {u.occupation || 'User'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}