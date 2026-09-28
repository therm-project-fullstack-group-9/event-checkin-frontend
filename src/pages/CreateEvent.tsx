import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';

interface SessionInput {
  startTime: string;
  endTime: string;
  capacity: number;
}

export default function CreateEvent() {
  const navigate = useNavigate();
  const [eventName, setEventName] = useState('');
  const [category, setCategory] = useState('Technology');
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [sessions, setSessions] = useState<SessionInput[]>([
    { startTime: '09:00', endTime: '12:00', capacity: 100 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // เพิ่มรอบเวลาใหม่
  const handleAddSession = () => {
    setSessions([...sessions, { startTime: '13:00', endTime: '16:00', capacity: 100 }]);
  };

  // ลบรอบเวลา
  const handleRemoveSession = (index: number) => {
    if (sessions.length <= 1) return;
    setSessions(sessions.filter((_, i) => i !== index));
  };

  // แก้ไขค่าในแต่ละรอบเวลา
  const handleSessionChange = (index: number, field: keyof SessionInput, value: string | number) => {
    const updated = [...sessions];
    updated[index] = { ...updated[index], [field]: value };
    setSessions(updated);
  };

  // ส่งข้อมูลไปบันทึกที่ Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.post('/events', {
        eventName,
        category,
        eventDate,
        venue,
        imageUrl,
        shortDescription,
        description,
        sessions,
      });

      // เมื่อสร้างสำเร็จ พาไปหน้า กิจกรรมของฉัน (/my-events)
      navigate('/my-events');
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'ไม่สามารถสร้างกิจกรรมได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
      <Link to="/my-events" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
        ← กลับไปหน้ากิจกรรมของฉัน
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">สร้างกิจกรรมใหม่</h1>
        <p className="text-sm text-gray-500 mb-6">กรอกรายละเอียดกิจกรรมและกำหนดรอบเวลาเปิดรับลงทะเบียน</p>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            ❌ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อกิจกรรม *</label>
            <input
              type="text"
              required
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="เช่น เวิร์กชอป React & TypeScript 2026"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่ *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Technology">Technology</option>
                <option value="Workshop">Workshop</option>
                <option value="Business">Business</option>
                <option value="Art & Culture">Art & Culture</option>
                <option value="Music & Concert">Music & Concert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่จัดงาน *</label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                placeholder="เช่น 20 พ.ย. 2026"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สถานที่จัดงาน (Venue) *</label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="เช่น อาคารนวัตกรรม มหาวิทยาลัยเชียงใหม่"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ลิงก์รูปภาพหน้าปก (URL)</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">คำโปรยสั้นๆ (Short Description) *</label>
            <input
              type="text"
              required
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="สรุปความน่าสนใจของงานใน 1-2 ประโยค"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดกิจกรรมฉบับเต็ม *</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="อธิบายกำหนดการ เนื้อหา และสิ่งที่ผู้เข้าร่วมจะได้รับ..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* ส่วนกำหนดรอบเวลา (Sessions) */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-base font-bold text-gray-900">
                กำหนดรอบเวลา (Sessions)
              </label>
              <button
                type="button"
                onClick={handleAddSession}
                className="text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg transition"
              >
                + เพิ่มรอบเวลา
              </button>
            </div>

            <div className="space-y-3">
              {sessions.map((session, index) => (
                <div
                  key={index}
                  className="flex flex-wrap sm:flex-nowrap items-end gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200"
                >
                  <div className="flex-1 min-w-[110px]">
                    <label className="block text-xs text-gray-500 mb-1">เวลาเริ่ม</label>
                    <input
                      type="time"
                      required
                      value={session.startTime}
                      onChange={(e) => handleSessionChange(index, 'startTime', e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
                    />
                  </div>

                  <div className="flex-1 min-w-[110px]">
                    <label className="block text-xs text-gray-500 mb-1">เวลาสิ้นสุด</label>
                    <input
                      type="time"
                      required
                      value={session.endTime}
                      onChange={(e) => handleSessionChange(index, 'endTime', e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
                    />
                  </div>

                  <div className="w-28">
                    <label className="block text-xs text-gray-500 mb-1">จำนวนที่นั่ง</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={session.capacity}
                      onChange={(e) => handleSessionChange(index, 'capacity', Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
                    />
                  </div>

                  {sessions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSession(index)}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      ลบ
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition shadow-sm"
            >
              {isSubmitting ? 'กำลังบันทึกข้อมูล...' : 'บันทึกและสร้างกิจกรรม'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}