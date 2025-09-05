import React, { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useWebRTC } from '@/hooks/useWebRTC';
import { VideoGrid } from '@/components/meeting/VideoGrid';
import { MeetingControls } from '@/components/meeting/MeetingControls';
import { Chat } from '@/components/meeting/Chat';
import { ParticipantsList } from '@/components/meeting/ParticipantsList';
import { DeviceSettings } from '@/components/meeting/DeviceSettings';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, MessageCircle, Users, Settings, Mic, MicOff } from 'lucide-react';

export function MeetingRoomPage() {
  const { id: roomId } = useParams();
  const { t } = useTranslation();
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    localStream,
    participants,
    isConnected,
    error,
    startCall,
    endCall,
    toggleMute,
    toggleCamera,
    startScreenShare,
    stopScreenShare
  } = useWebRTC();
  
  const { isMuted, isCameraOn, isScreenSharing } = useAppStore();

  useEffect(() => {
    if (roomId) {
      startCall(roomId);
    }
    
    return () => {
      endCall();
    };
  }, [roomId, startCall, endCall]);

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      await startScreenShare();
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{t('common.error')}</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.href = '/'}>
            {t('nav.home')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 relative">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Y</span>
              </div>
              <span className="font-semibold text-gray-800">Yaltaqi</span>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-sm text-gray-600">
                  {isConnected ? '5 min' : 'Connecting...'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-gray-500">
              <span className="text-sm">الغرف الفرعية</span>
              <span className="text-sm">المراسلة</span>
              <span className="text-sm">التسجيل</span>
              <div className="w-6 h-1 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-screen pt-20">
        {/* Video Grid */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-3xl shadow-xl p-6 h-full">
            <VideoGrid 
              localStream={localStream} 
              participants={participants} 
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 p-6 pl-0">
          <div className="bg-white rounded-3xl shadow-xl h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800 text-right">المشاركون</h3>
              <p className="text-sm text-gray-500 text-right mt-1">
                {participants.length + 1} مشارك
              </p>
            </div>

            {/* Participants List */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Host */}
              <div className="flex items-center space-x-3 mb-4 p-3 bg-teal-50 rounded-xl">
                <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">أ</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">أحمد محمد</p>
                  <p className="text-xs text-teal-600">المضيف</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Mic className="w-4 h-4 text-teal-500" />
                </div>
              </div>

              {/* Other participants */}
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center space-x-3 mb-3 p-3 hover:bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {participant.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{participant.name}</p>
                    <p className="text-xs text-gray-500">مشارك</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Mic className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}

              {/* You */}
              <div className="flex items-center space-x-3 mb-3 p-3 bg-blue-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">أ</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">أنت</p>
                  <p className="text-xs text-blue-600">مشارك</p>
                </div>
                <div className="flex items-center space-x-1">
                  {isMuted ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4 text-blue-500" />}
                </div>
              </div>
            </div>

            {/* Sidebar Actions */}
            <div className="p-6 border-t border-gray-200">
              <Button
                onClick={() => setShowParticipants(!showParticipants)}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl py-3"
              >
                دعوة الآخرين
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Controls */}
      <MeetingControls
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
        onToggleScreenShare={handleToggleScreenShare}
        onEndCall={endCall}
        onOpenSettings={() => setShowSettings(!showSettings)}
        onOpenParticipants={() => setShowParticipants(!showParticipants)}
        participantCount={participants.length}
      />
    </div>
  );
}