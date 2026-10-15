// ป้ายสถานะกิจกรรม (Upcoming / Ongoing / Completed / Cancelled) แสดงต่อจากป้ายหมวดหมู่
const STATUS_STYLES: Record<string, string> = {
  Upcoming: 'text-sky-700 bg-sky-50',
  Ongoing: 'text-emerald-700 bg-emerald-50',
  Completed: 'text-gray-600 bg-gray-100',
  Cancelled: 'text-red-700 bg-red-50',
};

export default function EventStatusBadge({ status, className = '' }: { status: string; className?: string }) {
  if (!status) return null;
  const style = STATUS_STYLES[status] ?? 'text-gray-600 bg-gray-100';
  return (
    <span data-testid="event-status" className={`text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${style} ${className}`}>
      {status}
    </span>
  );
}
