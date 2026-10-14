import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../libs/api';

// 1. กำหนด Zod Schema สำหรับหน้าแก้ไขกิจกรรม
const editEventSchema = z.object({
  eventName: z.string().min(3, 'ชื่อกิจกรรมต้องมีอย่างน้อย 3 ตัวอักษร'),
  category: z.string(),
  eventDate: z.string().min(1, 'กรุณาระบุวันที่จัดงาน'),
  venue: z.string().min(2, 'กรุณาระบุสถานที่จัดงาน'),
  imageUrl: z.string().optional().or(z.literal('')),
  shortDescription: z.string().min(1, 'กรุณากรอกคำโปรยสั้นๆ'),
  description: z.string().min(10, 'รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร'),
  eventsStatus: z.enum(['Upcoming', 'Ongoing', 'Completed', 'Cancelled']),
});

type EditEventFormValues = z.infer<typeof editEventSchema>;

export default function EditEvent() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 2. ตั้งค่า React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditEventFormValues>({
    resolver: zodResolver(editEventSchema),
    defaultValues: {
      eventName: '',
      category: 'Technology',
      eventDate: '',
      venue: '',
      imageUrl: '',
      shortDescription: '',
      description: '',
      eventsStatus: 'Upcoming',
    },
  });

  // 3. ดึงข้อมูลเดิมของกิจกรรมมาใส่ในฟอร์ม
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${eventId}`);
        const ev = response.data;
        // รีเซ็ตค่าในฟอร์มด้วยข้อมูลที่ดึงมา
        reset({
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
    if (eventId) {
      fetchEvent();
    }
  }, [eventId, reset]);

  // 4. บันทึกการแก้ไขลงฐานข้อมูล
  const onSubmit = async (values: EditEventFormValues) => {
    setErrorMsg(null);
    try {
      await api.put(`/events/${eventId}`, values);
      // บันทึกเสร็จแล้วพากลับไปหน้าจัดการกิจกรรม (OrganizerDashboard)
      navigate(`/manage-event/${eventId}`);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'ไม่สามารถบันทึกการแก้ไขได้ กรุณาลองใหม่อีกครั้ง');
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อกิจกรรม *</label>
            <input
              type="text"
              {...register('eventName')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {errors.eventName && <p className="text-xs text-red-500 mt-1">{errors.eventName.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่ *</label>
              <select
                {...register('category')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Technology">Technology</option>
                <option value="Workshop">Workshop</option>
                <option value="Business">Business</option>
                <option value="Art & Culture">Art & Culture</option>
                <option value="Music & Concert">Music & Concert</option>
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่จัดงาน *</label>
              <input
                type="date"
                {...register('eventDate')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              {errors.eventDate && <p className="text-xs text-red-500 mt-1">{errors.eventDate.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สถานะกิจกรรม</label>
              <select
                {...register('eventsStatus')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Upcoming">Upcoming (กำลังจะมาถึง)</option>
                <option value="Ongoing">Ongoing (กำลังจัดงาน)</option>
                <option value="Completed">Completed (จบงานแล้ว)</option>
                <option value="Cancelled">Cancelled (ยกเลิก)</option>
              </select>
              {errors.eventsStatus && <p className="text-xs text-red-500 mt-1">{errors.eventsStatus.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สถานที่จัดงาน (Venue) *</label>
              <input
                type="text"
                {...register('venue')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              {errors.venue && <p className="text-xs text-red-500 mt-1">{errors.venue.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ลิงก์รูปภาพหน้าปก (URL)</label>
              <input
                type="url"
                {...register('imageUrl')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              {errors.imageUrl && <p className="text-xs text-red-500 mt-1">{errors.imageUrl.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">คำโปรยสั้นๆ (Short Description) *</label>
            <input
              type="text"
              {...register('shortDescription')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {errors.shortDescription && <p className="text-xs text-red-500 mt-1">{errors.shortDescription.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดกิจกรรมฉบับเต็ม *</label>
            <textarea
              rows={5}
              {...register('description')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
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
              disabled={!isDirty || isSubmitting}
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