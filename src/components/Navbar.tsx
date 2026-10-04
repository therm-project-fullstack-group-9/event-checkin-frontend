import { useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const isActive = (path: string) => location.pathname === path;

  
  const menuClasses = (path: string) => `
    flex items-center py-3 cursor-pointer transition-colors
    ${isOpen ? "px-6 space-x-4" : "justify-center"}
    ${isActive(path) 
      ? "bg-white/10 text-white font-medium border-l-4 border-[#0096fa]" 
      : "hover:bg-white/5 hover:text-white border-l-4 border-transparent text-gray-400"
    }
  `;

  return (
    <nav 
      className={`flex flex-col h-screen bg-[#1f1f1f] text-gray-300 shadow-2xl transition-all duration-300 ease-in-out ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      
      
      <div className={`flex items-center py-6 mb-2 ${isOpen ? "px-5 space-x-4" : "justify-center"}`}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 focus:outline-none flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
          </svg>
        </button>
        
        <span className={`text-xl font-extrabold text-[#0096fa] tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300 ${
          isOpen ? "w-auto opacity-100" : "w-0 opacity-0"
        }`}>
          EventsCheckIN
        </span>
      </div>

      
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <ul className="flex flex-col space-y-1">
          
          <li onClick={() => navigate("/")} title="ภาพรวม" className={menuClasses("/")}>
            <div className="flex-shrink-0">
              
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isOpen ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
              ภาพรวม
            </span>
          </li>
          
          <li onClick={() => navigate("/explore-events")} title="สำรวจกิจกรรม" className={menuClasses("/explore-events")}>
            <div className="flex-shrink-0">
              
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
              </svg>
            </div>
            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isOpen ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
              สำรวจกิจกรรม
            </span>
          </li>

          <li onClick={() => navigate("/my-events")} title="กิจกรรมของฉัน" className={menuClasses("/my-events")}>
            <div className="flex-shrink-0">
              
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>
              </svg>
            </div>
            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isOpen ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
              กิจกรรมของฉัน
            </span>
          </li>

        </ul>
      </div>

      
      <div className="mt-auto border-t border-white/10 pt-2 pb-4 overflow-x-hidden">
        <ul className="flex flex-col space-y-1">
          
          <li onClick={() => navigate("/profile")} title="บัญชีของฉัน" className={menuClasses("/profile")}>
            <div className="flex-shrink-0">
              
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isOpen ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
              บัญชีของฉัน
            </span>
          </li>

          <li 
            
            onClick={() => navigate("/login")} 
            title="ออกจากระบบ" 
            className={`flex items-center py-3 cursor-pointer transition-colors text-red-400 hover:bg-red-500/10 hover:text-red-300 border-l-4 border-transparent ${isOpen ? "px-6 space-x-4" : "justify-center"}`}
          >
            <div className="flex-shrink-0">
              
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
              </svg>
            </div>
            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isOpen ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
              ออกจากระบบ
            </span>
          </li>

        </ul>
      </div>

    </nav>
  );
}

export default Navbar;