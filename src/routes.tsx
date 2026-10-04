import { Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import Overview from './pages/Overview.tsx';
import ExploreEvents from './pages/ExploreEvents.tsx';
import MyEvents from "./pages/MyEvents.tsx";
import MyAccount from "./pages/MyAccount.tsx";

import CreateEvent from "./pages/CreateEvent.tsx";
import Ticket from './pages/Ticket';
import StaffScanner from './pages/StaffScanner';
import OrganizerDashboard from './pages/OrganizerDashboard';
import EventDetails from './pages/EventDetails';
import EditEvent from './pages/EditEvent';
import Login from './pages/Login';
import { useAppStore } from './store/useAppStore';

// 🛡️ ตัวป้องกัน Route: ถ้ายังไม่ Login จะส่งไปหน้าที่กำหนด (ค่าเริ่มต้นคือ /login)
function ProtectedRoute({ children, redirectTo = "/login" }: { children: ReactNode; redirectTo?: string }) {
  const currentUser = useAppStore((state) => state.currentUser);
  if (!currentUser) {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
}

function RoutesApp() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* หน้าแรก (/): ถ้าล็อกอินแล้วให้ไป Overview ถ้ายังไม่ล็อกอินให้ไปหน้า ExploreEvents เป็นค่าเริ่มต้น */}
      <Route
        path="/"
        element={
          <ProtectedRoute redirectTo="/explore-events">
            <Overview />
          </ProtectedRoute>
        }
      />

      {/* หน้าที่เปิดให้ดูได้ทุกคนแม้ยังไม่ล็อกอิน */}
      <Route path="/explore-events" element={<ExploreEvents />} />
      <Route path="/event/:eventId" element={<EventDetails />} />

      {/* หน้าที่ต้องล็อกอินก่อนเท่านั้นถึงจะเข้าได้ */}
      <Route path="/my-events" element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
      <Route path="/create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
      <Route path="/ticket/:ticketRef" element={<ProtectedRoute><Ticket /></ProtectedRoute>} />
      <Route path="/staff/scanner" element={<ProtectedRoute><StaffScanner /></ProtectedRoute>} />
      <Route path="/manage-event/:eventId" element={<ProtectedRoute><OrganizerDashboard /></ProtectedRoute>} />
      <Route path="/edit-event/:eventId" element={<ProtectedRoute><EditEvent /></ProtectedRoute>} />
    </Routes>
  );
}

export default RoutesApp;