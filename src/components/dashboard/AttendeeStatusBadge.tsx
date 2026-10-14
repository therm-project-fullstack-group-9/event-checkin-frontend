import type { BookingStatus } from '../../types';

// ป้ายสถานะของผู้ลงทะเบียนในตารางผู้จัดงาน
export default function AttendeeStatusBadge({ status }: { status: BookingStatus }) {
  if (status === 'CHECKED_IN') {
    return (
      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
        ✅ เช็คอินแล้ว
      </span>
    );
  }
  if (status === 'NO_SHOW') {
    return (
      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
        ⛔ ไม่มาตามรอบ
      </span>
    );
  }
  return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
      ⏳ รอเช็คอิน
    </span>
  );
}
