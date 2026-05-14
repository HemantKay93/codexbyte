import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const metaEnv = (
  import.meta as ImportMeta & {
    env?: Record<string, string | undefined>;
  }
).env;

const SOCKET_URL = metaEnv?.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:8080';

export const SocketService = {
  connect: (userId?: string) => {
    if (socket) return socket;

    socket = io(SOCKET_URL, {
      query: userId ? { userId } : {},
      transports: ['websocket'], // Prefer websocket for performance
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
    });

    return socket;
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  on: (event: string, callback: (data: any) => void) => {
    if (!socket) return;
    socket.on(event, callback);
  },

  off: (event: string) => {
    if (!socket) return;
    socket.off(event);
  },

  emit: (event: string, data: any) => {
    if (!socket) return;
    socket.emit(event, data);
  },
};
