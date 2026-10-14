import { z } from 'zod';

export const loginSchema = z.object({
  emailAddress: z.string().trim().min(1, 'กรุณากรอกอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'กรุณากรอกชื่อจริง'),
    lastName: z.string().trim().min(1, 'กรุณากรอกนามสกุล'),
    emailAddress: z.string().trim().min(1, 'กรุณากรอกอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง'),
    // เบอร์โทรไม่บังคับ แต่ถ้ากรอกต้องเป็นตัวเลข 10 หลัก (ตรงกับ backend)
    phoneNumber: z
      .string()
      .trim()
      .refine((v) => v === '' || /^[0-9]{10}$/.test(v), 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก'),
    password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร').max(72, 'รหัสผ่านยาวเกินไป'),
    confirmPassword: z.string().min(1, 'กรุณายืนยันรหัสผ่าน'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'รหัสผ่านไม่ตรงกัน',
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
