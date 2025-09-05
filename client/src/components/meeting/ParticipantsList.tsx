import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { User, Mic, MicOff, Video, VideoOff, Crown } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  stream?: MediaStream;
  isHost?: boolean;
}

interface ParticipantsListProps {
  participants: Participant[];
}

export function ParticipantsList({ participants }: ParticipantsListProps) {
  const { t } = useTranslation();
  const { username } = useAppStore();
  
  const allParticipants = [
    {
      id: 'local',
      name: username || 'You',
      isHost: true,
      isLocal: true
    },
    ...participants
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        {t('meeting.participantCount', { count: allParticipants.length })}
      </div>
      
      {allParticipants.map((participant) => (
        <div
          key={participant.id}
          className="flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          {/* Avatar */}
          <div className="w-10 h-10 bg-primary-blue rounded-full flex items-center justify-center relative">
            <User className="w-6 h-6 text-white" />
            {participant.isHost && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <Crown className="w-2.5 h-2.5 text-yellow-800" />
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <p className="text-sm font-medium text-gray-900 truncate">
                {participant.name}
                {participant.isLocal && ` (${t('meeting.you')})`}
              </p>
              {participant.isHost && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  {t('meeting.host')}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {participant.stream ? t('meeting.connected') : t('meeting.connecting')}
            </p>
          </div>
          
          {/* Status Icons */}
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            {/* Microphone Status */}
            <div className={`p-1 rounded-full ${
              participant.isLocal 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              <Mic className="w-3 h-3" />
            </div>
            
            {/* Camera Status */}
            <div className={`p-1 rounded-full ${
              participant.stream 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              <Video className="w-3 h-3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}