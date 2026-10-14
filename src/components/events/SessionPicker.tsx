import type { SessionItem } from '../../types';

interface SessionPickerProps {
  sessions: SessionItem[];
  selectedSessionId: string;
  onSelect: (sessionId: string) => void;
}

// ปุ่มเลือกรอบเวลาของกิจกรรม (รอบที่เต็มแล้วกดไม่ได้)
export default function SessionPicker({ sessions, selectedSessionId, onSelect }: SessionPickerProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {sessions
        .slice()
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .map((session) => {
          const isFull = session.booked >= session.capacity;
          const isSelected = selectedSessionId === session.sessionId;

          return (
            <button
              key={session.sessionId}
              type="button"
              disabled={isFull}
              onClick={() => onSelect(session.sessionId)}
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
  );
}
