import { WHITELIST_DOMAIN } from '@/utils/constants.helper';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: WHITELIST_DOMAIN
  }
});

// Current online users
const userSocketMap: Record<string, unknown> = {};

// Get socketId from online userId
export const getSocketIdByUserId = (userId: number) => {
  return userSocketMap[userId] as string;
};

io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  const userId = socket.handshake.query.userId as string;
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit('get-online-users', Object.keys(userSocketMap));

  socket.on('disconnect', () => {
    console.log('A user disconnected', socket.id);
    delete userSocketMap[userId];
    io.emit('get-online-users', Object.keys(userSocketMap));
  });
});

export { app, io, server };
