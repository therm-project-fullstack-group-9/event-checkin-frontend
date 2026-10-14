import { Routes, Route } from "react-router-dom";
import RequireAuth from "./components/auth/RequireAuth";
import AppShell from "./components/layout/AppShell";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthCallback from "./pages/AuthCallback";

import Overview from './pages/Overview.tsx'
import ExploreEvents from './pages/ExploreEvents.tsx'
import MyEvents from "./pages/MyEvents.tsx";
import MyAccount from "./pages/MyAccount.tsx";

import CreateEvent from "./pages/CreateEvent.tsx";
import Ticket from './pages/Ticket';
import StaffScanner from './pages/StaffScanner';
import OrganizerDashboard from './pages/OrganizerDashboard';
import EventDetails from './pages/EventDetails';
import EditEvent from './pages/EditEvent';

function RoutesApp() {
    return (
        <Routes>
            {/* หน้าสาธารณะ (ไม่มี Sidebar) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* หน้าที่ต้องล็อกอิน */}
            <Route element={<RequireAuth><AppShell /></RequireAuth>}>
                <Route path="/" element={<Overview/> }/>
                <Route path="/explore-events" element={<ExploreEvents/>}/>
                <Route path="/my-events" element={<MyEvents/>}/>
                <Route path="/profile" element={<MyAccount/>}/>

                <Route path="/create-event" element={<CreateEvent/>}/>
                <Route path="/ticket/:ticketRef" element={<Ticket/>}/>
                <Route path="/staff/scanner" element={<StaffScanner/>}/>

                <Route path="/manage-event/:eventId" element={<OrganizerDashboard />} />
                <Route path="/edit-event/:eventId" element={<EditEvent />} />
                <Route path="/event/:eventId" element={<EventDetails />} />
            </Route>
        </Routes>
    )
}

export default RoutesApp;
