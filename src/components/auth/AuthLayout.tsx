import type { ReactNode } from 'react';

// กรอบหน้า Login/Register (ไม่มี Sidebar) ใช้ร่วมกัน
export default function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <span className="text-2xl font-extrabold text-[#0096fa] tracking-wide">EventsCheckIN</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
