import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../libs/api';
import { useAppStore } from '../store/useAppStore';

// 1. กำหนด Zod Schema (กฎการตรวจสอบข้อมูล)
const profileSchema = z.object({
  firstName: z.string().min(1, 'กรุณากรอกชื่อจริง'),
  lastName: z.string().min(1, 'กรุณากรอกนามสกุล'),
  nickname: z.string().optional().nullable(),
  emailAddress: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  phoneNumber: z
    .string()
    .min(9, 'เบอร์โทรศัพท์ต้องมีอย่างน้อย 9 ตัวอักษร')
    .max(10, 'เบอร์โทรศัพท์ต้องไม่เกิน 10 ตัวอักษร'),
  birthday: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  workplace: z.string().optional().nullable(),
  profileImage: z.string().optional().nullable(),
  backgroundImage: z.string().optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function MyAccount() {
  const currentUser = useAppStore((state) => state.currentUser);
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);

  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  // 2. เรียกใช้ React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      nickname: '',
      emailAddress: '',
      phoneNumber: '',
      birthday: '',
      occupation: '',
      workplace: '',
      profileImage: '',
      backgroundImage: '',
    },
  });

  // ใช้ watch เพื่อดึงค่ามาแสดงผลแบบเรียลไทม์ (แทนที่ formData แบบเก่า)
  const currentBgImage = watch('backgroundImage');
  const currentProfileImage = watch('profileImage');
  const currentFirstName = watch('firstName');
  const currentLastName = watch('lastName');
  const currentNickname = watch('nickname');
  const currentEmail = watch('emailAddress');

  const fetchProfile = async () => {
    try {
      // โหลดข้อมูลเริ่มต้นจาก Zustand ก่อนให้เว็บดูเร็ว
      if (currentUser) {
        reset({
          ...currentUser,
          birthday: currentUser.birthday ? String(currentUser.birthday).substring(0, 10) : '',
        });
      }

      // ดึงข้อมูลล่าสุดจาก API
      const response = await api.get('/profile');
      const user = response.data;
      
      setCurrentUser(user);
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        nickname: user.nickname || '',
        emailAddress: user.emailAddress || '',
        phoneNumber: user.phoneNumber || '',
        birthday: user.birthday ? String(user.birthday).substring(0, 10) : '',
        occupation: user.occupation || '',
        workplace: user.workplace || '',
        profileImage: user.profileImage || '',
        backgroundImage: user.backgroundImage || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ฟังก์ชันแปลงไฟล์รูปที่เลือกจากเครื่องเป็น Base64
  const handleImageFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'profileImage' | 'backgroundImage'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      // ใช้ setValue ของ react-hook-form แทน setFormData
      setValue(field, reader.result as string, { shouldValidate: true, shouldDirty: true });
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (values: ProfileFormValues) => {
    setStatusMsg(null);

    try {
      const res = await api.put('/profile', values);
      
      setCurrentUser(res.data.user);
      setStatusMsg({ type: 'success', text: '✅ บันทึกการเปลี่ยนแปลงข้อมูลบัญชีสำเร็จ!' });
      reset(values); // รีเซ็ตสถานะ isDirty
    } catch (error: any) {
      setStatusMsg({
        type: 'error',
        text: error.response?.data?.message || '❌ ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
      });
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500">กำลังโหลดข้อมูลบัญชีของคุณ...</div>;
  }

  const avatarInitial = currentFirstName ? currentFirstName.charAt(0).toUpperCase() : 'U';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">บัญชีของฉัน</h1>
        <p className="text-sm text-gray-500 mt-1">
          จัดการข้อมูลส่วนตัว รูปโปรไฟล์ และข้อมูลติดต่อของคุณ
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* ส่วนหัวการ์ด: รูปพื้นหลัง (Background Cover) และรูปโปรไฟล์ */}
        <div
          className="relative h-44 sm:h-52 bg-gradient-to-r from-indigo-600 to-purple-600 bg-cover bg-center"
          style={
            currentBgImage
              ? { backgroundImage: `url(${currentBgImage})` }
              : undefined
          }
        >
          {/* ชั้นกรองแสงให้ตัวหนังสืออ่านง่ายเมื่อมีรูปพื้นหลัง */}
          <div className="absolute inset-0 bg-black/25" />

          {/* ปุ่มเปลี่ยนรูปพื้นหลัง (มุมขวาบน) */}
          <input
            ref={bgInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageFileChange(e, 'backgroundImage')}
          />
          <button
            type="button"
            onClick={() => bgInputRef.current?.click()}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white text-xs font-medium px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/30 transition flex items-center gap-1.5"
          >
            🖼️ เปลี่ยนรูปพื้นหลัง
          </button>

          {/* ข้อมูลผู้ใช้และรูปโปรไฟล์ด้านล่างแบนเนอร์ */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-5">
              {/* รูปโปรไฟล์ + ปุ่มกดเปลี่ยนรูป */}
              <div className="relative group shrink-0">
                {currentProfileImage ? (
                  <img
                    src={currentProfileImage}
                    alt={currentFirstName}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-md bg-white"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-indigo-500 border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-white">
                    {avatarInitial}
                  </div>
                )}

                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageFileChange(e, 'profileImage')}
                />
                <button
                  type="button"
                  onClick={() => profileInputRef.current?.click()}
                  title="เปลี่ยนรูปโปรไฟล์"
                  className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white w-8 h-8 rounded-full border-2 border-white shadow flex items-center justify-center text-xs transition"
                >
                  📷
                </button>
              </div>

              {/* ชื่อ-นามสกุล และอีเมล */}
              <div className="text-white drop-shadow">
                <h2 className="text-xl sm:text-2xl font-bold">
                  {currentFirstName} {currentLastName}
                  {currentNickname && (
                    <span className="text-base font-normal text-indigo-100 ml-2">
                      ({currentNickname})
                    </span>
                  )}
                </h2>
                <p className="text-indigo-100 text-xs sm:text-sm">{currentEmail}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ฟอร์มแก้ไขข้อมูล */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-6" noValidate>
          {statusMsg && (
            <div
              className={`p-4 rounded-xl text-sm font-medium border ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          {/* ข้อมูลส่วนตัว */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
              ข้อมูลส่วนตัว
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อจริง (First Name) *
                </label>
                <input
                  type="text"
                  {...register('firstName')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  นามสกุล (Last Name) *
                </label>
                <input
                  type="text"
                  {...register('lastName')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อเล่น (Nickname)
                </label>
                <input
                  type="text"
                  {...register('nickname')}
                  placeholder="เช่น ฟิวส์, เอิร์ธ"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  วันเกิด (Birthday)
                </label>
                <input
                  type="date"
                  {...register('birthday')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อาชีพ (Occupation)
                </label>
                <input
                  type="text"
                  {...register('occupation')}
                  placeholder="เช่น นักศึกษา, Software Developer"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  สถานที่ทำงาน / สถานศึกษา (Workplace)
                </label>
                <input
                  type="text"
                  {...register('workplace')}
                  placeholder="เช่น มหาวิทยาลัยเชียงใหม่"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* ข้อมูลการติดต่อ */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
              ข้อมูลการติดต่อ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อีเมล (Email Address) *
                </label>
                <input
                  type="email"
                  disabled // ปิดไม่ให้แก้ได้เพื่อป้องกันปัญหาล็อกอิน
                  {...register('emailAddress')}
                  className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed rounded-xl text-sm focus:outline-none"
                />
                {errors.emailAddress && <p className="text-xs text-red-500 mt-1">{errors.emailAddress.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เบอร์โทรศัพท์ (Phone Number) *
                </label>
                <input
                  type="tel"
                  {...register('phoneNumber')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                {errors.phoneNumber && <p className="text-xs text-red-500 mt-1">{errors.phoneNumber.message}</p>}
              </div>
            </div>
          </div>

          {/* ลิงก์รูปโปรไฟล์และรูปพื้นหลัง */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
              ตั้งค่ารูปโปรไฟล์และพื้นหลัง (เลือกไฟล์จากปุ่มด้านบน หรือวางลิงก์ URL)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รูปโปรไฟล์ (Profile Image URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    {...register('profileImage')}
                    placeholder="https://... หรือกดปุ่ม 📷 ด้านบน"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  {currentProfileImage && (
                    <button
                      type="button"
                      onClick={() => setValue('profileImage', '', { shouldDirty: true })}
                      className="px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl border border-gray-200 shrink-0"
                    >
                      ลบรูป
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รูปพื้นหลัง (Background Image URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    {...register('backgroundImage')}
                    placeholder="https://... หรือกดปุ่ม 🖼️ ด้านบน"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  {currentBgImage && (
                    <button
                      type="button"
                      onClick={() => setValue('backgroundImage', '', { shouldDirty: true })}
                      className="px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl border border-gray-200 shrink-0"
                    >
                      ลบรูป
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ปุ่มบันทึกข้อมูล */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-end gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition shadow-sm"
            >
              {isSubmitting ? 'กำลังบันทึกข้อมูล...' : 'บันทึกการเปลี่ยนแปลง'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}