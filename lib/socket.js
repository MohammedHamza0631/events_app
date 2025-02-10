import { Server } from 'socket.io';

let io;

export const initSocket = async (res) => {
  if (!io) {
    const path = '/api/socketio';

    if (!res?.socket?.server) {
      throw new Error('Server not initialized');
    }

    if (res.socket.server.io) {
      io = res.socket.server.io;
      return io;
    }

    io = new Server(res.socket.server, {
      path,
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['polling', 'websocket'],
    });

    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('joinEvent', (eventId) => {
        socket.join(`event-${eventId}`);
        console.log(`Client ${socket.id} joined event ${eventId}`);
      });

      socket.on('leaveEvent', (eventId) => {
        socket.leave(`event-${eventId}`);
        console.log(`Client ${socket.id} left event ${eventId}`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

export const emitEventUpdate = (eventId, data) => {
  try {
    if (global.io) {
      global.io.to(`event-${eventId}`).emit('eventUpdate', data);
    }
  } catch (error) {
    console.error('Socket.IO emit error:', error);
  }
}; 