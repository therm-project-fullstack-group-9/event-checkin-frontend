import type { ScanResult } from '../../types';

interface ScanResultBoxProps {
  result: ScanResult;
  onClose: () => void;
}

// กล่องแสดงผลลัพธ์การสแกนเช็คอิน (สำเร็จ/ผิดพลาด) พร้อมข้อมูลผู้ถือตั๋ว
export default function ScanResultBox({ result, onClose }: ScanResultBoxProps) {
  if (result.status === 'idle') return null;

  return (
    <div
      className={`p-4 rounded-xl border mb-6 shadow-sm transition-all ${
        result.status === 'success'
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
          : 'bg-red-50 border-red-200 text-red-900'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5">{result.status === 'success' ? '✅' : '❌'}</span>

          <div>
            {result.timestamp && (
              <span className="text-sm font-bold">เวลา: {result.timestamp} น.</span>
            )}
            <h3 className="font-bold text-sm">{result.message}</h3>
            {result.attendee && (
              <div className="text-xs mt-1.5 space-y-0.5 opacity-90">
                <p>รหัสตั๋ว: <span className="font-mono font-bold">{result.ticketRef}</span></p>
                <p>ผู้เข้าร่วม: <span className="font-semibold">{result.attendee}</span></p>
                <p>งาน: {result.eventTitle}</p>
              </div>
            )}
          </div>
        </div>
        <button onClick={onClose} className="text-xs opacity-60 hover:opacity-100 font-medium">
          ปิด
        </button>
      </div>
    </div>
  );
}
