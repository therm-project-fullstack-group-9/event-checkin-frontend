import { z } from 'zod';
import { EVENT_CATEGORIES } from '../constants/eventCategories';

// เวลาเก็บเป็น "HH:MM" (ตรงกับ input type="time") เทียบแบบข้อความได้เพราะรูปแบบเท่ากันทุกค่า
export const sessionSchema = z
  .object({
    startTime: z.string().min(1, 'กรุณาระบุเวลาเริ่ม'),
    endTime: z.string().min(1, 'กรุณาระบุเวลาสิ้นสุด'),
    capacity: z.number().int('จำนวนที่นั่งต้องเป็นจำนวนเต็ม').min(1, 'จำนวนที่นั่งต้องมากกว่า 0'),
  })
  .refine((s) => !s.startTime || !s.endTime || s.endTime > s.startTime, {
    path: ['endTime'],
    message: 'เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่ม',
  });

// ฟิลด์ที่ใช้ร่วมกันระหว่างสร้างและแก้ไขกิจกรรม (กฎตรงกับ backend: validators/zodValidators.ts)
const eventFields = {
  eventName: z.string().min(3, 'ชื่อกิจกรรมต้องมีอย่างน้อย 3 ตัวอักษร'),
  category: z.enum(EVENT_CATEGORIES, { message: 'กรุณาเลือกหมวดหมู่' }),
  eventDate: z.string().min(1, 'กรุณาระบุวันที่จัดงาน'),
  venue: z.string().min(2, 'กรุณาระบุสถานที่จัดงาน'),
  imageUrl: z.union([z.literal(''), z.string().url('ลิงก์รูปภาพไม่ถูกต้อง')]),
  shortDescription: z.string().min(1, 'กรุณากรอกคำโปรยสั้น ๆ'),
  description: z.string().min(10, 'รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร'),
};

export const createEventSchema = z
  .object({
    ...eventFields,
    sessions: z.array(sessionSchema).min(1, 'ต้องมีอย่างน้อย 1 รอบเวลา'),
  });

export const editEventSchema = z.object({
  ...eventFields,
  eventsStatus: z.string().min(1),
});

export type CreateEventValues = z.infer<typeof createEventSchema>;
export type EditEventValues = z.infer<typeof editEventSchema>;
