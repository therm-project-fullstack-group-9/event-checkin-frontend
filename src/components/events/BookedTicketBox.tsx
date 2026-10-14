import { QRCodeSVG } from 'qrcode.react';

// กล่องแสดงตั๋วและ QR Code ทันทีที่จองสำเร็จ (หรือเมื่อมีตั๋วของรอบนี้อยู่แล้ว)
export default function BookedTicketBox({ ticketRef }: { ticketRef: string }) {
  return (
    <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
      <h3 className="text-xl font-bold text-emerald-900 mb-1">🎉 จองตั๋วสำเร็จ!</h3>
      <p className="text-sm text-emerald-700 mb-4">
        สามารถแคปหน้าจอ QR Code หรือนำรหัสตั๋วนี้ไปสแกนที่หน้า Staff Scanner ได้เลยครับ
      </p>
      <div className="bg-white p-4 rounded-xl inline-block shadow-sm border border-gray-100">
        <QRCodeSVG value={ticketRef} size={180} />
      </div>
      <div className="mt-3">
        <span className="text-xs text-gray-500 block">รหัสอ้างอิงตั๋ว (Ticket Ref)</span>
        <span className="text-lg font-mono font-bold text-indigo-700 bg-white px-3 py-1 rounded border border-indigo-200 inline-block mt-1">
          {ticketRef}
        </span>
      </div>
    </div>
  );
}
