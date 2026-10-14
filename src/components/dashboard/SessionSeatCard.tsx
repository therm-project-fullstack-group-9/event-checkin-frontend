import type { SessionItem } from '../../types';

// สถานะที่นั่งของรอบเวลาหนึ่งรอบ พร้อมแถบความคืบหน้า
export default function SessionSeatCard({ session }: { session: SessionItem }) {
  const percent = Math.min(100, Math.round((session.booked / session.capacity) * 100));

  return (
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
      <div className="flex justify-between text-sm font-bold text-gray-800 mb-2">
        <span>🕒 {session.startTime} - {session.endTime} น.</span>
        <span className="text-indigo-600">{session.booked}/{session.capacity}</span>
      </div>
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
