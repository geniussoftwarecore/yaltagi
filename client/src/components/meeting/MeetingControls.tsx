import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff,
  Settings,
  PhoneOff,
  Users
} from 'lucide-react';

interface MeetingControlsProps {
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
  onOpenSettings: () => void;
  onOpenParticipants: () => void;
  participantCount: number;
}

export function MeetingControls({
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
  onEndCall,
  onOpenSettings,
  onOpenParticipants,
  participantCount
}: MeetingControlsProps) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { isMuted, isCameraOn, isScreenSharing } = useAppStore();

  const handleEndCall = () => {
    onEndCall();
    setLocation('/');
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-[slideInUp_0.6s_ease-out]">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 glass-effect">
        <div className="flex items-center space-x-6 rtl:space-x-reverse">
          {/* Mute/Unmute */}
          <Button
            onClick={onToggleMute}
            variant="ghost"
            size="icon"
            className={`w-14 h-14 rounded-2xl transition-all duration-300 transform hover:scale-110 hover-lift group relative ${
              isMuted 
                ? 'bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25' 
                : 'bg-gradient-to-br from-teal-50 to-cyan-50 text-teal-600 hover:from-teal-100 hover:to-cyan-100 border border-teal-200/50'
            }`}
            title={isMuted ? t('meeting.unmute') : t('meeting.mute')}
          >
            {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            {/* Pulse animation when speaking */}
            {!isMuted && (
              <div className="absolute inset-0 rounded-2xl bg-teal-400/20 animate-ping opacity-0 group-hover:opacity-100"></div>
            )}
          </Button>

          {/* Camera On/Off */}
          <Button
            onClick={onToggleCamera}
            variant="ghost"
            size="icon"
            className={`w-14 h-14 rounded-2xl transition-all duration-300 transform hover:scale-110 hover-lift group relative ${
              !isCameraOn 
                ? 'bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25' 
                : 'bg-gradient-to-br from-teal-50 to-cyan-50 text-teal-600 hover:from-teal-100 hover:to-cyan-100 border border-teal-200/50'
            }`}
            title={t('meeting.camera')}
          >
            {isCameraOn ? <Video className="w-7 h-7" /> : <VideoOff className="w-7 h-7" />}
            <div className="absolute inset-0 rounded-2xl bg-teal-400/20 animate-ping opacity-0 group-hover:opacity-100"></div>
          </Button>

          {/* Screen Share */}
          <Button
            onClick={onToggleScreenShare}
            variant="ghost"
            size="icon"
            className={`w-14 h-14 rounded-2xl transition-all duration-300 transform hover:scale-110 hover-lift group relative ${
              isScreenSharing 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25' 
                : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 hover:from-gray-100 hover:to-gray-200 border border-gray-200/50'
            }`}
            title={t('meeting.screenShare')}
          >
            {isScreenSharing ? <MonitorOff className="w-7 h-7" /> : <Monitor className="w-7 h-7" />}
            <div className="absolute inset-0 rounded-2xl bg-blue-400/20 animate-ping opacity-0 group-hover:opacity-100"></div>
          </Button>

          {/* Participants */}
          <Button
            onClick={onOpenParticipants}
            variant="ghost"
            size="icon"
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600 hover:from-purple-100 hover:to-purple-200 border border-purple-200/50 transition-all duration-300 transform hover:scale-110 hover-lift group relative"
            title={t('meeting.participants')}
          >
            <Users className="w-7 h-7" />
            {participantCount > 0 && (
              <span className="absolute -top-3 -right-3 bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-xs rounded-full w-7 h-7 flex items-center justify-center font-bold shadow-lg animate-pulse">
                {participantCount + 1}
              </span>
            )}
            <div className="absolute inset-0 rounded-2xl bg-purple-400/20 animate-ping opacity-0 group-hover:opacity-100"></div>
          </Button>

          {/* Settings */}
          <Button
            onClick={onOpenSettings}
            variant="ghost"
            size="icon"
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 hover:from-gray-100 hover:to-gray-200 border border-gray-200/50 transition-all duration-300 transform hover:scale-110 hover-lift group relative"
            title={t('meeting.settings')}
          >
            <Settings className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
            <div className="absolute inset-0 rounded-2xl bg-gray-400/20 animate-ping opacity-0 group-hover:opacity-100"></div>
          </Button>

          {/* Animated Divider */}
          <div className="w-px h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-2 animate-pulse" />

          {/* End Call */}
          <Button
            onClick={handleEndCall}
            variant="ghost"
            size="icon"
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25 transition-all duration-300 transform hover:scale-110 hover-lift group relative hover-glow"
            title={t('meeting.endCall')}
          >
            <PhoneOff className="w-7 h-7 group-hover:animate-wiggle" />
            <div className="absolute inset-0 rounded-2xl bg-red-400/30 animate-ping opacity-0 group-hover:opacity-100"></div>
          </Button>
        </div>

        {/* Status Indicator */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}