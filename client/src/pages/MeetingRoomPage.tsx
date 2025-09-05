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
import { X, MessageCircle, Users, Settings } from 'lucide-react';

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

  useEffect(() => {
    if (roomId) {
      startCall(roomId);
    }
    
    return () => {
      endCall();
    };
  }, [roomId, startCall, endCall]);

  const handleToggleScreenShare = async () => {
    const { isScreenSharing } = await import('@/store/useAppStore');
    const store = useAppStore.getState();
    
    if (store.isScreenSharing) {
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
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-40 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <h1 className="text-xl font-semibold">
                {t('meeting.room')} {roomId}
              </h1>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-sm text-gray-300">
                  {isConnected ? t('meeting.connected') : t('meeting.connecting')}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {/* Chat Toggle */}
              <Button
                onClick={() => setShowChat(!showChat)}
                variant={showChat ? "primary" : "secondary"}
                size="icon"
                className="w-10 h-10"
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
              
              {/* Participants Toggle */}
              <Button
                onClick={() => setShowParticipants(!showParticipants)}
                variant={showParticipants ? "primary" : "secondary"}
                size="icon"
                className="w-10 h-10 relative"
              >
                <Users className="w-5 h-5" />
                {participants.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {participants.length + 1}
                  </span>
                )}
              </Button>
              
              {/* Settings Toggle */}
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant={showSettings ? "primary" : "secondary"}
                size="icon"
                className="w-10 h-10"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-screen pt-20">
        {/* Video Grid */}
        <div className="flex-1 flex flex-col">
          <VideoGrid 
            localStream={localStream} 
            participants={participants} 
          />
        </div>

        {/* Right Sidebar */}
        {(showChat || showParticipants || showSettings) && (
          <div className="w-80 bg-white text-gray-900 border-l border-gray-300 flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold">
                {showChat && t('meeting.chat')}
                {showParticipants && t('meeting.participants')}
                {showSettings && t('meeting.settings')}
              </h3>
              <Button
                onClick={() => {
                  setShowChat(false);
                  setShowParticipants(false);
                  setShowSettings(false);
                }}
                variant="ghost"
                size="icon"
                className="w-8 h-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-hidden">
              {showChat && <Chat roomId={roomId || ''} />}
              {showParticipants && <ParticipantsList participants={participants} />}
              {showSettings && <DeviceSettings />}
            </div>
          </div>
        )}
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