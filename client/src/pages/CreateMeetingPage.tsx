import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, VideoOff, ArrowRight, Mic, MicOff, Camera, CameraOff, Settings } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${Math.random() * 4 + 4}s`
            }}
          />
        ))}
      </div>

      {/* Main Card Container */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-lg w-full mx-auto border border-white/20 animate-[scaleIn_0.8s_ease-out] relative overflow-hidden">
        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-[slideInDown_0.6s_ease-out] relative z-10">
          <div className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 hover-glow">
              <span className="text-white font-bold text-sm">Y</span>
            </div>
            <span className="font-semibold text-gray-800 transition-colors duration-300 group-hover:text-teal-600">Yaltaqi</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-500">
            <span className="text-sm hover:text-teal-500 cursor-pointer transition-all duration-200 transform hover:scale-105 hover-lift">اعدادات</span>
            <span className="text-sm hover:text-teal-500 cursor-pointer transition-all duration-200 transform hover:scale-105 hover-lift">مخططات</span>
            <div className="w-6 h-1 bg-gradient-to-r from-teal-300 to-cyan-300 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-2xl font-bold gradient-text mb-6 text-right animate-[fadeIn_0.8s_ease-out_0.2s_both]">معاينة واعدادات</h1>

          {/* Video Preview */}
          <div className="relative mb-6 animate-[slideInUp_0.8s_ease-out_0.3s_both]">
            <div className="w-full h-48 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl overflow-hidden relative shadow-xl border border-white/50 hover-lift hover-glow group">
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
              />
              {/* Animated Border */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-teal-400 transition-all duration-500"></div>
              
              {/* User overlay */}
              <div className="absolute bottom-4 left-4 animate-[slideInLeft_0.5s_ease-out_0.5s_both]">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-3 py-1 rounded-lg text-sm shadow-lg transform hover:scale-105 transition-all duration-300 ripple">
                  أنت
                </div>
              </div>
              
              {/* Status indicator */}
              <div className="absolute top-4 right-4 animate-[slideInRight_0.5s_ease-out_0.5s_both]">
                <div className="bg-black/20 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs border border-white/20 hover:bg-black/30 transition-all duration-300">
                  معاينة مباشرة
                </div>
              </div>
              
              {/* Pulse Effect */}
              <div className="absolute top-2 left-2 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
            </div>
          </div>

          {/* Meeting Setup Form */}
          <form onSubmit={handleCreateMeeting} className="space-y-6 animate-[slideInUp_0.9s_ease-out_0.4s_both]">
            <div className="space-y-3">
              <label htmlFor="meetingHow" className="text-sm font-medium text-gray-700 block text-right">
                إعدادات الجودة
              </label>
              <select className="w-full p-4 border border-gray-300/50 rounded-2xl text-right bg-white/80 backdrop-blur-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-300 hover:bg-white hover:shadow-lg">
                <option>Yaltaqi — جودة عالية، صوت واضح، مشاركة شاشة</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 block text-right">
                إعدادات الصوت
              </label>
              <select className="w-full p-4 border border-gray-300/50 rounded-2xl text-right bg-white/80 backdrop-blur-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-300 hover:bg-white hover:shadow-lg">
                <option>الافتراضي - سماعات النظام</option>
              </select>
            </div>

            {/* Audio/Video Controls */}
            <div className="bg-gradient-to-r from-gray-50/50 to-teal-50/50 p-6 rounded-2xl border border-white/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3 group">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-teal-600 transition-colors duration-200">صوت</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={!isMuted}
                        onChange={() => setIsMuted(!isMuted)}
                      />
                      <div 
                        className={`w-14 h-7 rounded-full transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                          !isMuted ? 'bg-gradient-to-r from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/25' : 'bg-gray-300'
                        }`}
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        <div 
                          className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-all duration-300 mt-0.5 flex items-center justify-center ${
                            !isMuted ? 'translate-x-7' : 'translate-x-0.5'
                          }`}
                        >
                          {!isMuted ? (
                            <Mic className="w-3 h-3 text-teal-500" />
                          ) : (
                            <MicOff className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 group">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-teal-600 transition-colors duration-200">فيديو</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isCameraOn}
                        onChange={() => setIsCameraOn(!isCameraOn)}
                      />
                      <div 
                        className={`w-14 h-7 rounded-full transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                          isCameraOn ? 'bg-gradient-to-r from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/25' : 'bg-gray-300'
                        }`}
                        onClick={() => setIsCameraOn(!isCameraOn)}
                      >
                        <div 
                          className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-all duration-300 mt-0.5 flex items-center justify-center ${
                            isCameraOn ? 'translate-x-7' : 'translate-x-0.5'
                          }`}
                        >
                          {isCameraOn ? (
                            <Video className="w-3 h-3 text-teal-500" />
                          ) : (
                            <VideoOff className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Display Name Input */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 block text-right">
                اسم العرض
              </label>
              <Input
                id="username"
                type="text"
                placeholder="اكتب اسمك هنا"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="text-center text-gray-700 border-gray-300/50 rounded-2xl p-4 bg-white/80 backdrop-blur-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-300 hover:bg-white hover:shadow-lg font-medium"
              />
            </div>

            {/* Join Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-4 rounded-2xl text-lg transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-teal-500/25 relative overflow-hidden group ripple"
              disabled={isCreating || !username.trim()}
            >
              <span className="relative z-10 flex items-center justify-center">
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    انتظر...
                  </>
                ) : (
                  <>
                    انضم الآن
                    <ArrowRight className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}