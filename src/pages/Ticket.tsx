import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../libs/api';
import { formatThaiDate } from '../libs/formatDate';

interface TicketDetail {
  bookingId: string;
  ticketRef: string;
  bookingStatus: 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED';
  checkInTime?: string | null;
  healthDeclaration?: string;
  user: {
    firstName: string;
    lastName: string;
    emailAddress: string;
  };
  event: {
    eventId: string;
    eventName: string;
    eventDate: string;
    venue: string;
    category: string;
  };
  session: {
    startTime: string;
    endTime: string;
  };
}

export default function Ticket() {
  const { ticketRef } = useParams<{ ticketRef: string }>();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await api.get(`/tickets/${ticketRef}`);
        setTicket(response.data);
      } catch (error) {
        console.error('Error fetching ticket:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [ticketRef]);

  if (loading) {
    return <div className="p-12 text-center text-gray-500">กำลังโหลดข้อมูลบัตรเข้างาน...</div>;
  }

  if (!ticket) {
    return (
      <div className="p-12 text-center">
        <p className="text-lg text-gray-700 mb-4">ไม่พบข้อมูลตั๋วใบนี้ในระบบ</p>
        <Link to="/my-events" className="text-indigo-600 hover:underline">
          ← กลับไปหน้าตั๋วของฉัน
        </Link>
      </div>
    );
  }

  const formattedCheckInTime = ticket.checkInTime
    ? new Date(ticket.checkInTime).toLocaleString('th-TH', {
        dateStyle: 'short',
        timeStyle: 'medium',
      })
    : null;

  return (
    <div className="max-w-md mx-auto px-4 py-8 pb-24">
      <Link to="/my-events" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
        ← กลับไปหน้าตั๋วของฉัน
      </Link>

      <div className="bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden">
        {/* ส่วนหัวตั๋ว */}
        <div className="bg-indigo-600 text-white p-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
            {ticket.event.category}
          </span>
          <h1 className="text-xl font-bold mt-3">{ticket.event.eventName}</h1>
          <p className="text-indigo-100 text-sm mt-1">📍 {ticket.event.venue}</p>
        </div>

        {/* ส่วนแสดง QR Code */}
        <div className="p-6 flex flex-col items-center border-b border-dashed border-gray-200 relative">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <QRCodeSVG value={ticket.ticketRef} size={200} />
          </div>

          <div className="mt-4 text-center">
            <span className="text-xs text-gray-400 block">TICKET REFERENCE</span>
            <span className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
              {ticket.ticketRef}
            </span>
          </div>

          {/* ป้ายสถานะตั๋ว */}
          <div className="mt-3">
            {ticket.bookingStatus === 'CHECKED_IN' ? (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-1.5 rounded-full text-xs font-semibold text-center">
                ✅ เช็คอินเข้างานแล้ว
                {formattedCheckInTime && (
                  <span className="block text-[11px] font-normal mt-0.5">
                    เมื่อเวลา: {formattedCheckInTime} น.
                  </span>
                )}
              </div>
            ) : (
              <span className="bg-amber-50 text-amber-800 border border-amber-200 px-4 py-1.5 rounded-full text-xs font-semibold">
                ⏳ ยังไม่ได้เช็คอิน (แสดง QR นี้ต่อเจ้าหน้าที่)
              </span>
            )}
          </div>
        </div>

        {/* รายละเอียดผู้ถือบัตรและรอบเวลา */}
        <div className="p-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">ผู้เข้าร่วม:</span>
            <span className="font-semibold text-gray-900">
              {ticket.user.firstName} {ticket.user.lastName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">วันที่จัดงาน:</span>
            <span className="font-semibold text-gray-900">{formatThaiDate(ticket.event.eventDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">รอบเวลา (Session):</span>
            <span className="font-semibold text-indigo-600">
              {ticket.session.startTime} - {ticket.session.endTime} น.
            </span>
          </div>
          {ticket.healthDeclaration && (
            <div className="flex justify-between">
              <span className="text-gray-500">หมายเหตุสุขภาพ:</span>
              <span className="font-medium text-gray-700">{ticket.healthDeclaration}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}