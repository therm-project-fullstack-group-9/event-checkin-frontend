// สถานะใบจอง (ตรงกับ enum booking_status ใน backend)
export type BookingStatus = 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED' | 'NO_SHOW';

export interface SessionTime {
  startTime: string;
  endTime: string;
}

export interface AttendeeBooking {
  bookingId: string;
  ticketRef: string;
  bookingStatus: BookingStatus;
  checkInTime?: string | null;
  healthDeclaration?: string;
  user: {
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber: string;
  };
  session: SessionTime;
}

// ตั๋วรายใบ (หน้า Ticket)
export interface TicketDetail {
  bookingId: string;
  ticketRef: string;
  bookingStatus: BookingStatus;
  checkInTime?: string | null;
  healthDeclaration?: string;
  user: {
    firstName: string;
    lastName: string;
    emailAddress: string;
  };
  event: {
    eventId: string;
    eventName: string;
    eventDate: string;
    venue: string;
    category: string;
  };
  session: SessionTime;
}

export type MyEventRole = 'Attendee' | 'Organizer' | 'Staff';

// รายการในหน้า "กิจกรรมของฉัน" (รวมบทบาทผู้เข้าร่วม/ผู้จัด/สตาฟ)
export interface MyEventItem {
  id: string;
  eventId: string;
  title: string;
  date: string;
  venue?: string;
  sessionTime?: string;
  imageUrl: string;
  role: MyEventRole;
  ticketRef?: string;
  bookingStatus?: BookingStatus;
}

// ผลการสแกนเช็คอินที่หน้า Staff Scanner
export interface ScanResult {
  status: 'success' | 'error' | 'idle';
  message: string;
  ticketRef?: string;
  attendee?: string;
  eventTitle?: string;
  timestamp?: string;
}
