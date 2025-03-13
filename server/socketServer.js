const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const { mongoUri, dbName, jwtConfig } = require('./config/config');
const jwt = require('jsonwebtoken'); 
const https = require('https');
const fs = require('fs');

const app = express();

let db;

MongoClient.connect(mongoUri)
  .then(client => {
    db = client.db(dbName);
    console.log(`Connected to MongoDB: ${dbName}`);
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    setTimeout(() => {
      console.log('Retrying MongoDB connection...');
      MongoClient.connect(mongoUri).catch(console.error);
    }, 5000);
  });

app.use(cors({
  origin: '*',
  methods: ["GET", "POST"],
  credentials: true
}));

const privateKey = fs.readFileSync('C:/Users/User/key-no-passphrase.pem', 'utf8');
const certificate = fs.readFileSync('C:/Users/User/cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const PORT = process.env.PORT || 3003;
const server = https.createServer(credentials, app).listen(PORT, '0.0.0.0', () => {
  console.log(`HTTPS server running on https://192.168.0.158:${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"],
    credentials: true
  }
});

let users = {};

const saveMessageToDB = async (messageData) => {
  try {
    await db.collection('messages').insertOne(messageData);
    console.log('Message saved to DB:', messageData);
  } catch (err) {
    console.error("Error saving message:", err);
  }
};

io.on('connection', (socket) => {
  console.log('A user connected with socket ID:', socket.id);

  socket.on('join', async (token) => {
    try {
      const decoded = jwt.verify(token, jwtConfig.secret); 
      const username = decoded.id; 
  
      if (!username) {
        return socket.disconnect(true);
      }
  
      socket.username = username;
      users[socket.id] = username;

    } catch (err) {
      console.error('Error decoding token or fetching unread messages:', err);
      socket.disconnect(true); 
    }
  });

  socket.on("read message", async (data) => {
    try {
      const { toUsername } = data;
      const fromUsername = socket.username;
  
      if (!fromUsername || !toUsername) {
        console.error("Missing sender or receiver username.");
        return;
      }
  
      const result = await db.collection("messages").updateMany(
        {
          $or: [
            { from: fromUsername, to: toUsername },
            { from: toUsername, to: fromUsername },
          ],
        },
        { $set: { isRead: true } }
      );
  
      console.log(`Messages marked as read. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    } catch (err) {
      console.error("Error updating message status:", err);
    }
  });
  
  socket.on("get unread count", async (data) => {
    try {
      const { toUsername } = data;
      const fromUsername = socket.username;
  
      if (!fromUsername || !toUsername) {
        console.error("Missing sender or receiver username.");
        return;
      }
  
      const unreadMessages = await db.collection("messages").find(
        {
          from: toUsername, 
          to: fromUsername,
          isRead: false 
        }
      ).toArray();
  
      const unreadCount = unreadMessages.length;
  
      io.to(socket.id).emit("unread count response", { toUsername, unreadCount });
  
      console.log(`Unread messages count: ${unreadCount}`);
    } catch (err) {
      console.error("Error fetching unread message count:", err);
    }
  });

  socket.on('private message', async (data, callback) => {
    const { toUsername, message } = data;
    const fromUsername = socket.username;
  
    if (!toUsername || !message || !fromUsername) {
      return callback({ status: 'error', message: 'Invalid data.' });
    }
  
    const recipientSocketId = Object.keys(users).find(id => users[id] === toUsername);
    const messageData = {
      from: fromUsername,
      to: toUsername,
      message,
      isRead: false,
      timestamp: new Date().toISOString()
    };
  
    try {
      await saveMessageToDB(messageData);
  
      if (recipientSocketId && io.sockets.sockets.get(recipientSocketId)) {
        io.to(recipientSocketId).emit('chat message', messageData);
        io.to(socket.id).emit('chat message', messageData);
        console.log(`Message sent to ${toUsername}`);
      } else {
        io.to(socket.id).emit('chat message', messageData);
        console.log(`Message saved for offline user: ${toUsername}`);
      }
    } catch (error) {
      console.error("Error saving message to DB:", error);
    }
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      delete users[socket.id];
      io.emit('update users', Object.values(users));
      console.log(`${socket.username} has left the chat.`);
    }
  });
});