import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import MyEventCard from '../components/myevents/MyEventCard';
import type { MyEventItem } from '../types';


export default function MyEvents() {
  const [items, setItems] = useState<MyEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'attendee' | 'organizer'>('all');

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const response = await api.get('/my-bookings');
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching my events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyEvents();
  }, []);

  // กรองรายการตามแถบ Tab ที่เลือก
  const filteredItems = items.filter((item) => {
    if (activeTab === 'attendee') return item.role === 'Attendee' || item.role === 'Staff';
    if (activeTab === 'organizer') return item.role === 'Organizer';
    return true;
  });

  if (loading) {
    return <div className="p-12 text-center text-gray-500">กำลังโหลดข้อมูลกิจกรรมของฉัน...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* ส่วนหัวและปุ่ม + สร้างกิจกรรมใหม่ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">กิจกรรมของฉัน</h1>
          <p className="text-sm text-gray-500 mt-1">จัดการกิจกรรมที่คุณสร้างและตั๋วที่คุณมี</p>
        </div>
        <Link
          to="/create-event"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition w-fit"
        >
          + สร้างกิจกรรมใหม่
        </Link>
      </div>

      {/* แถบเมนูสลับหมวดหมู่ (Tabs) */}
      <div className="flex gap-6 border-b border-gray-200 mb-6 text-sm">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`pb-3 font-medium border-b-2 transition ${
            activeTab === 'all'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          ทั้งหมด
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('attendee')}
          className={`pb-3 font-medium border-b-2 transition ${
            activeTab === 'attendee'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          ที่เข้าร่วม / ตั๋วของฉัน
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('organizer')}
          className={`pb-3 font-medium border-b-2 transition ${
            activeTab === 'organizer'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          กิจกรรมที่ฉันสร้าง
        </button>
      </div>

      {/* รายการการ์ดแบบใหม่ (Vertical Modern Card) */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <p className="text-gray-500 mb-4">ยังไม่มีรายการกิจกรรมในหมวดหมู่นี้</p>
          <Link
            to="/explore-events"
            className="inline-block bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
          >
            ไปสำรวจกิจกรรมน่าสนใจ
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <MyEventCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}