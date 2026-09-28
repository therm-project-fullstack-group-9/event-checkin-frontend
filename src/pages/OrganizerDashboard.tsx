import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import ExportButtons from '../components/ExportButtons';
import { formatThaiDate } from '../lib/formatDate';

interface SessionItem {
  sessionId: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
}

interface AttendeeBooking {
  bookingId: string;
  ticketRef: string;
  bookingStatus: 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED';
  checkInTime?: string | null;
  healthDeclaration?: string;
  user: {
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber: string;
  };
  session: {
    startTime: string;
    endTime: string;
  };
}

interface DashboardData {
  event: {
    eventId: string;
    eventName: string;
    shortDescription: string;
    description: string;
    eventDate: string;
    venue: string;
    category: string;
    imageUrl: string;
    eventsStatus: string;
    maxCapacity: number;
    sessions: SessionItem[];
  };
  bookings: AttendeeBooking[];
}

export default function OrganizerDashboard() {
  const { eventId } = useParams<{ eventId: string }>();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CHECKED_IN' | 'CONFIRMED'>('ALL');

  const fetchDashboard = async () => {
    try {
      const response = await api.get(`/events/${eventId}/dashboard`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching organizer dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [eventId]);

  if (loading) {
    return <div className="p-12 text-center text-gray-500">กำลังโหลดข้อมูลจัดการกิจกรรม...</div>;
  }

  if (!data) {
    return (
      <div className="p-12 text-center">
        <p className="text-lg text-gray-700 mb-4">ไม่พบข้อมูลกิจกรรมนี้</p>
        <Link to="/my-events" className="text-indigo-600 hover:underline">
          ← กลับไปหน้ากิจกรรมของฉัน
        </Link>
      </div>
    );
  }

  const { event, bookings } = data;
  const totalBooked = bookings.length;
  const totalCheckedIn = bookings.filter((b) => b.bookingStatus === 'CHECKED_IN').length;
  const totalCapacity = event.sessions.reduce((sum, s) => sum + s.capacity, 0);

  // กรองรายชื่อผู้เข้าร่วมตามคำค้นหาและสถานะ
  const filteredBookings = bookings.filter((b) => {
    const fullName = `${b.user.firstName} ${b.user.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      b.ticketRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.user.emailAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.bookingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      <Link to="/my-events" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
        ← กลับไปหน้ากิจกรรมของฉัน
      </Link>

      {/* ส่วนหัวของงาน + ปุ่มแก้ไขกิจกรรม */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
            ORGANIZER DASHBOARD
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{event.eventName}</h1>
          <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-4">
            <span>📅 {formatThaiDate(event.eventDate)}</span>
            <span>📍 {event.venue}</span>
            <span>🏷️ {event.category}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to={`/edit-event/${event.eventId}`}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-sm font-semibold px-4 py-2.5 rounded-xl transition"
          >
            ✏️ แก้ไขกิจกรรม
          </Link>
          <Link
            to="/staff/scanner"
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            📷 เปิดกล้องสแกนตั๋ว
          </Link>
          <Link
            to={`/event/${event.eventId}`}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl transition"
          >
            ดูหน้างาน
          </Link>
        </div>
      </div>

      {/* การ์ดสรุปสถิติ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500">ผู้ลงทะเบียนทั้งหมด (ใบจองจริง)</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">
            {totalBooked} <span className="text-sm font-normal text-gray-400">/ {totalCapacity} ที่นั่ง</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500">สแกนเช็คอินเข้างานแล้ว</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">
            {totalCheckedIn} <span className="text-sm font-normal text-gray-400">คน</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500">รอเช็คอิน</p>
          <p className="text-3xl font-bold text-amber-500 mt-1">
            {totalBooked - totalCheckedIn} <span className="text-sm font-normal text-gray-400">คน</span>
          </p>
        </div>
      </div>

      {/* สรุปยอดแต่ละรอบเวลา (Sessions) */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">สถานะที่นั่งแต่ละรอบเวลา (Sessions)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {event.sessions.map((s) => {
            const percent = Math.min(100, Math.round((s.booked / s.capacity) * 100));
            return (
              <div key={s.sessionId} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex justify-between text-sm font-bold text-gray-800 mb-2">
                  <span>🕒 {s.startTime} - {s.endTime} น.</span>
                  <span className="text-indigo-600">{s.booked}/{s.capacity}</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ตารางรายชื่อผู้ลงทะเบียน และ Component ปุ่ม Export */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              รายชื่อผู้ลงทะเบียน ({filteredBookings.length} รายการ)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              สามารถกรองข้อมูลก่อนกด Export Excel หรือ Export PDF ได้
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="text"
              placeholder="ค้นหาชื่อ, รหัสตั๋ว, อีเมล..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3.5 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">ทุกสถานะ</option>
              <option value="CHECKED_IN">เช็คอินแล้ว</option>
              <option value="CONFIRMED">ยังไม่เช็คอิน</option>
            </select>

            {/* เรียกใช้ Component ปุ่ม Export Excel & PDF */}
            <ExportButtons
              event={event}
              bookings={filteredBookings}
              totalBooked={totalBooked}
              totalCheckedIn={totalCheckedIn}
              totalCapacity={totalCapacity}
            />
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">ไม่พบรายชื่อผู้ลงทะเบียน</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase">
                  <th className="py-3 px-4">รหัสตั๋ว</th>
                  <th className="py-3 px-4">ชื่อ-นามสกุล</th>
                  <th className="py-3 px-4">รอบเวลา</th>
                  <th className="py-3 px-4">หมายเหตุสุขภาพ</th>
                  <th className="py-3 px-4">สถานะ</th>
                  <th className="py-3 px-4">เวลาเช็คอิน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.map((b) => (
                  <tr key={b.bookingId} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{b.ticketRef}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">
                        {b.user.firstName} {b.user.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{b.user.emailAddress}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {b.session.startTime} - {b.session.endTime} น.
                    </td>
                    <td className="py-3 px-4 text-gray-600">{b.healthDeclaration || '-'}</td>
                    <td className="py-3 px-4">
                      {b.bookingStatus === 'CHECKED_IN' ? (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                          ✅ เช็คอินแล้ว
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                          ⏳ รอเช็คอิน
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">
                      {b.checkInTime
                        ? new Date(b.checkInTime).toLocaleString('th-TH', {
                            dateStyle: 'short',
                            timeStyle: 'medium',
                          })
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}