import {Routes, Route} from "react-router-dom";
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

    return(

        <Routes>
            <Route path="/" element={<Overview/> }/>
            <Route path= "/explore-events" element={<ExploreEvents/>}/>
            <Route path= "/my-events" element={<MyEvents/>}/>
            <Route path= "/profile" element={<MyAccount/>}/>

            <Route path= "/create-event" element={<CreateEvent/>}/>
            <Route path="/ticket/:ticketRef" element={<Ticket/>}/>
            <Route path="/staff/scanner" element={<StaffScanner/>}/>

            <Route path="/manage-event/:eventId" element={<OrganizerDashboard />} />
            <Route path="/edit-event/:eventId" element={<EditEvent />} />
            <Route path="/event/:eventId" element={<EventDetails />} />
        </Routes>

        )
}

export default RoutesApp;