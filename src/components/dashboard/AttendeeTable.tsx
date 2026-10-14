import type { AttendeeBooking } from '../../types';
import AttendeeStatusBadge from './AttendeeStatusBadge';

interface AttendeeTableProps {
  bookings: AttendeeBooking[];
}

// ตารางรายชื่อผู้ลงทะเบียน (แสดงข้อความว่างเมื่อไม่มีรายการ)
export default function AttendeeTable({ bookings }: AttendeeTableProps) {
  if (bookings.length === 0) {
    return <div className="text-center py-8 text-gray-500 text-sm">ไม่พบรายชื่อผู้ลงทะเบียน</div>;
  }

  return (
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
          {bookings.map((b) => (
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
                <AttendeeStatusBadge status={b.bookingStatus} />
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
  );
}
