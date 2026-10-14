interface StatCardProps {
  label: string;
  value: number | string;
  /** ข้อความเล็กต่อท้ายตัวเลข เช่น "คน" หรือ "/ 150 ที่นั่ง" */
  suffix: string;
  /** สีของตัวเลข (คลาส Tailwind) */
  valueClassName: string;
}

// การ์ดสถิติตัวเลขบน Dashboard ของผู้จัดงาน
export default function StatCard({ label, value, suffix, valueClassName }: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${valueClassName}`}>
        {value} <span className="text-sm font-normal text-gray-400">{suffix}</span>
      </p>
    </div>
  );
}
