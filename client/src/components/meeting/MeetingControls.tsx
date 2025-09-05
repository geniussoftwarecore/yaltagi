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
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 p-4">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          {/* Mute/Unmute */}
          <Button
            onClick={onToggleMute}
            variant={isMuted ? "destructive" : "secondary"}
            size="icon"
            className="w-12 h-12 rounded-xl"
            title={isMuted ? t('meeting.unmute') : t('meeting.mute')}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>

          {/* Camera On/Off */}
          <Button
            onClick={onToggleCamera}
            variant={!isCameraOn ? "destructive" : "secondary"}
            size="icon"
            className="w-12 h-12 rounded-xl"
            title={t('meeting.camera')}
          >
            {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </Button>

          {/* Screen Share */}
          <Button
            onClick={onToggleScreenShare}
            variant={isScreenSharing ? "primary" : "secondary"}
            size="icon"
            className="w-12 h-12 rounded-xl"
            title={t('meeting.screenShare')}
          >
            {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
          </Button>

          {/* Participants */}
          <Button
            onClick={onOpenParticipants}
            variant="secondary"
            size="icon"
            className="w-12 h-12 rounded-xl relative"
            title={t('meeting.participants')}
          >
            <Users className="w-6 h-6" />
            {participantCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary-blue text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {participantCount}
              </span>
            )}
          </Button>

          {/* Settings */}
          <Button
            onClick={onOpenSettings}
            variant="secondary"
            size="icon"
            className="w-12 h-12 rounded-xl"
            title={t('meeting.settings')}
          >
            <Settings className="w-6 h-6" />
          </Button>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-300 mx-2" />

          {/* End Call */}
          <Button
            onClick={handleEndCall}
            variant="destructive"
            size="icon"
            className="w-12 h-12 rounded-xl bg-red-500 hover:bg-red-600"
            title={t('meeting.endCall')}
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}