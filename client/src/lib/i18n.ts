import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      'nav.home': 'Home',
      'nav.features': 'Features',
      'nav.pricing': 'Pricing',
      'nav.startMeeting': 'Start Meeting',
      'nav.language': 'Language',
      
      // Landing Page
      'landing.hero.title': 'Connect, Collaborate, Create',
      'landing.hero.subtitle': 'Professional video conferencing with Arabic-first design for modern teams',
      'landing.hero.cta': 'Start Free Meeting',
      'landing.hero.joinMeeting': 'Join Meeting',
      
      // Features
      'features.title': 'Everything you need for seamless collaboration',
      'features.hdVideo.title': 'HD Video & Audio',
      'features.hdVideo.description': 'Crystal clear video calls with professional audio quality',
      'features.screenShare.title': 'Screen Sharing',
      'features.screenShare.description': 'Share your screen, presentations, and applications instantly',
      'features.chat.title': 'Real-time Chat',
      'features.chat.description': 'Text messaging with file sharing and emoji support',
      'features.breakout.title': 'Breakout Rooms',
      'features.breakout.description': 'Create separate discussion spaces for small groups',
      
      // How it Works
      'howItWorks.title': 'Get started in three simple steps',
      'howItWorks.step1.title': 'Create or Join',
      'howItWorks.step1.description': 'Start a new meeting or join existing one with a room code',
      'howItWorks.step2.title': 'Setup Devices',
      'howItWorks.step2.description': 'Test your camera, microphone, and speakers before joining',
      'howItWorks.step3.title': 'Start Collaborating',
      'howItWorks.step3.description': 'Connect with your team and get work done efficiently',
      
      // Meeting Room
      'meeting.participants': 'Participants',
      'meeting.chat': 'Chat',
      'meeting.mute': 'Mute',
      'meeting.unmute': 'Unmute',
      'meeting.camera': 'Camera',
      'meeting.screenShare': 'Screen Share',
      'meeting.settings': 'Settings',
      'meeting.leave': 'Leave Meeting',
      'meeting.endCall': 'End Call',
      
      // Join/Create
      'join.title': 'Join a Meeting',
      'join.roomCode': 'Room Code',
      'join.roomCodePlaceholder': 'Enter room code',
      'join.displayName': 'Your Name',
      'join.displayNamePlaceholder': 'Enter your name',
      'join.joinButton': 'Join Meeting',
      
      'create.title': 'Start New Meeting',
      'create.meetingName': 'Meeting Name',
      'create.meetingNamePlaceholder': 'Enter meeting name',
      'create.startButton': 'Start Meeting',
      
      // Device Settings
      'devices.title': 'Device Settings',
      'devices.camera': 'Camera',
      'devices.microphone': 'Microphone',
      'devices.speakers': 'Speakers',
      'devices.testAudio': 'Test Audio',
      'devices.preview': 'Camera Preview',
      
      // Chat
      'chat.placeholder': 'Type your message...',
      'chat.send': 'Send',
      'chat.noMessages': 'No messages yet',
      
      // Common
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.close': 'Close',
    }
  },
  ar: {
    translation: {
      // Navigation
      'nav.home': 'الرئيسية',
      'nav.features': 'الميزات',
      'nav.pricing': 'التسعير',
      'nav.startMeeting': 'بدء اجتماع',
      'nav.language': 'اللغة',
      
      // Landing Page
      'landing.hero.title': 'تواصل، تعاون، أبدع',
      'landing.hero.subtitle': 'مؤتمرات فيديو احترافية بتصميم عربي متطور للفرق الحديثة',
      'landing.hero.cta': 'ابدأ اجتماعاً مجانياً',
      'landing.hero.joinMeeting': 'انضم لاجتماع',
      
      // Features
      'features.title': 'كل ما تحتاجه للتعاون السلس',
      'features.hdVideo.title': 'فيديو وصوت عالي الدقة',
      'features.hdVideo.description': 'مكالمات فيديو واضحة تماماً مع جودة صوت احترافية',
      'features.screenShare.title': 'مشاركة الشاشة',
      'features.screenShare.description': 'شارك شاشتك والعروض التقديمية والتطبيقات فوراً',
      'features.chat.title': 'دردشة فورية',
      'features.chat.description': 'رسائل نصية مع مشاركة الملفات ودعم الرموز التعبيرية',
      'features.breakout.title': 'غرف فرعية',
      'features.breakout.description': 'أنشئ مساحات نقاش منفصلة للمجموعات الصغيرة',
      
      // How it Works
      'howItWorks.title': 'ابدأ في ثلاث خطوات بسيطة',
      'howItWorks.step1.title': 'أنشئ أو انضم',
      'howItWorks.step1.description': 'ابدأ اجتماعاً جديداً أو انضم لموجود برمز الغرفة',
      'howItWorks.step2.title': 'اضبط الأجهزة',
      'howItWorks.step2.description': 'اختبر الكاميرا والميكروفون والسماعات قبل الانضمام',
      'howItWorks.step3.title': 'ابدأ التعاون',
      'howItWorks.step3.description': 'تواصل مع فريقك وأنجز العمل بكفاءة',
      
      // Meeting Room
      'meeting.participants': 'المشاركون',
      'meeting.chat': 'الدردشة',
      'meeting.mute': 'كتم الصوت',
      'meeting.unmute': 'تشغيل الصوت',
      'meeting.camera': 'الكاميرا',
      'meeting.screenShare': 'مشاركة الشاشة',
      'meeting.settings': 'الإعدادات',
      'meeting.leave': 'مغادرة الاجتماع',
      'meeting.endCall': 'إنهاء المكالمة',
      
      // Join/Create
      'join.title': 'انضم لاجتماع',
      'join.roomCode': 'رمز الغرفة',
      'join.roomCodePlaceholder': 'أدخل رمز الغرفة',
      'join.displayName': 'اسمك',
      'join.displayNamePlaceholder': 'أدخل اسمك',
      'join.joinButton': 'انضم للاجتماع',
      
      'create.title': 'ابدأ اجتماعاً جديداً',
      'create.meetingName': 'اسم الاجتماع',
      'create.meetingNamePlaceholder': 'أدخل اسم الاجتماع',
      'create.startButton': 'ابدأ الاجتماع',
      
      // Device Settings
      'devices.title': 'إعدادات الأجهزة',
      'devices.camera': 'الكاميرا',
      'devices.microphone': 'الميكروفون',
      'devices.speakers': 'السماعات',
      'devices.testAudio': 'اختبار الصوت',
      'devices.preview': 'معاينة الكاميرا',
      
      // Chat
      'chat.placeholder': 'اكتب رسالتك...',
      'chat.send': 'إرسال',
      'chat.noMessages': 'لا توجد رسائل بعد',
      
      // Common
      'common.loading': 'جاري التحميل...',
      'common.error': 'خطأ',
      'common.success': 'نجح',
      'common.cancel': 'إلغاء',
      'common.save': 'حفظ',
      'common.close': 'إغلاق',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar', // Default to Arabic
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;