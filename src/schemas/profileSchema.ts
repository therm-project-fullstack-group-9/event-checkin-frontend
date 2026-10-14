import { z } from 'zod';

// กฎตรงกับ updateProfileSchema ของ backend
export const profileSchema = z.object({
  firstName: z.string().trim().min(1, 'กรุณากรอกชื่อจริง'),
  lastName: z.string().trim().min(1, 'กรุณากรอกนามสกุล'),
  nickname: z.string(),
  emailAddress: z.string().trim().email('รูปแบบอีเมลไม่ถูกต้อง'),
  // ว่างได้ (ผู้ใช้ที่เข้าด้วย OAuth อาจยังไม่มีเบอร์) แต่ถ้ากรอกต้องเป็นตัวเลข 10 หลัก
  phoneNumber: z.string().trim().refine((v) => v === '' || /^[0-9]{10}$/.test(v), 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก'),
  birthday: z.string(),
  occupation: z.string(),
  workplace: z.string(),
  profileImage: z.string(),
  backgroundImage: z.string(),
});

export type ProfileValues = z.infer<typeof profileSchema>;
