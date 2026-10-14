import type { AttendeeBooking } from './booking';

export interface SessionItem {
  sessionId: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
}

// ข้อมูลกิจกรรมแบบสรุป (หน้า Explore)
export interface EventSummary {
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

// ข้อมูลกิจกรรมเต็ม (หน้ารายละเอียด)
export interface EventDetail extends EventSummary {
  description: string;
  sessions: SessionItem[];
  organizer?: {
    firstName: string;
    lastName: string;
  };
}

export interface DashboardData {
  event: EventDetail;
  bookings: AttendeeBooking[];
}

// รอบเวลาในฟอร์มสร้างกิจกรรม
export interface SessionInput {
  startTime: string;
  endTime: string;
  capacity: number;
}
