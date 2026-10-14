import { useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  /** มือถือ: ลิ้นชักเมนูเปิดอยู่หรือไม่ (จอ md ขึ้นไปไม่ใช้ค่านี้) */
  mobileOpen?: boolean;
  onClose?: () => void;
}

function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  const isActive = (path: string) => location.pathname === path;

  // ไปหน้าอื่นแล้วปิดลิ้นชักบนมือถือ
  const go = (path: string) => {
    navigate(path);
    onClose?.();
  };

  
  const menuClasses = (path: string) => `
    flex items-center py-3 cursor-pointer transition-colors
    px-6 space-x-4 ${isOpen ? "" : "md:justify-center md:px-0 md:space-x-0"}
    ${isActive(path) 
      ? "bg-white/10 text-white font-medium border-l-4 border-[#0096fa]" 
      : "hover:bg-white/5 hover:text-white border-l-4 border-transparent text-gray-400"
    }
  `;

  return (
    <nav 
      // มือถือ: เป็นลิ้นชักลอยทับเนื้อหา (กว้างคงที่ ซ่อน/แสดงด้วย translate)
      // md ขึ้นไป: เป็นแถบด้านข้างเหมือนเดิม พับเหลือไอคอนได้
      className={`fixed inset-y-0 left-0 z-40 w-64 md:static md:z-auto md:translate-x-0 flex flex-col h-screen bg-[#1f1f1f] text-gray-300 shadow-2xl transition-all duration-300 ease-in-out ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } ${isOpen ? "md:w-64" : "md:w-20"}`}
    >
      
      
      <div className={`flex items-center py-6 mb-2 px-5 space-x-4 ${isOpen ? "" : "md:justify-center md:px-0 md:space-x-0"}`}>
        <button 
          onClick={() => {
            // มือถือ: ปุ่มนี้ปิดลิ้นชัก / เดสก์ท็อป: พับ-ขยายแถบข้าง
            if (window.matchMedia("(min-width: 768px)").matches) setIsOpen(!isOpen);
            else onClose?.();
          }}
          aria-label="สลับเมนู"
          className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 focus:outline-none flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
          </svg>
        </button>
        
        <span className={`text-xl font-extrabold text-[#0096fa] tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300 ${
          "w-auto opacity-100 " + (isOpen ? "" : "md:w-0 md:opacity-0")
        }`}>
          EventsCheckIN
        </span>
      </div>

      
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <ul className="flex flex-col space-y-1">
          
          <li onClick={() => go("/")} title="ภาพรวม" className={menuClasses("/")}>
            <div className="flex-shrink-0">
              
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 w-auto opacity-100 ${isOpen ? "" : "md:w-0 md:opacity-0"}`}>
              ภาพรวม
            </span>
          </li>
          
          <li onClick={() => go("/explore-events")} title="สำรวจกิจกรรม" className={menuClasses("/explore-events")}>
            <div className="flex-shrink-0">
              
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
              </svg>
            </div>
            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 w-auto opacity-100 ${isOpen ? "" : "md:w-0 md:opacity-0"}`}>
              สำรวจกิจกรรม
            </span>
          </li>

          <li onClick={() => go("/my-events")} title="กิจกรรมของฉัน" className={menuClasses("/my-events")}>
            <div className="flex-shrink-0">
              
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>
              </svg>
            </div>
            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 w-auto opacity-100 ${isOpen ? "" : "md:w-0 md:opacity-0"}`}>
              กิจกรรมของฉัน
            </span>
          </li>

        </ul>
      </div>

      
      <div className="mt-auto border-t border-white/10 pt-2 pb-4 overflow-x-hidden">
        <ul className="flex flex-col space-y-1">
          
          <li onClick={() => go("/profile")} title="บัญชีของฉัน" className={menuClasses("/profile")}>
            <div className="flex-shrink-0">
              
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 w-auto opacity-100 ${isOpen ? "" : "md:w-0 md:opacity-0"}`}>
              บัญชีของฉัน
            </span>
          </li>

          <li 
            
            onClick={() => {
              logout();
              navigate("/login");
            }}
            title="ออกจากระบบ" 
            className={`flex items-center py-3 cursor-pointer transition-colors text-red-400 hover:bg-red-500/10 hover:text-red-300 border-l-4 border-transparent px-6 space-x-4 ${isOpen ? "" : "md:justify-center md:px-0 md:space-x-0"}`}
          >
            <div className="flex-shrink-0">
              
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
              </svg>
            </div>
            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 w-auto opacity-100 ${isOpen ? "" : "md:w-0 md:opacity-0"}`}>
              ออกจากระบบ
            </span>
          </li>

        </ul>
      </div>

    </nav>
  );
}

export default Sidebar;