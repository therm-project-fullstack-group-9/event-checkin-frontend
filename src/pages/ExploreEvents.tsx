import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../libs/api';
import { formatThaiDate } from '../libs/formatDate';

export interface EventItem {
  eventId: string;
  eventName: string;
  shortDescription: string;
  eventDate: string;
  venue: string;
  category: string;
  imageUrl: string;
  eventsStatus: string;
  maxCapacity: number;
}

export default function ExploreEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="p-12 text-center text-gray-500">กำลังโหลดข้อมูลกิจกรรมจากฐานข้อมูล...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">สำรวจกิจกรรมทั้งหมด</h1>
        <p className="text-gray-600 mt-1">ค้นหาและลงทะเบียนเข้าร่วมกิจกรรมที่คุณสนใจ</p>
      </div>

      {/* ช่องค้นหาและตัวกรองหมวดหมู่ */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="ค้นหาชื่อกิจกรรม หรือ สถานที่..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="All">ทุกหมวดหมู่</option>
          <option value="Technology">Technology</option>
          <option value="Workshop">Workshop</option>
          <option value="Business">Business</option>
          <option value="Art & Culture">Art & Culture</option>
        </select>
      </div>

      {/* แสดงการ์ดกิจกรรมจากฐานข้อมูล */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div key={event.eventId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col">
            <img src={event.imageUrl} alt={event.eventName} className="w-full h-48 object-cover" />
            <div className="p-5 flex-1 flex flex-col">
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full w-fit mb-2">
                {event.category}
              </span>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{event.eventName}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">{event.shortDescription}</p>
              <div className="text-xs text-gray-500 space-y-1 mb-4">
                <div>📅 {formatThaiDate(event.eventDate)}</div>
                <div>📍 {event.venue}</div>
              </div>
              <Link
                to={`/event/${event.eventId}`}
                className="w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition"
              >
                ดูรายละเอียด / จองตั๋ว
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}