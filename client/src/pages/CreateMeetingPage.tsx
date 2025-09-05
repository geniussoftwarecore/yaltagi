import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, ArrowRight, Mic, MicOff, Camera, CameraOff, Settings } from 'lucide-react';

export function CreateMeetingPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { username, setUsername } = useAppStore();
  const [meetingName, setMeetingName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    startCameraPreview();
    
    return () => {
      stopCameraPreview();
    };
  }, []);

  const startCameraPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      
      setPreviewStream(stream);
      
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Failed to start camera preview:', error);
    }
  };

  const stopCameraPreview = () => {
    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop());
      setPreviewStream(null);
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center p-8">
      {/* Main Card Container */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Y</span>
            </div>
            <span className="font-semibold text-gray-800">Yaltaqi</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-500">
            <span className="text-sm">اعدادات</span>
            <span className="text-sm">مخططات</span>
            <div className="w-6 h-1 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-right">معاينة واعدادات</h1>

        {/* Video Preview */}
        <div className="relative mb-6">
          <div className="w-full h-48 bg-teal-100 rounded-2xl overflow-hidden relative">
            <video
              ref={videoPreviewRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* User overlay */}
            <div className="absolute bottom-4 left-4">
              <div className="bg-teal-500 text-white px-3 py-1 rounded-lg text-sm">
                أنت
              </div>
            </div>
            {/* Status indicator */}
            <div className="absolute top-4 right-4">
              <div className="bg-black bg-opacity-20 text-white px-2 py-1 rounded text-xs">
                معاينة
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Setup Form */}
        <form onSubmit={handleCreateMeeting} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="meetingHow" className="text-sm font-medium text-gray-700 block text-right">
              Meeting How
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-xl text-right">
              <option>Yaltaqi — Monestrous Anti-Reuni, High Definition...</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block text-right">
              Speakers, Rechtlich Right Default Audio  OnNext
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-xl text-right">
              <option>Default</option>
            </select>
          </div>

          {/* Audio/Video Controls */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">صوت</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={!isMuted}
                    onChange={() => setIsMuted(!isMuted)}
                  />
                  <div 
                    className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${
                      !isMuted ? 'bg-teal-500' : 'bg-gray-300'
                    }`}
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    <div 
                      className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${
                        !isMuted ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">فيديو</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isCameraOn}
                    onChange={() => setIsCameraOn(!isCameraOn)}
                  />
                  <div 
                    className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${
                      isCameraOn ? 'bg-teal-500' : 'bg-gray-300'
                    }`}
                    onClick={() => setIsCameraOn(!isCameraOn)}
                  >
                    <div 
                      className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${
                        isCameraOn ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Join Button */}
          <Button
            type="submit"
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105"
            disabled={isCreating || !username.trim()}
          >
            {isCreating ? 'انتظر...' : 'انضم الآن'}
          </Button>
        </form>

        {/* Display Name Input */}
        <div className="mt-4 space-y-2">
          <Input
            id="username"
            type="text"
            placeholder="اكتب اسمك هنا"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="text-center text-gray-600 border-gray-300 rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}