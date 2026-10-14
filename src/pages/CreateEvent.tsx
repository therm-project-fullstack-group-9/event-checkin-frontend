import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../libs/api';

// 1. กำหนด Zod Schema (แก้เป็น z.number ธรรมดา)
const sessionSchema = z.object({
  startTime: z.string().min(1, 'กรุณาระบุเวลาเริ่ม'),
  endTime: z.string().min(1, 'กรุณาระบุเวลาสิ้นสุด'),
  capacity: z.number().min(1, 'ที่นั่งต้องมากกว่า 0'), 
});

const createEventSchema = z.object({
  eventName: z.string().min(3, 'ชื่อกิจกรรมต้องมีอย่างน้อย 3 ตัวอักษร'),
  category: z.string(),
  eventDate: z.string().min(1, 'กรุณาระบุวันที่จัดงาน'),
  venue: z.string().min(2, 'กรุณาระบุสถานที่จัดงาน'),
  imageUrl: z.string().optional().or(z.literal('')),
  shortDescription: z.string().min(1, 'กรุณากรอกคำโปรยสั้นๆ'),
  description: z.string().min(10, 'รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร'),
  sessions: z.array(sessionSchema).min(1, 'ต้องมีอย่างน้อย 1 รอบเวลา'),
});

type CreateEventFormValues = z.infer<typeof createEventSchema>;

export default function CreateEvent() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 2. ตั้งค่า React Hook Form
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      eventName: '',
      category: 'Technology',
      eventDate: '',
      venue: '',
      imageUrl: '',
      shortDescription: '',
      description: '',
      sessions: [{ startTime: '09:00', endTime: '12:00', capacity: 100 }],
    },
  });

  // 3. ใช้ useFieldArray สำหรับจัดการฟิลด์ที่เพิ่ม/ลดได้แบบไดนามิก
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sessions',
  });

  const onSubmit: SubmitHandler<CreateEventFormValues> = async (values) => {
    setErrorMsg(null);
    try {
      await api.post('/events', values);
      navigate('/my-events');
    } catch (error: any) {
      setErrorMsg(
        error.response?.data?.message || 'ไม่สามารถสร้างกิจกรรมได้ กรุณาลองใหม่อีกครั้ง'
      );
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อกิจกรรม *</label>
            <input
              type="text"
              {...register('eventName')}
              placeholder="เช่น เวิร์กชอป React & TypeScript 2026"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {errors.eventName && <p className="text-xs text-red-500 mt-1">{errors.eventName.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สถานที่จัดงาน (Venue) *</label>
              <input
                type="text"
                {...register('venue')}
                placeholder="เช่น อาคารนวัตกรรม มหาวิทยาลัยเชียงใหม่"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              {errors.venue && <p className="text-xs text-red-500 mt-1">{errors.venue.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ลิงก์รูปภาพหน้าปก (URL)</label>
              <input
                type="url"
                {...register('imageUrl')}
                placeholder="https://images.unsplash.com/..."
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
              placeholder="สรุปความน่าสนใจของงานใน 1-2 ประโยค"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {errors.shortDescription && <p className="text-xs text-red-500 mt-1">{errors.shortDescription.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดกิจกรรมฉบับเต็ม *</label>
            <textarea
              rows={4}
              {...register('description')}
              placeholder="อธิบายกำหนดการ เนื้อหา และสิ่งที่ผู้เข้าร่วมจะได้รับ..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          {/* ส่วนกำหนดรอบเวลา (Sessions) */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-base font-bold text-gray-900">
                กำหนดรอบเวลา (Sessions)
              </label>
              <button
                type="button"
                onClick={() => append({ startTime: '13:00', endTime: '16:00', capacity: 100 })}
                className="text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg transition"
              >
                + เพิ่มรอบเวลา
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-wrap sm:flex-nowrap items-end gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200"
                >
                  <div className="flex-1 min-w-[110px]">
                    <label className="block text-xs text-gray-500 mb-1">เวลาเริ่ม</label>
                    <input
                      type="time"
                      {...register(`sessions.${index}.startTime` as const)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.sessions?.[index]?.startTime && (
                      <p className="text-xs text-red-500 mt-1">{errors.sessions[index].startTime?.message}</p>
                    )}
                  </div>

                  <div className="flex-1 min-w-[110px]">
                    <label className="block text-xs text-gray-500 mb-1">เวลาสิ้นสุด</label>
                    <input
                      type="time"
                      {...register(`sessions.${index}.endTime` as const)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.sessions?.[index]?.endTime && (
                      <p className="text-xs text-red-500 mt-1">{errors.sessions[index].endTime?.message}</p>
                    )}
                  </div>

                  <div className="w-28">
                    <label className="block text-xs text-gray-500 mb-1">จำนวนที่นั่ง</label>
                    <input
                      type="number"
                      min={1}
                      // เพิ่ม { valueAsNumber: true } ตรงนี้เพื่อบังคับให้ส่งออกมาเป็น Number เสมอ
                      {...register(`sessions.${index}.capacity` as const, { valueAsNumber: true })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.sessions?.[index]?.capacity && (
                      <p className="text-xs text-red-500 mt-1">{errors.sessions[index].capacity?.message}</p>
                    )}
                  </div>

                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
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