import { env } from '@/env';

export const getApiUrl = (): string => {
  if (env.NEXT_PUBLIC_API_URL) {
    return env.NEXT_PUBLIC_API_URL;
  }
  
  // Resolve host machine IP in browser for testing on local network (e.g. tablet, phone)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:3001`;
    }
  }
  
  return 'http://localhost:3001';
};
