import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NetworkManager, NetworkQuality, QualitySettings as QualitySettingsType } from '@/utils/networkManager';
import { 
  Wifi, 
  WifiOff, 
  Signal, 
  SignalHigh, 
  SignalMedium, 
  SignalLow,
  Settings,
  Volume2,
  Video,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';

interface QualitySettingsProps {
  networkManager: NetworkManager;
  onClose: () => void;
}

export function QualitySettings({ networkManager, onClose }: QualitySettingsProps) {
  const { t } = useTranslation();
  const [networkQuality, setNetworkQuality] = useState<NetworkQuality | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const [qualitySettings, setQualitySettings] = useState<QualitySettingsType>(networkManager.getQualitySettings());
  const [noiseSuppressionEnabled, setNoiseSuppressionEnabled] = useState(false);
  const [backgroundBlurEnabled, setBackgroundBlurEnabled] = useState(false);

  useEffect(() => {
    // Subscribe to network quality updates
    const handleNetworkQuality = (quality: NetworkQuality) => {
      setNetworkQuality(quality);
    };

    const handleConnectionState = (state: RTCPeerConnectionState) => {
      setConnectionState(state);
    };

    return () => {
      // Cleanup subscriptions
    };
  }, [networkManager]);

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return <SignalHigh className="w-5 h-5 text-green-500" />;
      case 'good': return <Signal className="w-5 h-5 text-blue-500" />;
      case 'fair': return <SignalMedium className="w-5 h-5 text-yellow-500" />;
      case 'poor': return <SignalLow className="w-5 h-5 text-red-500" />;
      default: return <WifiOff className="w-5 h-5 text-gray-500" />;
    }
  };

  const getConnectionIcon = (state: RTCPeerConnectionState) => {
    switch (state) {
      case 'connected': return <Wifi className="w-5 h-5 text-green-500" />;
      case 'connecting': return <Wifi className="w-5 h-5 text-yellow-500 animate-pulse" />;
      case 'disconnected':
      case 'failed': return <WifiOff className="w-5 h-5 text-red-500" />;
      default: return <Wifi className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleQualityChange = (type: 'video' | 'audio', value: string) => {
    const newSettings = {
      ...qualitySettings,
      [type]: value
    };
    setQualitySettings(newSettings);
    networkManager.setQualitySettings(newSettings);
  };

  const toggleAdaptiveBitrate = () => {
    const newSettings = {
      ...qualitySettings,
      adaptiveBitrate: !qualitySettings.adaptiveBitrate
    };
    setQualitySettings(newSettings);
    networkManager.setQualitySettings(newSettings);
  };

  const getQualityBadgeColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fair': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.3s_ease-out]">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto glass-effect animate-[scaleIn_0.4s_ease-out]">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold gradient-text">إعدادات الجودة والشبكة</CardTitle>
            <Button onClick={onClose} variant="ghost" size="sm" className="hover-lift">
              ×
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Network Status */}
          <div className="bg-gradient-to-r from-gray-50/50 to-teal-50/50 p-4 rounded-2xl border border-white/50">
            <h3 className="font-semibold mb-3 flex items-center">
              {getConnectionIcon(connectionState)}
              <span className="mr-2">حالة الاتصال</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">
                  {connectionState === 'connected' ? 'متصل' : 
                   connectionState === 'connecting' ? 'يتصل...' : 
                   connectionState === 'disconnected' ? 'منقطع' : 'فشل'}
                </div>
                <div className="text-sm text-gray-600">حالة الاتصال</div>
              </div>
              
              {networkQuality && (
                <div className="text-center">
                  <Badge className={`${getQualityBadgeColor(networkQuality.quality)} animate-pulse`}>
                    {getQualityIcon(networkQuality.quality)}
                    <span className="mr-1">
                      {networkQuality.quality === 'excellent' ? 'ممتاز' :
                       networkQuality.quality === 'good' ? 'جيد' :
                       networkQuality.quality === 'fair' ? 'مقبول' : 'ضعيف'}
                    </span>
                  </Badge>
                  <div className="text-sm text-gray-600 mt-1">جودة الشبكة</div>
                </div>
              )}
            </div>

            {/* Network Statistics */}
            {networkQuality && (
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="bg-white/50 rounded-xl p-3">
                  <div className="text-lg font-bold text-blue-600">{Math.round(networkQuality.bandwidth)}</div>
                  <div className="text-xs text-gray-600">kbps</div>
                </div>
                <div className="bg-white/50 rounded-xl p-3">
                  <div className="text-lg font-bold text-green-600">{Math.round(networkQuality.latency)}</div>
                  <div className="text-xs text-gray-600">ms</div>
                </div>
                <div className="bg-white/50 rounded-xl p-3">
                  <div className="text-lg font-bold text-orange-600">{networkQuality.packetLoss.toFixed(1)}</div>
                  <div className="text-xs text-gray-600">% فقدان</div>
                </div>
              </div>
            )}
          </div>

          {/* Quality Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center">
              <Settings className="w-5 h-5 text-teal-500 ml-2" />
              إعدادات الجودة
            </h3>

            {/* Video Quality */}
            <div className="bg-white/50 p-4 rounded-xl border border-white/50">
              <label className="block text-sm font-medium mb-3 flex items-center">
                <Video className="w-4 h-4 text-teal-500 ml-2" />
                جودة الفيديو
              </label>
              <div className="flex flex-wrap gap-2">
                {['auto', 'high', 'medium', 'low'].map((quality) => (
                  <Button
                    key={quality}
                    onClick={() => handleQualityChange('video', quality)}
                    variant={qualitySettings.video === quality ? 'default' : 'outline'}
                    size="sm"
                    className={`hover-lift ${qualitySettings.video === quality ? 
                      'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 
                      'hover:bg-teal-50'}`}
                  >
                    {quality === 'auto' ? 'تلقائي' :
                     quality === 'high' ? 'عالي' :
                     quality === 'medium' ? 'متوسط' : 'منخفض'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Audio Quality */}
            <div className="bg-white/50 p-4 rounded-xl border border-white/50">
              <label className="block text-sm font-medium mb-3 flex items-center">
                <Volume2 className="w-4 h-4 text-teal-500 ml-2" />
                جودة الصوت
              </label>
              <div className="flex flex-wrap gap-2">
                {['auto', 'high', 'medium', 'low'].map((quality) => (
                  <Button
                    key={quality}
                    onClick={() => handleQualityChange('audio', quality)}
                    variant={qualitySettings.audio === quality ? 'default' : 'outline'}
                    size="sm"
                    className={`hover-lift ${qualitySettings.audio === quality ? 
                      'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 
                      'hover:bg-teal-50'}`}
                  >
                    {quality === 'auto' ? 'تلقائي' :
                     quality === 'high' ? 'عالي' :
                     quality === 'medium' ? 'متوسط' : 'منخفض'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Adaptive Bitrate */}
            <div className="bg-white/50 p-4 rounded-xl border border-white/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Zap className="w-4 h-4 text-teal-500 ml-2" />
                  <span className="font-medium">التكيف التلقائي للجودة</span>
                </div>
                <Button
                  onClick={toggleAdaptiveBitrate}
                  variant="outline"
                  size="sm"
                  className={`hover-lift transition-all duration-300 ${
                    qualitySettings.adaptiveBitrate ? 
                    'bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-transparent' : 
                    'hover:bg-teal-50'
                  }`}
                >
                  {qualitySettings.adaptiveBitrate ? 'مفعل' : 'معطل'}
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                يقوم بضبط الجودة تلقائياً حسب حالة الشبكة
              </p>
            </div>
          </div>

          {/* Audio & Video Enhancements */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center">
              <Zap className="w-5 h-5 text-teal-500 ml-2" />
              تحسينات الصوت والصورة
            </h3>

            {/* Noise Suppression */}
            <div className="bg-white/50 p-4 rounded-xl border border-white/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Volume2 className="w-4 h-4 text-teal-500 ml-2" />
                  <span className="font-medium">كتم الضوضاء</span>
                </div>
                <Button
                  onClick={() => setNoiseSuppressionEnabled(!noiseSuppressionEnabled)}
                  variant="outline"
                  size="sm"
                  className={`hover-lift transition-all duration-300 ${
                    noiseSuppressionEnabled ? 
                    'bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-transparent' : 
                    'hover:bg-teal-50'
                  }`}
                >
                  {noiseSuppressionEnabled ? 'مفعل' : 'معطل'}
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                يقلل من الضوضاء الخلفية لصوت أوضح
              </p>
            </div>

            {/* Background Blur */}
            <div className="bg-white/50 p-4 rounded-xl border border-white/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {backgroundBlurEnabled ? 
                    <EyeOff className="w-4 h-4 text-teal-500 ml-2" /> : 
                    <Eye className="w-4 h-4 text-teal-500 ml-2" />
                  }
                  <span className="font-medium">طمس الخلفية</span>
                </div>
                <Button
                  onClick={() => setBackgroundBlurEnabled(!backgroundBlurEnabled)}
                  variant="outline"
                  size="sm"
                  className={`hover-lift transition-all duration-300 ${
                    backgroundBlurEnabled ? 
                    'bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-transparent' : 
                    'hover:bg-teal-50'
                  }`}
                >
                  {backgroundBlurEnabled ? 'مفعل' : 'معطل'}
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                يطمس الخلفية للتركيز عليك
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200/50">
            <Button onClick={onClose} variant="outline" className="flex-1 hover-lift">
              إغلاق
            </Button>
            <Button 
              onClick={() => {
                // Reset to defaults
                const defaultSettings = { video: 'auto', audio: 'auto', adaptiveBitrate: true };
                setQualitySettings(defaultSettings);
                networkManager.setQualitySettings(defaultSettings);
              }}
              variant="outline" 
              className="hover-lift"
            >
              إعادة تعيين
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}