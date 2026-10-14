export interface AuthUser {
  userId: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
}

// ผู้ใช้ปัจจุบันจาก GET /api/profile (มีสถานะการถูกระงับสิทธิ์จองแนบมาด้วย)
export interface UserProfile extends AuthUser {
  nickname?: string | null;
  phoneNumber?: string | null;
  birthday?: string | null;
  occupation?: string | null;
  workplace?: string | null;
  profileImage?: string | null;
  backgroundImage?: string | null;
  createdAt?: string;
  noShowCount?: number;
  bookingBlocked?: boolean;
}
