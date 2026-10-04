import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '../libs/api';

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  nickname?: string | null;
  emailAddress: string;
  phoneNumber: string;
  birthday?: string | null;
  occupation?: string | null;
  workplace?: string | null;
  profileImage?: string | null;
  backgroundImage?: string | null;
}

interface AppState {
  // 1. ข้อมูลผู้ใช้ประจำแท็บนี้
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  logout: () => void;

  // 2. ข้อมูล Cache ลดการดึง API ซ้ำๆ
  eventsCache: any[];
  lastFetchedEvents: number | null;
  myBookingsCache: any[];
  lastFetchedMyBookings: number | null;

  fetchEvents: (forceRefresh?: boolean) => Promise<any[]>;
  fetchMyBookings: (forceRefresh?: boolean) => Promise<any[]>;
  invalidateCache: () => void;
}


const CACHE_TTL = 60 * 1000; // เก็บ Cache ไว้ 1 นาที (60,000 ms)

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      eventsCache: [],
      lastFetchedEvents: null,
      myBookingsCache: [],
      lastFetchedMyBookings: null,

      setCurrentUser: (user) => {
        set({
          currentUser: user,
          // ล้าง Cache ของ User คนเก่าเมื่อเปลี่ยนบัญชีในแท็บนี้
          myBookingsCache: [],
          lastFetchedMyBookings: null,
        });
      },

      logout: () => {
        set({
          currentUser: null,
          myBookingsCache: [],
          lastFetchedMyBookings: null,
        });
      },

      // ดึงรายการอีเวนต์ทั้งหมด (ถ้ามีใน Cache และยังไม่หมดอายุ จะคืนค่าจาก Zustand ทันที)
      fetchEvents: async (forceRefresh = false) => {
        const { eventsCache, lastFetchedEvents } = get();
        const now = Date.now();

        if (!forceRefresh && eventsCache.length > 0 && lastFetchedEvents && now - lastFetchedEvents < CACHE_TTL) {
          return eventsCache;
        }

        const res = await api.get('/events');
        set({ eventsCache: res.data, lastFetchedEvents: now });
        return res.data;
      },

      // ดึงรายการตั๋วและงานของฉันตาม User ในแท็บปัจจุบัน
      fetchMyBookings: async (forceRefresh = false) => {
        const { myBookingsCache, lastFetchedMyBookings } = get();
        const now = Date.now();

        if (!forceRefresh && myBookingsCache.length > 0 && lastFetchedMyBookings && now - lastFetchedMyBookings < CACHE_TTL) {
          return myBookingsCache;
        }

        const res = await api.get('/my-bookings');
        set({ myBookingsCache: res.data, lastFetchedMyBookings: now });
        return res.data;
      },

      // เรียกใช้เมื่อมีการจองตั๋วใหม่ สร้างงานใหม่ หรือแก้ไขงาน เพื่อสั่งให้ดึงข้อมูลสดในครั้งถัดไป
      invalidateCache: () => {
        set({ lastFetchedEvents: null, lastFetchedMyBookings: null });
      },
    }),
    {
      name: 'events-checkin-tab-session',
      // 🔑 หัวใจสำคัญ: ใช้ sessionStorage เพื่อให้แต่ละแท็บแยก User กัน 100%
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
);