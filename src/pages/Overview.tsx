import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../libs/api';
import { formatThaiDate } from '../libs/formatDate';

export default function Overview() {
  const [user, setUser] = useState<{ firstName: string; lastName: string } | null>(null);
  const [myItems, setMyItems] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const [profileRes, myBookingsRes, eventsRes] = await Promise.all([
          api.get('/profile'),
          api.get('/my-bookings'),
          api.get('/events'),
        ]);
        setUser(profileRes.data);
        setMyItems(myBookingsRes.data);
        setUpcomingEvents(eventsRes.data.slice(0, 3)); // แสดงกิจกรรมแนะนำ 3 งานล่าสุด
      } catch (error) {
        console.error('Error fetching overview:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOverviewData();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-gray-500">กำลังโหลดภาพรวมระบบ...</div>;
  }

  const attendeeTickets = myItems.filter((i) => i.role === 'Attendee');
  const checkedInCount = attendeeTickets.filter((i) => i.bookingStatus === 'CHECKED_IN').length;
  const organizedCount = myItems.filter((i) => i.role === 'Organizer').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* แบนเนอร์ต้อนรับ */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-md mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
            EVENTS CHECK-IN SYSTEM
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold mt-3">
            สวัสดีคุณ {user ? `${user.firstName} ${user.lastName}` : 'ผู้ใช้งาน'} 👋
          </h1>
          <p className="text-indigo-100 text-sm mt-1">
            ยินดีต้อนรับสู่ระบบจัดการอีเวนต์และสแกนตั๋วเข้างานด้วย QR Code
          </p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <Link
            to="/explore-events"
            className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-sm px-5 py-2.5 rounded-xl transition shadow-sm"
          >
            🔍 สำรวจกิจกรรม
          </Link>
          <Link
            to="/create-event"
            className="bg-indigo-500/40 hover:bg-indigo-500/60 border border-white/30 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition"
          >
            + สร้างกิจกรรมใหม่
          </Link>
        </div>
      </div>

      {/* การ์ดสรุปสถิติส่วนตัว */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">ตั๋วเข้างานของฉันทั้งหมด</p>
            <p className="text-3xl font-bold text-indigo-600 mt-1">{attendeeTickets.length} ใบ</p>
          </div>
          <span className="text-3xl bg-indigo-50 p-3 rounded-2xl">🎟️</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">เช็คอินเข้างานแล้ว</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">{checkedInCount} งาน</p>
          </div>
          <span className="text-3xl bg-emerald-50 p-3 rounded-2xl">✅</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">กิจกรรมที่ฉันเป็นผู้จัด</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">{organizedCount} งาน</p>
          </div>
          <span className="text-3xl bg-purple-50 p-3 rounded-2xl">🎪</span>
        </div>
      </div>

      {/* ส่วนแสดงตั๋วล่าสุดของฉัน */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">ตั๋วเข้างานล่าสุดของคุณ</h2>
          <Link to="/my-events" className="text-sm text-indigo-600 hover:underline font-medium">
            ดูทั้งหมด →
          </Link>
        </div>

        {attendeeTickets.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 text-sm text-gray-500">
            คุณยังไม่มีตั๋วเข้างานในขณะนี้
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attendeeTickets.slice(0, 2).map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between gap-4"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-600">
                    {ticket.ticketRef}
                  </span>
                  <h3 className="font-bold text-gray-900 text-base mt-0.5">{ticket.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    📅 {formatThaiDate(ticket.date)} | 🕒 รอบ {ticket.sessionTime}
                  </p>
                </div>
                <Link
                  to={`/ticket/${ticket.ticketRef}`}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shrink-0 transition"
                >
                  เปิด QR Code
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ส่วนกิจกรรมแนะนำ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">กิจกรรมที่กำลังเปิดรับลงทะเบียน</h2>
          <Link to="/explore-events" className="text-sm text-indigo-600 hover:underline font-medium">
            สำรวจทั้งหมด →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingEvents.map((ev) => (
            <div
              key={ev.eventId}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div>
                <img src={ev.imageUrl} alt={ev.eventName} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    {ev.category}
                  </span>
                  <h3 className="font-bold text-gray-900 mt-2 line-clamp-1">{ev.eventName}</h3>
                  <p className="text-xs text-gray-500 mt-1">
  📅                {formatThaiDate(ev.eventDate)} • 📍 {ev.venue}
                  </p>
                </div>
              </div>
              <div className="p-4 pt-0">
                <Link
                  to={`/event/${ev.eventId}`}
                  className="block w-full text-center bg-gray-50 hover:bg-indigo-50 text-indigo-600 font-semibold text-xs py-2.5 rounded-xl border border-gray-200 transition"
                >
                  ดูรายละเอียด / จองตั๋ว
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}