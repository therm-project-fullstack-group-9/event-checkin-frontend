// src/lib/formatDate.ts

export function formatThaiDate(dateStr?: string | null): string {
  if (!dateStr) return '-';

  const date = new Date(dateStr);

  // กรณีข้อมูลเก่าในระบบเป็นข้อความภาษาไทยอยู่แล้ว (แปลงเป็น Date ไม่ได้) ให้คืนค่าข้อความเดิมกลับไปเลย
  if (isNaN(date.getTime())) {
    return dateStr;
  }

  // ใช้ 'th-TH-u-ca-gregory' เพื่อให้ได้เดือนภาษาไทย และปี ค.ศ. (เช่น 15 ต.ค. 2026)
  // หากต้องการได้ปี พ.ศ. (เช่น 15 ต.ค. 2569) ให้เปลี่ยนเป็น 'th-TH' 
  return date.toLocaleDateString('th-TH-u-ca-gregory', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}