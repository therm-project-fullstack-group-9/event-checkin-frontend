import { useState, useEffect, useRef } from 'react';
import { api } from '../libs/api';

export default function MyAccount() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    userId: '',
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
    // newPassword: '',
    createdAt: '',
  });

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      const user = response.data;

      setFormData({
        userId: user.userId || user.id || '',
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
        // newPassword: '',
        createdAt: user.createdAt || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ฟังก์ชันแปลงไฟล์รูปที่เลือกจากเครื่องเป็น Base64 เพื่อแสดงผลและบันทึกได้ทันที
  const handleImageFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'profileImage' | 'backgroundImage'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        [field]: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);

    try {
      await api.put('/profile', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        nickname: formData.nickname,
        emailAddress: formData.emailAddress,
        phoneNumber: formData.phoneNumber,
        birthday: formData.birthday,
        occupation: formData.occupation,
        workplace: formData.workplace,
        profileImage: formData.profileImage,
        backgroundImage: formData.backgroundImage,
        // password: formData.newPassword,
      });

      setStatusMsg({ type: 'success', text: '✅ บันทึกการเปลี่ยนแปลงข้อมูลบัญชีสำเร็จ!' });
      fetchProfile();
    } catch (error: any) {
      setStatusMsg({
        type: 'error',
        text: error.response?.data?.message || '❌ ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500">กำลังโหลดข้อมูลบัญชีของคุณ...</div>;
  }

  const avatarInitial = formData.firstName ? formData.firstName.charAt(0).toUpperCase() : 'U';

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
            formData.backgroundImage
              ? { backgroundImage: `url(${formData.backgroundImage})` }
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
                {formData.profileImage ? (
                  <img
                    src={formData.profileImage}
                    alt={formData.firstName}
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
                  {formData.firstName} {formData.lastName}
                  {formData.nickname && (
                    <span className="text-base font-normal text-indigo-100 ml-2">
                      ({formData.nickname})
                    </span>
                  )}
                </h2>
                <p className="text-indigo-100 text-xs sm:text-sm">{formData.emailAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ฟอร์มแก้ไขข้อมูล */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
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
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  นามสกุล (Last Name) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อเล่น (Nickname)
                </label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
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
                  value={formData.birthday}
                  onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อาชีพ (Occupation)
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
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
                  value={formData.workplace}
                  onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
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
                  required
                  value={formData.emailAddress}
                  onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เบอร์โทรศัพท์ (Phone Number) *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* ลิงก์รูปโปรไฟล์และรูปพื้นหลัง (เผื่อกรณีต้องการวางเป็น URL) */}
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
                    value={formData.profileImage}
                    onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                    placeholder="https://... หรือกดปุ่ม 📷 ด้านบน"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  {formData.profileImage && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, profileImage: '' })}
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
                    value={formData.backgroundImage}
                    onChange={(e) => setFormData({ ...formData, backgroundImage: e.target.value })}
                    placeholder="https://... หรือกดปุ่ม 🖼️ ด้านบน"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  {formData.backgroundImage && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, backgroundImage: '' })}
                      className="px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl border border-gray-200 shrink-0"
                    >
                      ลบรูป
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 
          ====================================================================
          หมวดเปลี่ยนรหัสผ่าน
          ====================================================================
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
              เปลี่ยนรหัสผ่าน (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)
            </h3>
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัสผ่านใหม่ (New Password)
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="กรอกรหัสผ่านใหม่เมื่อต้องการเปลี่ยนเท่านั้น"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          */}

          {/* ปุ่มบันทึกข้อมูล */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-gray-400">
              {formData.createdAt && (
                <span>
                  สร้างบัญชีเมื่อ:{' '}
                  {new Date(formData.createdAt).toLocaleDateString('th-TH', {
                    dateStyle: 'long',
                  })}
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition shadow-sm"
            >
              {isSaving ? 'กำลังบันทึกข้อมูล...' : 'บันทึกการเปลี่ยนแปลง'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}