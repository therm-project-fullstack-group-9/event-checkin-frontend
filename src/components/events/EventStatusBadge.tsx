// ป้ายสถานะกิจกรรม (Upcoming / Ongoing / Completed / Cancelled)
// variant="soft" ใช้ต่อจากป้ายหมวดหมู่, variant="solid" ใช้ลอยบนรูปภาพ (เช่น การ์ดในหน้า "กิจกรรมของฉัน")
const SOFT: Record<string, string> = {
  Upcoming: 'text-sky-700 bg-sky-50',
  Ongoing: 'text-emerald-700 bg-emerald-50',
  Completed: 'text-gray-600 bg-gray-100',
  Cancelled: 'text-red-700 bg-red-50',
};
const SOLID: Record<string, string> = {
  Upcoming: 'text-white bg-sky-600',
  Ongoing: 'text-white bg-emerald-600',
  Completed: 'text-white bg-gray-600',
  Cancelled: 'text-white bg-red-600',
};

interface Props {
  status?: string;
  variant?: 'soft' | 'solid';
  className?: string;
}

export default function EventStatusBadge({ status, variant = 'soft', className = '' }: Props) {
  if (!status) return null;
  const style = (variant === 'solid' ? SOLID : SOFT)[status] ?? (variant === 'solid' ? 'text-white bg-gray-600' : 'text-gray-600 bg-gray-100');
  const shadow = variant === 'solid' ? 'font-bold shadow-sm' : 'font-semibold';
  return (
    <span data-testid="event-status" className={`text-xs ${shadow} px-2.5 py-1 rounded-full w-fit ${style} ${className}`}>
      {status}
    </span>
  );
}
