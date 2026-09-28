// import { z } from 'zod';

// const sessionSchema = z.object({
//   startTime: z.string().min(1, { message: 'กรุณาระบุเวลาเริ่ม' }),
//   endTime: z.string().min(1, { message: 'กรุณาระบุเวลาสิ้นสุด' }),
//   // ใช้ z.number() เปล่าๆ แล้วตามด้วย .min() ได้เลย
//   capacity: z.number().min(1, { message: 'จำนวนต้องมากกว่า 0' }),
// }).refine(data => new Date(data.startTime) < new Date(data.endTime), {
//   message: 'เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่ม',
//   path: ['endTime'],
// });

// export const eventSchema = z.object({
//   title: z.string().min(3, { message: 'ชื่องานต้องมีอย่างน้อย 3 ตัวอักษร' }),
//   location: z.string().min(3, { message: 'สถานที่ต้องมีอย่างน้อย 3 ตัวอักษร' }),
//   description: z.string().optional(),
//   sessions: z.array(sessionSchema).min(1, { message: 'ต้องมีอย่างน้อย 1 รอบเวลา' }),
// });

// export type EventFormData = z.infer<typeof eventSchema>;