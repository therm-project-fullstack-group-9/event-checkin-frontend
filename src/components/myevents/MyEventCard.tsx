import { Link } from 'react-router-dom';
import { formatThaiDate } from '../../lib/formatDate';
import type { MyEventItem } from '../../types';

// การ์ดกิจกรรมหนึ่งใบในหน้า "กิจกรรมของฉัน" (ปุ่มด้านล่างเปลี่ยนตามบทบาท)
export default function MyEventCard({ item }: { item: MyEventItem }) {
  return (
    <div
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
                  : item.bookingStatus === 'NO_SHOW'
                  ? 'bg-red-500 text-white'
                  : 'bg-indigo-600 text-white'
              }`}
            >
              {item.bookingStatus === 'CHECKED_IN'
                ? '✅ เช็คอินแล้ว'
                : item.bookingStatus === 'NO_SHOW'
                ? '⛔ ไม่มาตามรอบ'
                : '🎟️ พร้อมเข้างาน'}
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
  );
}
