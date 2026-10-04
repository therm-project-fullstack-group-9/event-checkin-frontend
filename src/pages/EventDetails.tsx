import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../libs/api';

interface SessionItem {
  sessionId: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
}

interface EventDetail {
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
  organizer?: {
    firstName: string;
    lastName: string;
  };
}

export default function EventDetails() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [healthNote, setHealthNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedTicketRef, setBookedTicketRef] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ฟังก์ชันดึงข้อมูลรายละเอียดกิจกรรมจาก Backend
  const fetchEventDetails = async () => {
    try {
      const response = await api.get(`/events/${eventId}`);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  // ฟังก์ชันกดยืนยันการจองตั๋ว
  const handleBookTicket = async () => {
    if (!selectedSessionId || !event) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setBookedTicketRef(null);

    try {
      const response = await api.post('/bookings', {
        eventId: event.eventId,
        sessionId: selectedSessionId,
        healthDeclaration: healthNote || 'ปกติ',
      });

      // แสดงรหัสตั๋วและ QR Code ที่เพิ่งสร้างเสร็จ
      setBookedTicketRef(response.data.booking.ticketRef);
      // โหลดข้อมูลรอบเวลาใหม่เพื่อให้เห็นยอดคนจองเพิ่มขึ้นทันที
      fetchEventDetails();
    } catch (error: any) {
      const errData = error.response?.data;
      setErrorMsg(error.response?.data?.message || 'ไม่สามารถจองตั๋วได้ กรุณาลองใหม่อีกครั้ง');

      if (errData?.ticketRef) {
        setBookedTicketRef(errData.ticketRef);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500">กำลังโหลดข้อมูลกิจกรรม...</div>;
  }

  if (!event) {
    return (
      <div className="p-12 text-center">
        <p className="text-lg text-gray-700 mb-4">ไม่พบข้อมูลกิจกรรมนี้</p>
        <Link to="/" className="text-indigo-600 hover:underline">กลับหน้าหลัก</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      <Link to="/explore-events" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
        ← กลับไปหน้ารวมกิจกรรม
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <img src={event.imageUrl} alt={event.eventName} className="w-full h-64 sm:h-80 object-cover" />

        <div className="p-6 sm:p-8">
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            {event.category}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">{event.eventName}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-4 pb-6 border-b border-gray-100">
            <div>📅 <strong>วันที่:</strong> {event.eventDate}</div>
            <div>📍 <strong>สถานที่:</strong> {event.venue}</div>
            {event.organizer && (
              <div>👤 <strong>ผู้จัดงาน:</strong> {event.organizer.firstName} {event.organizer.lastName}</div>
            )}
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">รายละเอียดกิจกรรม</h2>
            <p className="text-gray-700 leading-relaxed">{event.description}</p>
          </div>

          {/* ส่วนเลือกรอบเวลา (Sessions) */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">เลือกรอบเวลาเข้าร่วม (Sessions)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {event.sessions
              ?.slice()
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((session) => {
                const isFull = session.booked >= session.capacity;
                const isSelected = selectedSessionId === session.sessionId;

                return (
                  <button
                    key={session.sessionId}
                    type="button"
                    disabled={isFull}
                    onClick={() => {
                      setSelectedSessionId(session.sessionId);
                      setErrorMsg(null);
                      setBookedTicketRef(null);
                    }
                      
                    }
                    className={`p-4 rounded-xl border text-left transition ${
                      isFull
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                        : isSelected
                        ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-600 text-indigo-900'
                        : 'bg-white border-gray-200 hover:border-indigo-400 text-gray-800'
                    }`}
                  >
                    <div className="font-bold text-base">
                      🕒 {session.startTime} - {session.endTime} น.
                    </div>
                    <div className="text-xs mt-2 flex justify-between items-center">
                      <span>ที่นั่ง: {session.booked}/{session.capacity}</span>
                      {isFull ? (
                        <span className="text-red-500 font-semibold">เต็มแล้ว</span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">ว่าง {session.capacity - session.booked} ที่</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ช่องกรอกข้อมูลสุขภาพเพิ่มเติม */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ข้อมูลสุขภาพ / หมายเหตุเพิ่มเติม (ถ้ามี)
            </label>
            <input
              type="text"
              value={healthNote}
              onChange={(e) => setHealthNote(e.target.value)}
              placeholder="เช่น แพ้อาหารทะเล, ไม่มีอาการป่วย"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              ❌ {errorMsg}
            </div>
          )}

          {/* ปุ่มยืนยันการจอง */}
          <div className="mt-6">
            <button
              type="button"
              disabled={!selectedSessionId || isSubmitting}
              onClick={handleBookTicket}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition"
            >
              {isSubmitting ? 'กำลังบันทึกข้อมูล...' : 'ยืนยันการจองตั๋วเข้างาน'}
            </button>
          </div>

          {/* กล่องแสดงตั๋วและ QR Code ทันทีที่จองสำเร็จ */}
          {bookedTicketRef && (
            <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
              <h3 className="text-xl font-bold text-emerald-900 mb-1">🎉 จองตั๋วสำเร็จ!</h3>
              <p className="text-sm text-emerald-700 mb-4">
                สามารถแคปหน้าจอ QR Code หรือนำรหัสตั๋วนี้ไปสแกนที่หน้า Staff Scanner ได้เลยครับ
              </p>
              <div className="bg-white p-4 rounded-xl inline-block shadow-sm border border-gray-100">
                <QRCodeSVG value={bookedTicketRef} size={180} />
              </div>
              <div className="mt-3">
                <span className="text-xs text-gray-500 block">รหัสอ้างอิงตั๋ว (Ticket Ref)</span>
                <span className="text-lg font-mono font-bold text-indigo-700 bg-white px-3 py-1 rounded border border-indigo-200 inline-block mt-1">
                  {bookedTicketRef}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}