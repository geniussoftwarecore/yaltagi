import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  async (username, password, done) => {
    // TODO: Implement user authentication with database
    return done(null, false, { message: 'Authentication not implemented yet' });
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  // TODO: Implement user deserialization with database
  done(null, null);
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received message:', data);
      
      // Broadcast to all connected clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === client.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket signaling server for WebRTC
interface Room {
  id: string;
  participants: Map<string, { id: string; username: string; ws: any }>;
}

const rooms = new Map<string, Room>();

wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection established');
  let currentRoom: string | null = null;
  let participantId: string | null = null;
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received message:', data.type);
      
      switch (data.type) {
        case 'join':
          handleJoinRoom(ws, data);
          break;
        case 'offer':
          handleOffer(ws, data);
          break;
        case 'answer':
          handleAnswer(ws, data);
          break;
        case 'candidate':
          handleCandidate(ws, data);
          break;
        case 'chat-message':
          handleChatMessage(ws, data);
          break;
        case 'leave':
          handleLeaveRoom(ws);
          break;
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
    if (currentRoom && participantId) {
      handleLeaveRoom(ws);
    }
  });

  function handleJoinRoom(ws: any, data: any) {
    const { roomId, username } = data;
    currentRoom = roomId;
    participantId = Date.now().toString();
    
    // Create room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        participants: new Map()
      });
    }
    
    const room = rooms.get(roomId)!;
    room.participants.set(participantId, { id: participantId, username, ws });
    
    // Notify existing participants about new peer
    room.participants.forEach((participant, id) => {
      if (id !== participantId) {
        participant.ws.send(JSON.stringify({
          type: 'peer-joined',
          peerId: participantId,
          username
        }));
        
        // Notify new participant about existing peer
        ws.send(JSON.stringify({
          type: 'peer-joined',
          peerId: id,
          username: participant.username
        }));
      }
    });
    
    console.log(`Participant ${username} joined room ${roomId}`);
  }

  function handleOffer(ws: any, data: any) {
    const { offer, peerId } = data;
    if (!currentRoom) return;
    
    const room = rooms.get(currentRoom);
    if (!room) return;
    
    const targetParticipant = room.participants.get(peerId);
    if (targetParticipant) {
      targetParticipant.ws.send(JSON.stringify({
        type: 'offer',
        offer,
        peerId: participantId
      }));
    }
  }

  function handleAnswer(ws: any, data: any) {
    const { answer, peerId } = data;
    if (!currentRoom) return;
    
    const room = rooms.get(currentRoom);
    if (!room) return;
    
    const targetParticipant = room.participants.get(peerId);
    if (targetParticipant) {
      targetParticipant.ws.send(JSON.stringify({
        type: 'answer',
        answer,
        peerId: participantId
      }));
    }
  }

  function handleCandidate(ws: any, data: any) {
    const { candidate, peerId } = data;
    if (!currentRoom) return;
    
    const room = rooms.get(currentRoom);
    if (!room) return;
    
    const targetParticipant = room.participants.get(peerId);
    if (targetParticipant) {
      targetParticipant.ws.send(JSON.stringify({
        type: 'candidate',
        candidate,
        peerId: participantId
      }));
    }
  }

  function handleChatMessage(ws: any, data: any) {
    const { roomId, sender, message, timestamp } = data;
    if (!rooms.has(roomId)) return;
    
    const room = rooms.get(roomId)!;
    
    // Broadcast message to all participants in the room
    room.participants.forEach((participant) => {
      participant.ws.send(JSON.stringify({
        type: 'chat-message',
        sender,
        message,
        timestamp
      }));
    });
  }

  function handleLeaveRoom(ws: any) {
    if (!currentRoom || !participantId) return;
    
    const room = rooms.get(currentRoom);
    if (!room) return;
    
    // Remove participant from room
    room.participants.delete(participantId);
    
    // Notify other participants
    room.participants.forEach((participant) => {
      participant.ws.send(JSON.stringify({
        type: 'peer-left',
        peerId: participantId
      }));
    });
    
    // Clean up empty rooms
    if (room.participants.size === 0) {
      rooms.delete(currentRoom);
    }
    
    console.log(`Participant ${participantId} left room ${currentRoom}`);
    currentRoom = null;
    participantId = null;
  }
});

// Serve static app - simplified for demo
app.get('*', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>يلتقي - Yaltaqi Video Conferencing</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cairo:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          [dir="rtl"] { font-family: 'Cairo', 'Inter', sans-serif; }
          .bg-sky-blue { background-color: #CFEAFF; }
          .bg-primary-blue { background-color: #1E3A8A; }
          .bg-green-cta { background-color: #22C55E; }
          .text-primary-blue { color: #1E3A8A; }
          .text-green-cta { color: #22C55E; }
        </style>
      </head>
      <body class="bg-gradient-to-br from-sky-blue/30 via-white to-green-cta/20">
        <!-- Navigation -->
        <nav class="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm">
          <div class="container mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
              <div class="flex items-center space-x-3 rtl:space-x-reverse">
                <div class="w-10 h-10 bg-gradient-to-br from-primary-blue to-green-cta rounded-2xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <span class="text-2xl font-bold text-primary-blue">يلتقي</span>
              </div>
              <div class="flex items-center space-x-4 rtl:space-x-reverse">
                <button class="text-gray-700 hover:text-primary-blue px-4 py-2 rounded-xl transition-colors">الرئيسية</button>
                <button class="text-gray-700 hover:text-primary-blue px-4 py-2 rounded-xl transition-colors">الميزات</button>
                <button onclick="window.location.href='/create'" class="bg-green-cta hover:bg-green-600 text-white font-medium px-6 py-2 rounded-2xl transition-all shadow-lg hover:shadow-xl">
                  ابدأ اجتماعاً
                </button>
              </div>
            </div>
          </div>
        </nav>

        <!-- Hero Section -->
        <main class="pt-24 pb-16">
          <div class="container mx-auto px-4 text-center">
            <div class="max-w-4xl mx-auto">
              <h1 class="text-5xl md:text-7xl font-bold text-primary-blue mb-6 leading-tight">
                تواصل، تعاون، أبدع
              </h1>
              <p class="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                مؤتمرات فيديو احترافية بتصميم عربي متطور للفرق الحديثة
              </p>
              
              <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button onclick="createMeeting()" class="bg-green-cta hover:bg-green-600 text-white text-lg font-medium px-8 py-4 rounded-2xl transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105">
                  ابدأ اجتماعاً مجانياً
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 inline ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                
                <button onclick="joinMeeting()" class="border-2 border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white text-lg font-medium px-8 py-4 rounded-2xl transition-all">
                  انضم لاجتماع
                </button>
              </div>
            </div>
          </div>

          <!-- Features Section -->
          <div class="py-20 bg-white mt-16">
            <div class="container mx-auto px-4">
              <div class="text-center mb-16">
                <h2 class="text-4xl md:text-5xl font-bold text-primary-blue mb-4">
                  كل ما تحتاجه للتعاون السلس
                </h2>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div class="text-center p-6 rounded-2xl border shadow-lg hover:shadow-xl transition-all">
                  <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold mb-2">فيديو وصوت عالي الدقة</h3>
                  <p class="text-gray-600">مكالمات فيديو واضحة تماماً مع جودة صوت احترافية</p>
                </div>

                <div class="text-center p-6 rounded-2xl border shadow-lg hover:shadow-xl transition-all">
                  <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold mb-2">مشاركة الشاشة</h3>
                  <p class="text-gray-600">شارك شاشتك والعروض التقديمية والتطبيقات فوراً</p>
                </div>

                <div class="text-center p-6 rounded-2xl border shadow-lg hover:shadow-xl transition-all">
                  <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold mb-2">دردشة فورية</h3>
                  <p class="text-gray-600">رسائل نصية مع مشاركة الملفات ودعم الرموز التعبيرية</p>
                </div>

                <div class="text-center p-6 rounded-2xl border shadow-lg hover:shadow-xl transition-all">
                  <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold mb-2">غرف فرعية</h3>
                  <p class="text-gray-600">أنشئ مساحات نقاش منفصلة للمجموعات الصغيرة</p>
                </div>
              </div>
            </div>
          </div>

          <!-- CTA Section -->
          <div class="py-20 bg-gradient-to-r from-primary-blue to-green-cta">
            <div class="container mx-auto px-4 text-center">
              <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
                ابدأ اجتماعاً مجانياً الآن
              </h2>
              <p class="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                انضم إلى آلاف الفرق التي تثق في يلتقي للتواصل والتعاون
              </p>
              
              <button onclick="createMeeting()" class="bg-white text-primary-blue hover:bg-gray-100 text-lg font-medium px-8 py-4 rounded-2xl transition-all shadow-xl hover:shadow-2xl">
                ابدأ الآن - مجاناً
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 inline ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>
        </main>

        <script>
          function createMeeting() {
            const roomId = Math.random().toString(36).substr(2, 9);
            window.location.href = '/room/' + roomId;
          }
          
          function joinMeeting() {
            const roomId = prompt('أدخل رمز الغرفة:');
            if (roomId) {
              window.location.href = '/room/' + roomId;
            }
          }
        </script>
      </body>
    </html>
  `);
});

const PORT = Number(process.env.PORT) || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('✓ Migration Complete - Yaltaqi is ready!');
});