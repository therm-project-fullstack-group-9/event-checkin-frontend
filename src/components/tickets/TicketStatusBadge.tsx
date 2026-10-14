import type { BookingStatus } from '../../types';

interface TicketStatusBadgeProps {
  status: BookingStatus;
  /** เวลาเช็คอินที่จัดรูปแบบแล้ว (ใช้เมื่อสถานะ CHECKED_IN) */
  checkInTime?: string | null;
}

// ป้ายสถานะของตั๋วในหน้า Ticket
export default function TicketStatusBadge({ status, checkInTime }: TicketStatusBadgeProps) {
  return (
    <div className="mt-3">
      {status === 'CHECKED_IN' ? (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-1.5 rounded-full text-xs font-semibold text-center">
          ✅ เช็คอินเข้างานแล้ว
          {checkInTime && (
            <span className="block text-[11px] font-normal mt-0.5">
              เมื่อเวลา: {checkInTime} น.
            </span>
          )}
        </div>
      ) : status === 'NO_SHOW' ? (
        <span className="bg-red-50 text-red-800 border border-red-200 px-4 py-1.5 rounded-full text-xs font-semibold">
          ⛔ ไม่ได้เข้าร่วมตามรอบ ตั๋วนี้ใช้เช็คอินไม่ได้แล้ว
        </span>
      ) : (
        <span className="bg-amber-50 text-amber-800 border border-amber-200 px-4 py-1.5 rounded-full text-xs font-semibold">
          ⏳ ยังไม่ได้เช็คอิน (แสดง QR นี้ต่อเจ้าหน้าที่)
        </span>
      )}
    </div>
  );
}
