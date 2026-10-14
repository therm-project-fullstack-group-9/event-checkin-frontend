import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { registerSchema, type RegisterFormValues } from '../schemas/authSchema';
import AuthLayout from '../components/auth/AuthLayout';
import FormField from '../components/auth/FormField';

export default function Register() {
  const { isAuthenticated, register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        emailAddress: values.emailAddress,
        phoneNumber: values.phoneNumber || undefined,
        password: values.password,
      });
      navigate('/', { replace: true });
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      setServerError(err.response?.data?.message ?? 'ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <AuthLayout title="สมัครสมาชิก" subtitle="สร้างบัญชีเพื่อจองตั๋วและสร้างกิจกรรม">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {serverError && (
          <div role="alert" className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200">
            ❌ {serverError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="ชื่อจริง" autoComplete="given-name" error={errors.firstName?.message} {...register('firstName')} />
          <FormField label="นามสกุล" autoComplete="family-name" error={errors.lastName?.message} {...register('lastName')} />
        </div>
        <FormField
          label="อีเมล"
          type="email"
          autoComplete="email"
          error={errors.emailAddress?.message}
          {...register('emailAddress')}
        />
        <FormField
          label="เบอร์โทรศัพท์ (ไม่บังคับ)"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="0812345678"
          error={errors.phoneNumber?.message}
          {...register('phoneNumber')}
        />
        <FormField
          label="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <FormField
          label="ยืนยันรหัสผ่าน"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-xl text-sm transition"
        >
          {isSubmitting ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        มีบัญชีอยู่แล้ว?{' '}
        <Link to="/login" className="text-indigo-600 font-medium hover:underline">
          เข้าสู่ระบบ
        </Link>
      </p>
    </AuthLayout>
  );
}
