import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import Redis from 'ioredis';
import { redisConfig } from './config/redisdb';

import { WebSocketInitializer } from './websocket';

import userRoutes from './modules/users/routes';
import feedRoutes from './modules/feedMessages/routes';
import chatRoomRoutes from './modules/chatRooms/routes';
import chatFeedRoutes from './modules/chatMessages/routes';
import { Types } from 'mongoose';

const PORT = parseInt(process.env.PORT) || 5000;
const redisSub = new Redis(redisConfig.socket);

const app: express.Application = express();
const webSocketInitializer = new WebSocketInitializer();

webSocketInitializer.initialize();

app.use('/', express.static('./views'));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/user', userRoutes);
app.use('/feed-room', feedRoutes);
app.use('/chat-room', chatRoomRoutes);
app.use('/feed-chat', chatFeedRoutes);

// Listen for messages on the Redis channel
redisSub
  .subscribe('feedRoom')
  .then(() => {
    console.log('Subscribed to feedRoom channel');
  })
  .catch((error) => {
    console.error('Failed to subscribe to feedRoom channel:', error);
  });

redisSub.on('message', (channel, message) => {
  // Send the message to all connected clients
  const{ action, data } = JSON.parse(message);
  console.log('action ', action);
  console.log('chatroom ', data.chatRoom);
  console.log('message ', data.message);

  if (data.chatRoom==='feedRoom'){
    webSocketInitializer.websocketClients.forEach((ws, userId) => {
    console.log(userId);
    ws.send(JSON.stringify(data.message));
    });
  } else {
    const room = webSocketInitializer.roomClients.get(data.chatRoom) || [];
    console.log(room);
    room.forEach((id) => {
      webSocketInitializer.websocketClients.get(id)?.send(JSON.stringify(data.message));
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export { webSocketInitializer };
