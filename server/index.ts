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

// Handle different routes
app.get('/', (req, res) => {
  res.send(getHomePage());
});

app.get('/join', (req, res) => {
  res.send(getJoinPage());
});

app.get('/room/:id', (req, res) => {
  res.send(getMeetingRoomPage(req.params.id));
});

app.get('*', (req, res) => {
  res.send(getHomePage());
});

// Page templates
function getHomePage() {
  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>يلتقي - منصة المؤتمرات المرئية</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cairo:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Cairo', 'Inter', sans-serif; }
          .bg-yaltaqi-blue { background-color: #2563eb; }
          .text-yaltaqi-blue { color: #2563eb; }
          .hover\\:bg-yaltaqi-blue:hover { background-color: #2563eb; }
          .border-yaltaqi-blue { border-color: #2563eb; }
        </style>
      </head>
      <body class="bg-gray-50">
        ${getNavbar()}
        
        <!-- Hero Section -->
        <main class="pt-20 pb-16">
          <div class="max-w-7xl mx-auto px-4 text-center">
            <div class="max-w-4xl mx-auto">
              <h1 class="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                تواصل، تعاون، أبدع
              </h1>
              <p class="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                مؤتمرات فيديو احترافية بتصميم عربي متطور للفرق الحديثة
              </p>
              
              <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button onclick="createMeeting()" class="bg-yaltaqi-blue hover:bg-blue-700 text-white text-lg font-medium px-8 py-4 rounded-lg transition-all shadow-lg hover:shadow-xl">
                  ابدأ اجتماعاً مجانياً
                </button>
                
                <button onclick="window.location.href='/join'" class="border-2 border-yaltaqi-blue text-yaltaqi-blue hover:bg-yaltaqi-blue hover:text-white text-lg font-medium px-8 py-4 rounded-lg transition-all">
                  انضم لاجتماع
                </button>
              </div>
            </div>
          </div>

          <!-- Features Section -->
          <div class="py-20 bg-white mt-16">
            <div class="max-w-7xl mx-auto px-4">
              <div class="text-center mb-16">
                <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  كل ما تحتاجه للتعاون السلس
                </h2>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div class="text-center p-6">
                  <div class="w-16 h-16 mx-auto rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold mb-2">فيديو وصوت عالي الدقة</h3>
                  <p class="text-gray-600">مكالمات فيديو واضحة تماماً مع جودة صوت احترافية</p>
                </div>

                <div class="text-center p-6">
                  <div class="w-16 h-16 mx-auto rounded-lg bg-green-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold mb-2">مشاركة الشاشة</h3>
                  <p class="text-gray-600">شارك شاشتك والعروض التقديمية والتطبيقات فوراً</p>
                </div>

                <div class="text-center p-6">
                  <div class="w-16 h-16 mx-auto rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold mb-2">دردشة فورية</h3>
                  <p class="text-gray-600">رسائل نصية مع مشاركة الملفات ودعم الرموز التعبيرية</p>
                </div>

                <div class="text-center p-6">
                  <div class="w-16 h-16 mx-auto rounded-lg bg-orange-100 flex items-center justify-center mb-4">
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
        </main>

        ${getFooter()}

        <script>
          function createMeeting() {
            const roomId = Math.random().toString(36).substr(2, 9);
            window.location.href = '/room/' + roomId;
          }
        </script>
      </body>
    </html>
  `;
}

function getJoinPage() {
  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>انضم للاجتماع - يلتقي</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cairo:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Cairo', 'Inter', sans-serif; }
          .bg-yaltaqi-blue { background-color: #2563eb; }
          .text-yaltaqi-blue { color: #2563eb; }
          .hover\\:bg-yaltaqi-blue:hover { background-color: #2563eb; }
          .border-yaltaqi-blue { border-color: #2563eb; }
          .focus\\:border-yaltaqi-blue:focus { border-color: #2563eb; }
          .focus\\:ring-yaltaqi-blue:focus { --tw-ring-color: rgb(37 99 235 / 0.5); }
        </style>
      </head>
      <body class="bg-gray-50 min-h-screen">
        ${getNavbar()}
        
        <!-- Join Meeting Section -->
        <main class="pt-20 pb-16 flex items-center justify-center min-h-screen">
          <div class="w-full max-w-md">
            <div class="bg-white rounded-lg shadow-lg p-8">
              <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">انضم للاجتماع</h1>
                <p class="text-gray-600">معرف الاجتماع أو رابط شخصي</p>
              </div>
              
              <form onsubmit="joinMeeting(event)" class="space-y-6">
                <div>
                  <input 
                    type="text" 
                    id="meetingId" 
                    placeholder="أدخل معرف الاجتماع أو الرابط الشخصي" 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yaltaqi-blue focus:border-yaltaqi-blue text-center text-lg"
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  class="w-full bg-gray-400 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-500 transition-colors"
                  id="joinButton"
                  disabled
                >
                  انضم
                </button>
              </form>
              
              <div class="mt-8 text-center">
                <p class="text-sm text-gray-500 mb-4">
                  بالنقر على "انضم"، فإنك توافق على 
                  <a href="#" class="text-yaltaqi-blue hover:underline">شروط الخدمة</a>
                  و
                  <a href="#" class="text-yaltaqi-blue hover:underline">بيان الخصوصية</a>
                </p>
                
                <a href="#" class="text-yaltaqi-blue hover:underline text-sm">
                  انضم للاجتماع من نظام H.323/SIP room
                </a>
              </div>
            </div>
            
            <!-- Additional Options -->
            <div class="mt-6 text-center">
              <p class="text-gray-600 mb-4">ليس لديك معرف اجتماع؟</p>
              <button 
                onclick="window.location.href='/'"
                class="text-yaltaqi-blue hover:underline font-medium"
              >
                ابدأ اجتماعاً فورياً
              </button>
            </div>
          </div>
        </main>

        <script>
          const meetingIdInput = document.getElementById('meetingId');
          const joinButton = document.getElementById('joinButton');
          
          meetingIdInput.addEventListener('input', function() {
            if (this.value.trim()) {
              joinButton.disabled = false;
              joinButton.classList.remove('bg-gray-400', 'hover:bg-gray-500');
              joinButton.classList.add('bg-yaltaqi-blue', 'hover:bg-blue-700');
            } else {
              joinButton.disabled = true;
              joinButton.classList.add('bg-gray-400', 'hover:bg-gray-500');
              joinButton.classList.remove('bg-yaltaqi-blue', 'hover:bg-blue-700');
            }
          });
          
          function joinMeeting(event) {
            event.preventDefault();
            const meetingId = meetingIdInput.value.trim();
            if (meetingId) {
              // Extract room ID from URL or use as is
              const roomId = meetingId.includes('/room/') ? 
                meetingId.split('/room/')[1] : meetingId;
              window.location.href = '/room/' + roomId;
            }
          }
        </script>
      </body>
    </html>
  `;
}

function getMeetingRoomPage(roomId) {
  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>غرفة الاجتماع ${roomId} - يلتقي</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cairo:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Cairo', 'Inter', sans-serif; }
          .bg-yaltaqi-blue { background-color: #2563eb; }
          .text-yaltaqi-blue { color: #2563eb; }
        </style>
      </head>
      <body class="bg-gray-900 h-screen overflow-hidden">
        <!-- Meeting Room Interface -->
        <div class="h-full flex flex-col">
          <!-- Header -->
          <div class="bg-gray-800 p-4 flex items-center justify-between">
            <div class="flex items-center space-x-4 rtl:space-x-reverse">
              <div class="w-8 h-8 bg-yaltaqi-blue rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <span class="text-white font-medium">غرفة الاجتماع: ${roomId}</span>
            </div>
            
            <div class="flex items-center space-x-4 rtl:space-x-reverse">
              <span class="text-green-400 text-sm">• متصل</span>
              <button onclick="window.location.href='/'" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                مغادرة الاجتماع
              </button>
            </div>
          </div>
          
          <!-- Video Grid -->
          <div class="flex-1 p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              <!-- Local Video -->
              <div class="bg-gray-800 rounded-lg relative overflow-hidden">
                <video 
                  id="localVideo" 
                  autoplay 
                  muted 
                  class="w-full h-full object-cover"
                  style="background: linear-gradient(45deg, #374151, #4B5563);"
                ></video>
                <div class="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  أنت
                </div>
              </div>
              
              <!-- Remote Video -->
              <div class="bg-gray-800 rounded-lg relative overflow-hidden">
                <video 
                  id="remoteVideo" 
                  autoplay 
                  class="w-full h-full object-cover"
                  style="background: linear-gradient(45deg, #374151, #4B5563);"
                ></video>
                <div class="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  في انتظار المشارك...
                </div>
              </div>
            </div>
          </div>
          
          <!-- Controls -->
          <div class="bg-gray-800 p-4">
            <div class="flex items-center justify-center space-x-6 rtl:space-x-reverse">
              <button 
                id="muteButton" 
                onclick="toggleMute()" 
                class="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full transition-colors"
                title="كتم/إلغاء كتم الصوت"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              
              <button 
                id="videoButton" 
                onclick="toggleVideo()" 
                class="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full transition-colors"
                title="تشغيل/إيقاف الكاميرا"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              
              <button 
                id="shareButton" 
                onclick="toggleScreenShare()" 
                class="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full transition-colors"
                title="مشاركة الشاشة"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
              
              <button 
                onclick="window.location.href='/'"
                class="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-colors"
                title="مغادرة الاجتماع"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <script>
          let isAudioMuted = false;
          let isVideoEnabled = true;
          let isScreenSharing = false;
          let localStream = null;
          
          // Initialize media
          async function initializeMedia() {
            try {
              localStream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
              });
              document.getElementById('localVideo').srcObject = localStream;
            } catch (error) {
              console.error('Error accessing media devices:', error);
            }
          }
          
          function toggleMute() {
            if (localStream) {
              const audioTrack = localStream.getAudioTracks()[0];
              if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                isAudioMuted = !audioTrack.enabled;
                
                const muteButton = document.getElementById('muteButton');
                if (isAudioMuted) {
                  muteButton.classList.add('bg-red-600');
                  muteButton.classList.remove('bg-gray-700');
                } else {
                  muteButton.classList.remove('bg-red-600');
                  muteButton.classList.add('bg-gray-700');
                }
              }
            }
          }
          
          function toggleVideo() {
            if (localStream) {
              const videoTrack = localStream.getVideoTracks()[0];
              if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                isVideoEnabled = videoTrack.enabled;
                
                const videoButton = document.getElementById('videoButton');
                if (!isVideoEnabled) {
                  videoButton.classList.add('bg-red-600');
                  videoButton.classList.remove('bg-gray-700');
                } else {
                  videoButton.classList.remove('bg-red-600');
                  videoButton.classList.add('bg-gray-700');
                }
              }
            }
          }
          
          async function toggleScreenShare() {
            try {
              if (!isScreenSharing) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
                  video: true 
                });
                document.getElementById('localVideo').srcObject = screenStream;
                isScreenSharing = true;
                
                const shareButton = document.getElementById('shareButton');
                shareButton.classList.add('bg-yaltaqi-blue');
                shareButton.classList.remove('bg-gray-700');
                
                screenStream.getVideoTracks()[0].onended = () => {
                  isScreenSharing = false;
                  shareButton.classList.remove('bg-yaltaqi-blue');
                  shareButton.classList.add('bg-gray-700');
                  initializeMedia();
                };
              } else {
                initializeMedia();
                isScreenSharing = false;
                
                const shareButton = document.getElementById('shareButton');
                shareButton.classList.remove('bg-yaltaqi-blue');
                shareButton.classList.add('bg-gray-700');
              }
            } catch (error) {
              console.error('Error sharing screen:', error);
            }
          }
          
          // Initialize on page load
          initializeMedia();
        </script>
      </body>
    </html>
  `;
}

function getNavbar() {
  return `
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-3 rtl:space-x-reverse">
            <div class="w-10 h-10 bg-yaltaqi-blue rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span class="text-2xl font-bold text-gray-900">يلتقي</span>
          </div>
          <div class="flex items-center space-x-4 rtl:space-x-reverse">
            <a href="#" class="text-gray-700 hover:text-yaltaqi-blue px-3 py-2 text-sm font-medium">الدعم</a>
            <button class="bg-yaltaqi-blue hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors">
              اشترك مجاناً
            </button>
          </div>
        </div>
      </div>
    </nav>
  `;
}

function getFooter() {
  return `
    <footer class="bg-white border-t border-gray-200 py-8">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <p class="text-gray-500 text-sm">
          © 2025 يلتقي للاتصالات، جميع الحقوق محفوظة. 
          <a href="#" class="text-yaltaqi-blue hover:underline">سياسة الخصوصية</a>
          و
          <a href="#" class="text-yaltaqi-blue hover:underline">الشروط القانونية</a>
        </p>
      </div>
    </footer>
  `;
}

const PORT = Number(process.env.PORT) || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('✓ Migration Complete - Yaltaqi is ready!');
});