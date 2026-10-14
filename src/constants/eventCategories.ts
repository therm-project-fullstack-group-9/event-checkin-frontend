// หมวดหมู่กิจกรรมที่ระบบรองรับ (ใช้ร่วมกันในฟอร์มสร้าง/แก้ไขและตัวกรอง)
export const EVENT_CATEGORIES = ['Technology', 'Workshop', 'Business', 'Art & Culture', 'Music & Concert'] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];
export const DEFAULT_CATEGORY: EventCategory = 'Technology';
