import { toast } from 'sonner';
import { Wifi, WifiOff, Signal, AlertTriangle, CheckCircle } from 'lucide-react';

export function showConnectionSuccess(message?: string) {
  toast.success('تم الاتصال بنجاح', {
    description: message || 'أنت الآن متصل بالاجتماع',
    duration: 3000,
    icon: <CheckCircle className="w-5 h-5" />
  });
}

export function showConnectionLost(message?: string) {
  toast.error('انقطع الاتصال', {
    description: message || 'فقدت الاتصال بالاجتماع، جار المحاولة مرة أخرى...',
    duration: Infinity, // Keep until manually dismissed
    icon: <WifiOff className="w-5 h-5" />
  });
}

export function showReconnecting() {
  toast.loading('يعيد الاتصال...', {
    description: 'جار محاولة إعادة الاتصال بالاجتماع',
    duration: 2000,
    icon: <Wifi className="w-5 h-5 animate-pulse" />
  });
}

export function showReconnected() {
  toast.success('تم إعادة الاتصال', {
    description: 'عاد الاتصال بالاجتماع بنجاح',
    duration: 3000,
    icon: <Wifi className="w-5 h-5" />
  });
}

export function showQualityChange(quality: string) {
  const qualityText = quality === 'excellent' ? 'ممتازة' :
                      quality === 'good' ? 'جيدة' :
                      quality === 'fair' ? 'مقبولة' : 'ضعيفة';
  
  const qualityColor = quality === 'excellent' ? 'text-green-500' :
                       quality === 'good' ? 'text-blue-500' :
                       quality === 'fair' ? 'text-yellow-500' : 'text-red-500';
  
  toast.info('تغيرت جودة الاتصال', {
    description: `جودة الشبكة الحالية: ${qualityText}`,
    duration: 2000,
    icon: <Signal className={`w-5 h-5 ${qualityColor}`} />
  });
}

export function showDeviceChange(device: string, type: 'camera' | 'microphone') {
  const deviceType = type === 'camera' ? 'الكاميرا' : 'الميكروفون';
  
  toast.info(`تم تغيير ${deviceType}`, {
    description: `تم تغيير ${deviceType} إلى: ${device}`,
    duration: 2000
  });
}

export function showPermissionDenied(type: 'camera' | 'microphone' | 'screen') {
  const typeText = type === 'camera' ? 'الكاميرا' :
                   type === 'microphone' ? 'الميكروفون' : 'مشاركة الشاشة';
  
  toast.error(`تم رفض إذن ${typeText}`, {
    description: `يرجى منح الإذن لاستخدام ${typeText}`,
    duration: 5000,
    icon: <AlertTriangle className="w-5 h-5" />
  });
}

export function showMeetingJoined(participantName: string) {
  toast.success('انضم مشارك جديد', {
    description: `انضم ${participantName} إلى الاجتماع`,
    duration: 2000
  });
}

export function showMeetingLeft(participantName: string) {
  toast.info('غادر مشارك', {
    description: `غادر ${participantName} الاجتماع`,
    duration: 2000
  });
}

export function showRecordingStarted() {
  toast.success('بدأ التسجيل', {
    description: 'يتم الآن تسجيل الاجتماع',
    duration: 3000
  });
}

export function showRecordingStopped() {
  toast.info('توقف التسجيل', {
    description: 'تم إيقاف تسجيل الاجتماع',
    duration: 3000
  });
}

export function showScreenShareStarted() {
  toast.success('بدأت مشاركة الشاشة', {
    description: 'يتم الآن مشاركة شاشتك مع المشاركين',
    duration: 2000
  });
}

export function showScreenShareStopped() {
  toast.info('توقفت مشاركة الشاشة', {
    description: 'تم إيقاف مشاركة الشاشة',
    duration: 2000
  });
}