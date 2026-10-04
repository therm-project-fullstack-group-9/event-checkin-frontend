import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../libs/api';
import { formatThaiDate } from '../libs/formatDate';

interface MyEventItem {
  id: string;
  eventId: string;
  title: string;
  date: string;
  venue?: string;
  sessionTime?: string;
  imageUrl: string;
  role: 'Attendee' | 'Organizer' | 'Staff';
  ticketRef?: string;
  bookingStatus?: 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED';
}

export default function MyEvents() {
  const [items, setItems] = useState<MyEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'attendee' | 'organizer'>('all');

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const response = await api.get('/my-bookings');
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching my events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyEvents();
  }, []);

  // กรองรายการตามแถบ Tab ที่เลือก
  const filteredItems = items.filter((item) => {
    if (activeTab === 'attendee') return item.role === 'Attendee' || item.role === 'Staff';
    if (activeTab === 'organizer') return item.role === 'Organizer';
    return true;
  });

  if (loading) {
    return <div className="p-12 text-center text-gray-500">กำลังโหลดข้อมูลกิจกรรมของฉัน...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* ส่วนหัวและปุ่ม + สร้างกิจกรรมใหม่ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">กิจกรรมของฉัน</h1>
          <p className="text-sm text-gray-500 mt-1">จัดการกิจกรรมที่คุณสร้างและตั๋วที่คุณมี</p>
        </div>
        <Link
          to="/create-event"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition w-fit"
        >
          + สร้างกิจกรรมใหม่
        </Link>
      </div>

      {/* แถบเมนูสลับหมวดหมู่ (Tabs) */}
      <div className="flex gap-6 border-b border-gray-200 mb-6 text-sm">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`pb-3 font-medium border-b-2 transition ${
            activeTab === 'all'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          ทั้งหมด
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('attendee')}
          className={`pb-3 font-medium border-b-2 transition ${
            activeTab === 'attendee'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          ที่เข้าร่วม / ตั๋วของฉัน
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('organizer')}
          className={`pb-3 font-medium border-b-2 transition ${
            activeTab === 'organizer'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          กิจกรรมที่ฉันสร้าง
        </button>
      </div>

      {/* รายการการ์ดแบบใหม่ (Vertical Modern Card) */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <p className="text-gray-500 mb-4">ยังไม่มีรายการกิจกรรมในหมวดหมู่นี้</p>
          <Link
            to="/explore-events"
            className="inline-block bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
          >
            ไปสำรวจกิจกรรมน่าสนใจ
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                {/* ส่วนรูปภาพด้านบน + ป้ายกำกับลอยบนรูป */}
                <div className="relative h-44">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />

                  {/* ป้ายบอกบทบาท (มุมซ้ายบน) */}
                  <span
                    className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full shadow-sm ${
                      item.role === 'Attendee'
                        ? 'bg-sky-500 text-white'
                        : item.role === 'Organizer'
                        ? 'bg-purple-600 text-white'
                        : 'bg-teal-600 text-white'
                    }`}
                  >
                    {item.role}
                  </span>

                  {/* ป้ายสถานะการเช็คอิน เฉพาะบัตร Attendee (มุมขวาบน) */}
                  {item.role === 'Attendee' && (
                    <span
                      className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full shadow-sm ${
                        item.bookingStatus === 'CHECKED_IN'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {item.bookingStatus === 'CHECKED_IN' ? '✅ เช็คอินแล้ว' : '🎟️ พร้อมเข้างาน'}
                    </span>
                  )}
                </div>

                {/* ส่วนเนื้อหาในการ์ด */}
                <div className="p-5">
                  {item.ticketRef && (
                    <div className="text-xs font-mono font-bold text-indigo-600 mb-1">
                      รหัสตั๋ว: {item.ticketRef}
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>📅 <strong>วันที่:</strong> {formatThaiDate(item.date)}</div>
                    {item.sessionTime && (
                      <div>🕒 <strong>รอบเวลา:</strong> {item.sessionTime}</div>
                    )}
                    {item.venue && (
                      <div>📍 <strong>สถานที่:</strong> {item.venue}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* ส่วนปุ่มกดด้านล่างการ์ด (เปลี่ยนตามบทบาท) */}
              <div className="p-5 pt-0 flex gap-3">
                {item.role === 'Attendee' && item.ticketRef && (
                  <Link
                    to={`/ticket/${item.ticketRef}`}
                    className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl text-sm transition"
                  >
                    เปิดดู QR Code เข้างาน
                  </Link>
                )}

                {item.role === 'Organizer' && (
                  <Link
                    to={`/manage-event/${item.eventId}`}
                    className="flex-1 text-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 rounded-xl text-sm transition"
                  >
                    จัดการกิจกรรม →
                  </Link>
                )}

                {item.role === 'Staff' && (
                  <Link
                    to="/staff/scanner"
                    className="flex-1 text-center bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 rounded-xl text-sm transition"
                  >
                    📷 เปิดเครื่องสแกนตั๋ว
                  </Link>
                )}

                <Link
                  to={`/event/${item.eventId}`}
                  className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl text-sm transition"
                >
                  ดูงาน
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}