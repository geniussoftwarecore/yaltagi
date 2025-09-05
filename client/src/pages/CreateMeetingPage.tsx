import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, ArrowRight } from 'lucide-react';

export function CreateMeetingPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { username, setUsername } = useAppStore();
  const [meetingName, setMeetingName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !meetingName.trim()) return;

    setIsCreating(true);
    
    try {
      // Generate room ID
      const roomId = Math.random().toString(36).substr(2, 9);
      
      // Navigate to meeting room
      setLocation(`/room/${roomId}`);
    } catch (error) {
      console.error('Failed to create meeting:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-blue/30 via-white to-green-cta/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-blue to-green-cta rounded-2xl flex items-center justify-center mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-primary-blue">
            {t('create.title')}
          </CardTitle>
          <CardDescription>
            {t('landing.hero.subtitle')}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleCreateMeeting} className="space-y-6">
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
              <label htmlFor="meetingName" className="text-sm font-medium text-gray-700">
                {t('create.meetingName')}
              </label>
              <Input
                id="meetingName"
                type="text"
                placeholder={t('create.meetingNamePlaceholder')}
                value={meetingName}
                onChange={(e) => setMeetingName(e.target.value)}
                required
                className="text-center"
              />
            </div>
            
            <Button
              type="submit"
              variant="cta"
              size="lg"
              className="w-full"
              disabled={isCreating || !username.trim() || !meetingName.trim()}
            >
              {isCreating ? t('common.loading') : t('create.startButton')}
              <ArrowRight className="ml-2 h-5 w-5 rtl:rotate-180" />
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('landing.hero.joinMeeting')}?{' '}
              <button
                onClick={() => setLocation('/join')}
                className="text-primary-blue hover:underline font-medium"
              >
                {t('join.title')}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}