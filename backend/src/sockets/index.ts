import { Server as HttpServer } from 'http';

import { Server } from 'socket.io';

import logger from '../services/logger.js';

let io: Server;

export const initSockets = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: '*', // In production, replace with actual origin
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    logger.info(`[Socket] User connected: ${userId || 'anonymous'} (ID: ${socket.id})`);

    // Join room based on role or userId if needed
    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.on('disconnect', () => {
      logger.info(`[Socket] User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

/**
 * Emit a real-time event to specific rooms
 */
export const emitToRoom = (room: string, event: string, data: any) => {
  if (io) {
    io.to(room).emit(event, data);
  }
};

/**
 * Broadcast to all admins
 */
export const notifyAdmins = (event: string, data: any) => {
  if (io) {
    io.emit(`admin:${event}`, data);
  }
};
