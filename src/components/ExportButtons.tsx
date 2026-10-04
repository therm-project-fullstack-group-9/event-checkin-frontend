import { formatThaiDate } from '../libs/formatDate';

interface AttendeeBooking {
  bookingId: string;
  ticketRef: string;
  bookingStatus: 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED';
  checkInTime?: string | null;
  healthDeclaration?: string;
  user: {
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber: string;
  };
  session: {
    startTime: string;
    endTime: string;
  };
}

interface ExportButtonsProps {
  event: {
    eventName: string;
    eventDate: string;
    venue: string;
    category: string;
  };
  bookings: AttendeeBooking[];
  totalBooked: number;
  totalCheckedIn: number;
  totalCapacity: number;
}

export default function ExportButtons({
  event,
  bookings,
  totalBooked,
  totalCheckedIn,
  totalCapacity,
}: ExportButtonsProps) {
  const handleExportExcel = () => {
    const headers = [
      'ลำดับ',
      'รหัสตั๋ว (Ticket Ref)',
      'ชื่อ-นามสกุล',
      'อีเมล',
      'เบอร์โทรศัพท์',
      'รอบเวลา (Session)',
      'หมายเหตุสุขภาพ',
      'สถานะ',
      'เวลาเช็คอิน',
    ];

    const rows = bookings.map((b, idx) => [
      idx + 1,
      b.ticketRef,
      `"${b.user.firstName} ${b.user.lastName}"`,
      b.user.emailAddress,
      `"${b.user.phoneNumber || '-'}"`,
      `"${b.session.startTime} - ${b.session.endTime} น."`,
      `"${(b.healthDeclaration || '-').replace(/"/g, '""')}"`,
      b.bookingStatus === 'CHECKED_IN' ? 'เช็คอินแล้ว' : 'รอเช็คอิน',
      b.checkInTime
        ? `"${new Date(b.checkInTime).toLocaleString('th-TH', {
            dateStyle: 'short',
            timeStyle: 'medium',
          })}"`
        : '-',
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `รายชื่อผู้เข้าร่วม_${event.eventName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ฟังก์ชัน Export PDF (สร้างหน้ารายงานสำหรับพิมพ์ / บันทึกเป็น PDF)
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      alert('กรุณาอนุญาต Pop-up บนเบราว์เซอร์เพื่อส่งออกไฟล์ PDF');
      return;
    }

    const rowsHtml = bookings
      .map(
        (b, idx) => `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td style="font-family: monospace; font-weight: bold;">${b.ticketRef}</td>
          <td>${b.user.firstName} ${b.user.lastName}<br/><small style="color: #666;">${b.user.emailAddress}</small></td>
          <td>${b.session.startTime} - ${b.session.endTime} น.</td>
          <td>${b.healthDeclaration || '-'}</td>
          <td>${b.bookingStatus === 'CHECKED_IN' ? '✅ เช็คอินแล้ว' : '⏳ รอเช็คอิน'}</td>
          <td>${
            b.checkInTime
              ? new Date(b.checkInTime).toLocaleString('th-TH', {
                  dateStyle: 'short',
                  timeStyle: 'medium',
                })
              : '-'
          }</td>
        </tr>
      `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8" />
        <title>รายงานผู้เข้าร่วม - ${event.eventName}</title>
        
        <!-- 1. ดึงฟอนต์ภาษาไทย Sarabun จาก Google Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">

        <style>
          /* 2. บังคับใช้ฟอนต์ Sarabun ทั้งหน้าเอกสาร และตั้งค่ากระดาษ A4 */
          @page { size: A4 portrait; margin: 15mm; }
          body { 
            font-family: 'Sarabun', sans-serif; 
            padding: 16px; 
            color: #111827; 
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          h1 { margin: 0 0 6px 0; font-size: 20px; font-weight: 700; }
          .meta { color: #4b5563; font-size: 13px; margin-bottom: 16px; }
          .summary { display: flex; gap: 12px; margin-bottom: 20px; }
          .card { border: 1px solid #d1d5db; border-radius: 8px; padding: 10px 14px; flex: 1; background-color: #f9fafb; }
          .card-label { font-size: 12px; color: #6b7280; }
          .card-val { font-size: 18px; font-weight: 700; margin-top: 2px; color: #111827; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: left; }
          th { background-color: #f3f4f6; font-weight: 700; }
        </style>
      </head>
      <body>
        <h1>รายงานรายชื่อผู้ลงทะเบียน: ${event.eventName}</h1>
        <div class="meta">
          วันที่จัดงาน: ${formatThaiDate(event.eventDate)} | สถานที่: ${event.venue} | หมวดหมู่: ${event.category}
        </div>
        <div class="summary">
          <div class="card">
            <div class="card-label">ลงทะเบียนทั้งหมด</div>
            <div class="card-val">${totalBooked} / ${totalCapacity} ที่นั่ง</div>
          </div>
          <div class="card">
            <div class="card-label">เช็คอินเข้างานแล้ว</div>
            <div class="card-val">${totalCheckedIn} คน</div>
          </div>
          <div class="card">
            <div class="card-label">รอเช็คอิน</div>
            <div class="card-val">${totalBooked - totalCheckedIn} คน</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 36px; text-align: center;">#</th>
              <th>รหัสตั๋ว</th>
              <th>ชื่อ-นามสกุล / อีเมล</th>
              <th>รอบเวลา</th>
              <th>หมายเหตุสุขภาพ</th>
              <th>สถานะ</th>
              <th>เวลาเช็คอิน</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="7" style="text-align:center;">ไม่มีข้อมูลผู้ลงทะเบียน</td></tr>'}
          </tbody>
        </table>
        <script>
          // 3. รอให้ฟอนต์ภาษาไทย Sarabun โหลดเสร็จ 100% ก่อนเปิดหน้าต่าง Save as PDF
          window.onload = function() {
            if (document.fonts && document.fonts.ready) {
              document.fonts.ready.then(function() {
                window.print();
              });
            } else {
              setTimeout(function() { window.print(); }, 500);
            }
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleExportExcel}
        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5"
      >
        📊 Export Excel
      </button>

      <button
        type="button"
        onClick={handleExportPDF}
        className="bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5"
      >
        📄 Export PDF
      </button>
    </div>
  );
}