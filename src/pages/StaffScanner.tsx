import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { api } from '../lib/api';

export default function StaffScanner() {
  const [ticketInput, setTicketInput] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [scanResult, setScanResult] = useState<{
    status: 'success' | 'error' | 'idle';
    message: string;
    ticketRef?: string;
    attendee?: string;
    eventTitle?: string;
    timestamp?: string;
  }>({ status: 'idle', message: '' });

// ฟังก์ชันช่วยแปลงเวลาจาก Database (ISO String) เป็นรูปแบบแสดงผลภาษาไทย
  const formatDbTime = (dbTime?: string) => {
    if (!dbTime) return undefined;
    return new Date(dbTime).toLocaleString('th-TH', {
      dateStyle: 'short',
      timeStyle: 'medium',
    });
  };

  // ฟังก์ชันตรวจสอบรหัสตั๋ว (ทำงานร่วมกันทั้งจากการสแกน QR และพิมพ์มือ)
  const handleVerifyTicket = async (codeToVerify: string) => {
    const cleanCode = codeToVerify.trim().toUpperCase();
    if (!cleanCode) return;

    try {
      const response = await api.post('/staff/check-in', {
        ticketRef: cleanCode,
      });

      setScanResult({
        status: 'success',
        message: response.data.message,
        ticketRef: response.data.ticketRef,
        attendee: response.data.attendee,
        eventTitle: response.data.eventTitle,
        timestamp: formatDbTime(response.data.checkInTime),
      });
    } catch (error: any) {
      // ดึงข้อมูลจาก response ของ Backend เวลาเกิด Error (400 หรือ 404)
      const errData = error.response?.data;
      const errMessage = errData?.message || 'เกิดข้อผิดพลาดในการตรวจสอบตั๋ว';

      setScanResult({
        status: 'error',
        message: errMessage,
        ticketRef: cleanCode,
        attendee: errData?.attendee,
        eventTitle: errData?.eventTitle,
        timestamp: formatDbTime(errData?.checkInTime),
      });
    }
    setTicketInput('');
  };
  

  return (
    // เว้น pb-24 รองรับ Bottom Bar บนมือถือ
    <div className="max-w-md mx-auto p-4 pb-24 md:pb-8 min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        {/* ส่วนหัว */}
        <div className="text-center mb-5 pt-2">
          <span className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-full">
            STAFF MODE
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">ระบบสแกนตั๋วเข้างาน</h1>
          <p className="text-sm text-gray-600 mt-0.5">จุดสแกน: หอประชุมใหญ่</p>
        </div>

        {/* ปุ่มควบคุมการเปิด-ปิดกล้อง */}
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={() => {
              setIsCameraOpen(!isCameraOpen);
              setCameraError(null);
            }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              isCameraOpen
                ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            {isCameraOpen ? '⏹ ปิดกล้องชั่วคราว' : '📷 เปิดกล้องสแกน'}
          </button>
        </div>

        {/* ช่องมองภาพกล้องจริง (Camera Viewfinder) */}
        <div className="bg-black rounded-2xl overflow-hidden shadow-md relative aspect-square flex flex-col items-center justify-center text-white mb-6 border-2 border-gray-800">
          {isCameraOpen ? (
            <Scanner
              onScan={(detectedCodes) => {
                if (detectedCodes && detectedCodes.length > 0) {
                  const scannedValue = detectedCodes[0].rawValue;
                  handleVerifyTicket(scannedValue);
                }
              }}
              onError={(error) => {
                console.error(error);
                setCameraError('ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตสิทธิ์การใช้กล้องบนเบราว์เซอร์');
              }}
              constraints={{
                facingMode: 'environment', // บังคับใช้กล้องหลังบนมือถือเป็นหลัก
              }}
              formats={['qr_code']}
              scanDelay={1500} // หน่วงเวลา 1.5 วินาทีต่อการสแกน 1 ครั้ง ไม่ให้ยิงซ้ำรัวๆ
              components={{
                torch: true,  // แสดงปุ่มเปิดไฟฉาย (ถ้ามือถือรองรับ)
                finder: true, // แสดงกรอบเล็ง QR Code
              }}
            />
          ) : (
            <div className="text-center p-6">
              <p className="text-gray-400 text-sm mb-3">กล้องถูกปิดอยู่เพื่อประหยัดพลังงาน</p>
              <button
                onClick={() => setIsCameraOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                แตะเพื่อเปิดกล้อง
              </button>
            </div>
          )}

          {/* แจ้งเตือนกรณีไม่อนุญาตสิทธิ์กล้อง */}
          {cameraError && (
            <div className="absolute inset-0 bg-gray-900/95 p-6 flex flex-col items-center justify-center text-center">
              <span className="text-3xl mb-2">⚠️</span>
              <p className="text-sm text-red-300 font-medium">{cameraError}</p>
              <button
                onClick={() => setCameraError(null)}
                className="mt-4 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
              >
                ลองอีกครั้ง
              </button>
            </div>
          )}
        </div>

        {/* กล่องแสดงผลลัพธ์การสแกน (Feedback Result Box) */}
        {scanResult.status !== 'idle' && (
          <div className={`p-4 rounded-xl border mb-6 shadow-sm transition-all ${
            scanResult.status === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-red-50 border-red-200 text-red-900'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">
                  {scanResult.status === 'success' ? '✅' : '❌'}
                </span>

                  

                <div>
                  {scanResult.timestamp && (
                              <span className="text-sm font-bold">
                              เวลา: {scanResult.timestamp} น.
                              </span>
                            )}
                  <h3 className="font-bold text-sm">{scanResult.message}</h3>
                  {scanResult.attendee && (
                    <div className="text-xs mt-1.5 space-y-0.5 opacity-90">
                      <p>รหัสตั๋ว: <span className="font-mono font-bold">{scanResult.ticketRef}</span></p>
                      <p>ผู้เข้าร่วม: <span className="font-semibold">{scanResult.attendee}</span></p>
                      <p>งาน: {scanResult.eventTitle}</p>
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setScanResult({ status: 'idle', message: '' })}
                className="text-xs opacity-60 hover:opacity-100 font-medium"
              >
                ปิด
              </button>
            </div>
          </div>
        )}

        {/* ช่องกรอกรหัสสำรอง (Fallback Manual Input) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            หรือกรอกรหัสตั๋ว (TicketRef) กรณีสแกนไม่ติด
          </label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyTicket(ticketInput)}
              placeholder="เช่น EVT-8A2B9C"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button 
              onClick={() => handleVerifyTicket(ticketInput)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shrink-0"
            >
              ตรวจสอบ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}