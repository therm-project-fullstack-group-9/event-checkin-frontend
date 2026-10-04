import axios from 'axios';
import { useAppStore } from '../store/useAppStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// แนบ Header x-user-id ของแท็บปัจจุบันไปกับทุก Request ที่เรียกผ่านตัวแปร api อัตโนมัติ
api.interceptors.request.use((config) => {
  const currentUser = useAppStore.getState().currentUser;
  if (currentUser?.userId) {
    config.headers['x-user-id'] = currentUser.userId;
  }
  return config;
});