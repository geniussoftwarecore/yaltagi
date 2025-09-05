import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { Mic, MicOff, Video, VideoOff, User } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  stream?: MediaStream;
  isHost?: boolean;
}

interface VideoGridProps {
  localStream: MediaStream | null;
  participants: Participant[];
}

interface VideoTileProps {
  stream?: MediaStream;
  name: string;
  isLocal?: boolean;
  isMuted?: boolean;
  isCameraOn?: boolean;
}

function VideoTile({ stream, name, isLocal = false, isMuted = false, isCameraOn = true }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative video-container group">
      {stream && isCameraOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Mute local video to prevent echo
          className="video-element"
        />
      ) : (
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          <div className="w-20 h-20 bg-primary-blue rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
        </div>
      )}
      
      {/* Overlay with name and status */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
          {name} {isLocal && '(You)'}
        </div>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {!isCameraOn && (
            <div className="bg-red-500 p-1 rounded-full">
              <VideoOff className="w-4 h-4 text-white" />
            </div>
          )}
          {isMuted && (
            <div className="bg-red-500 p-1 rounded-full">
              <MicOff className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </div>
      
      {/* Speaking indicator */}
      {!isMuted && isCameraOn && (
        <div className="absolute inset-0 border-4 border-green-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
    </div>
  );
}

export function VideoGrid({ localStream, participants }: VideoGridProps) {
  const { t } = useTranslation();
  const { username, isMuted, isCameraOn } = useAppStore();
  
  const totalParticipants = participants.length + (localStream ? 1 : 0);
  
  // Determine grid layout
  const getGridClass = () => {
    if (totalParticipants === 1) return 'grid-cols-1';
    if (totalParticipants === 2) return 'grid-cols-1 lg:grid-cols-2';
    if (totalParticipants <= 4) return 'grid-cols-2';
    if (totalParticipants <= 6) return 'grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  };

  return (
    <div className="flex-1 p-4">
      <div className={`grid gap-4 h-full ${getGridClass()}`}>
        {/* Local video */}
        {localStream && (
          <VideoTile
            stream={localStream}
            name={username || t('meeting.you')}
            isLocal={true}
            isMuted={isMuted}
            isCameraOn={isCameraOn}
          />
        )}
        
        {/* Participant videos */}
        {participants.map((participant) => (
          <VideoTile
            key={participant.id}
            stream={participant.stream}
            name={participant.name}
            isMuted={false} // We don't know remote mute status in this simple implementation
            isCameraOn={!!participant.stream}
          />
        ))}
        
        {/* Empty slots for visual balance */}
        {totalParticipants === 0 && (
          <div className="flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">{t('meeting.waitingForParticipants')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}