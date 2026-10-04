import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../libs/api';

export default function EditEvent() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    eventName: '',
    category: 'Technology',
    eventDate: '',
    venue: '',
    imageUrl: '',
    shortDescription: '',
    description: '',
    eventsStatus: 'Upcoming',
  });

  // ดึงข้อมูลเดิมของกิจกรรมมาใส่ในฟอร์ม
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${eventId}`);
        const ev = response.data;
        setFormData({
          eventName: ev.eventName || '',
          category: ev.category || 'Technology',
          eventDate: ev.eventDate || '',
          venue: ev.venue || '',
          imageUrl: ev.imageUrl || '',
          shortDescription: ev.shortDescription || '',
          description: ev.description || '',
          eventsStatus: ev.eventsStatus || 'Upcoming',
        });
      } catch (error) {
        console.error('Error fetching event for edit:', error);
        setErrorMsg('ไม่พบข้อมูลกิจกรรมที่ต้องการแก้ไข');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  // บันทึกการแก้ไขลงฐานข้อมูล
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.put(`/events/${eventId}`, formData);
      // บันทึกเสร็จแล้วพากลับไปหน้าจัดการกิจกรรม (OrganizerDashboard)
      navigate(`/manage-event/${eventId}`);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'ไม่สามารถบันทึกการแก้ไขได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500">กำลังโหลดข้อมูลกิจกรรม...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
      <Link
        to={`/manage-event/${eventId}`}
        className="text-sm text-indigo-600 hover:underline mb-4 inline-block"
      >
        ← กลับไปหน้าจัดการกิจกรรม
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-gray-900">✏️ แก้ไขข้อมูลกิจกรรม</h1>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">
            EDIT MODE
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-6">แก้ไขรายละเอียดของกิจกรรมและกดบันทึกเพื่ออัปเดตข้อมูล</p>

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
              value={formData.eventName}
              onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่ *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สถานะกิจกรรม</label>
              <select
                value={formData.eventsStatus}
                onChange={(e) => setFormData({ ...formData, eventsStatus: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Upcoming">Upcoming (กำลังจะมาถึง)</option>
                <option value="Ongoing">Ongoing (กำลังจัดงาน)</option>
                <option value="Completed">Completed (จบงานแล้ว)</option>
                <option value="Cancelled">Cancelled (ยกเลิก)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สถานที่จัดงาน (Venue) *</label>
              <input
                type="text"
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ลิงก์รูปภาพหน้าปก (URL)</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">คำโปรยสั้นๆ (Short Description) *</label>
            <input
              type="text"
              required
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดกิจกรรมฉบับเต็ม *</label>
            <textarea
              rows={5}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Link
              to={`/manage-event/${eventId}`}
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm text-center transition"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition shadow-sm text-sm"
            >
              {isSubmitting ? 'กำลังบันทึกข้อมูล...' : 'บันทึกการแก้ไขกิจกรรม'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}