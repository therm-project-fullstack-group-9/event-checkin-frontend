import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import ExportButtons from '../components/ExportButtons';
import { formatThaiDate } from '../lib/formatDate';
import StatCard from '../components/dashboard/StatCard';
import SessionSeatCard from '../components/dashboard/SessionSeatCard';
import AttendeeTable from '../components/dashboard/AttendeeTable';
import type { DashboardData, BookingStatus } from '../types';


export default function OrganizerDashboard() {
  const { eventId } = useParams<{ eventId: string }>();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | Exclude<BookingStatus, 'CANCELLED'>>('ALL');

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
  const totalNoShow = bookings.filter((b) => b.bookingStatus === 'NO_SHOW').length;
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
        <StatCard
          label="ผู้ลงทะเบียนทั้งหมด (ใบจองจริง)"
          value={totalBooked}
          suffix={`/ ${totalCapacity} ที่นั่ง`}
          valueClassName="text-indigo-600"
        />
        <StatCard label="สแกนเช็คอินเข้างานแล้ว" value={totalCheckedIn} suffix="คน" valueClassName="text-emerald-600" />
        <StatCard
          label="รอเช็คอิน"
          value={totalBooked - totalCheckedIn - totalNoShow}
          suffix="คน"
          valueClassName="text-amber-500"
        />
      </div>

      {/* สรุปยอดแต่ละรอบเวลา (Sessions) */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">สถานะที่นั่งแต่ละรอบเวลา (Sessions)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {event.sessions.map((session) => (
            <SessionSeatCard key={session.sessionId} session={session} />
          ))}
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
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-3.5 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">ทุกสถานะ</option>
              <option value="CHECKED_IN">เช็คอินแล้ว</option>
              <option value="CONFIRMED">ยังไม่เช็คอิน</option>
              <option value="NO_SHOW">ไม่มาตามรอบ</option>
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

        <AttendeeTable bookings={filteredBookings} />
      </div>

    </div>
  );
}