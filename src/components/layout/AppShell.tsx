import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

// โครงหน้าหลักหลังล็อกอิน: Sidebar + พื้นที่เนื้อหา
// มือถือ (< md): Sidebar เป็นลิ้นชักที่เปิดจากปุ่มเมนูบนแถบด้านบน / เดสก์ท็อป: แถบด้านข้างคงที่
export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        <header className="md:hidden sticky top-0 z-20 flex items-center gap-3 bg-[#1f1f1f] text-white px-4 py-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="เปิดเมนู"
            className="p-1.5 rounded-lg hover:bg-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
          <span className="text-lg font-extrabold text-[#0096fa] tracking-wide">EventsCheckIN</span>
        </header>

        <main className="flex-grow max-w-6xl mx-auto w-full md:mt-1 p-4 sm:p-6 bg-white shadow-sm md:rounded-lg border border-gray-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
