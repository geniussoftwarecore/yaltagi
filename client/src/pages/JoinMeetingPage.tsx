import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, ArrowRight } from 'lucide-react';

export function JoinMeetingPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { username, setUsername } = useAppStore();
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !roomCode.trim()) return;

    setIsJoining(true);
    
    try {
      // Navigate to meeting room
      setLocation(`/room/${roomCode}`);
    } catch (error) {
      console.error('Failed to join meeting:', error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-blue/30 via-white to-green-cta/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-blue to-green-cta rounded-2xl flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-primary-blue">
            {t('join.title')}
          </CardTitle>
          <CardDescription>
            {t('howItWorks.step1.description')}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleJoinMeeting} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-700">
                {t('join.displayName')}
              </label>
              <Input
                id="username"
                type="text"
                placeholder={t('join.displayNamePlaceholder')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="text-center"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="roomCode" className="text-sm font-medium text-gray-700">
                {t('join.roomCode')}
              </label>
              <Input
                id="roomCode"
                type="text"
                placeholder={t('join.roomCodePlaceholder')}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                required
                className="text-center font-mono text-lg tracking-wider"
              />
            </div>
            
            <Button
              type="submit"
              variant="cta"
              size="lg"
              className="w-full"
              disabled={isJoining || !username.trim() || !roomCode.trim()}
            >
              {isJoining ? t('common.loading') : t('join.joinButton')}
              <ArrowRight className="ml-2 h-5 w-5 rtl:rotate-180" />
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('create.title')}?{' '}
              <button
                onClick={() => setLocation('/create')}
                className="text-primary-blue hover:underline font-medium"
              >
                {t('landing.hero.cta')}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}