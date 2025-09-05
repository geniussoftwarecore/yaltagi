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
    <div className="relative video-container group animate-[scaleIn_0.6s_ease-out] hover-lift">
      {stream && isCameraOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Mute local video to prevent echo
          className="video-element transition-all duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 flex items-center justify-center relative overflow-hidden">
          {/* Animated background particles */}
          <div className="absolute inset-0">
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-teal-400/30 rounded-full animate-bounce"
                style={{
                  left: `${20 + i * 30}%`,
                  top: `${30 + i * 20}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>
          
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mb-3 shadow-2xl animate-pulse hover:animate-bounce group-hover:scale-110 transition-transform duration-300">
              <User className="w-10 h-10 text-white" />
            </div>
            <p className="text-white/80 text-sm font-medium">{name}</p>
            {!isCameraOn && (
              <p className="text-white/60 text-xs mt-1 animate-pulse">الكاميرا مغلقة</p>
            )}
          </div>
        </div>
      )}
      
      {/* Overlay with name and status */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
        <div className="bg-gradient-to-r from-black/80 to-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-2xl text-sm font-medium shadow-lg border border-white/10">
          {name} {isLocal && '(أنت)'}
        </div>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {!isCameraOn && (
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-2 rounded-full shadow-lg animate-pulse">
              <VideoOff className="w-4 h-4 text-white" />
            </div>
          )}
          {isMuted && (
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-2 rounded-full shadow-lg animate-pulse">
              <MicOff className="w-4 h-4 text-white" />
            </div>
          )}
          {!isMuted && (
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-2 rounded-full shadow-lg animate-pulse">
              <Mic className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </div>
      
      {/* Speaking indicator with enhanced animation */}
      {!isMuted && isCameraOn && (
        <>
          <div className="absolute inset-0 border-4 border-teal-400/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse pointer-events-none" />
          <div className="absolute inset-0 border-2 border-green-400/80 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 animate-ping pointer-events-none" />
        </>
      )}

      {/* Connection status indicator */}
      <div className="absolute top-3 right-3">
        <div className="w-3 h-3 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full shadow-lg animate-pulse"></div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
    </div>
  );
}

export function VideoGrid({ localStream, participants }: VideoGridProps) {
  const { t } = useTranslation();
  const { username, isMuted, isCameraOn } = useAppStore();
  
  const totalParticipants = participants.length + (localStream ? 1 : 0);
  
  // Determine grid layout with enhanced animations
  const getGridClass = () => {
    if (totalParticipants === 1) return 'grid-cols-1 place-items-center';
    if (totalParticipants === 2) return 'grid-cols-1 lg:grid-cols-2 gap-8';
    if (totalParticipants <= 4) return 'grid-cols-2 gap-6';
    if (totalParticipants <= 6) return 'grid-cols-2 lg:grid-cols-3 gap-4';
    return 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';
  };

  return (
    <div className="flex-1 p-6 animate-[fadeIn_0.8s_ease-out]">
      <div className={`grid ${getGridClass()} h-full transition-all duration-500 ease-out`}>
        {/* Local video */}
        {localStream && (
          <div className="animate-[slideInLeft_0.8s_ease-out]">
            <VideoTile
              stream={localStream}
              name={username || 'أنت'}
              isLocal={true}
              isMuted={isMuted}
              isCameraOn={isCameraOn}
            />
          </div>
        )}
        
        {/* Participant videos */}
        {participants.map((participant, index) => (
          <div 
            key={participant.id} 
            className="animate-[slideInRight_0.8s_ease-out]" 
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <VideoTile
              stream={participant.stream}
              name={participant.name}
              isMuted={false} // We don't know remote mute status in this simple implementation
              isCameraOn={!!participant.stream}
            />
          </div>
        ))}
        
        {/* Empty state with enhanced animation */}
        {totalParticipants === 0 && (
          <div className="col-span-full flex items-center justify-center animate-[fadeInUp_1s_ease-out]">
            <div className="text-center">
              <div className="relative mb-8">
                <Video className="w-20 h-20 mx-auto text-teal-300 animate-bounce" />
                <div className="absolute inset-0 w-20 h-20 mx-auto">
                  <div className="w-full h-full border-4 border-teal-300/30 rounded-full animate-ping"></div>
                </div>
              </div>
              <h3 className="text-xl font-bold gradient-text mb-2">في انتظار المشاركين</h3>
              <p className="text-gray-500 animate-pulse">سيظهر المشاركون هنا عند انضمامهم للاجتماع</p>
              
              {/* Loading dots animation */}
              <div className="flex justify-center mt-4 space-x-2">
                {Array.from({ length: 3 }, (_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add more placeholders for better visual balance */}
        {totalParticipants > 0 && totalParticipants < 4 && (
          Array.from({ length: 4 - totalParticipants }, (_, index) => (
            <div 
              key={`placeholder-${index}`} 
              className="opacity-30 animate-[fadeIn_1s_ease-out] hover:opacity-50 transition-opacity duration-300"
              style={{ animationDelay: `${(totalParticipants + index) * 0.2}s` }}
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-100/50 to-gray-200/50 rounded-2xl border-2 border-dashed border-gray-300/50 flex items-center justify-center relative overflow-hidden group hover:bg-gradient-to-br hover:from-teal-50/50 hover:to-cyan-50/50 transition-all duration-500">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-300/50 rounded-full flex items-center justify-center mb-2 group-hover:bg-teal-300/50 transition-colors duration-300">
                    <User className="w-6 h-6 text-gray-400 group-hover:text-teal-500" />
                  </div>
                  <p className="text-xs text-gray-400 group-hover:text-teal-500 transition-colors duration-300">مشارك جديد</p>
                </div>
                
                {/* Subtle animation for placeholder */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}