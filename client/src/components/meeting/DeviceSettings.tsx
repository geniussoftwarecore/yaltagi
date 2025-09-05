import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Mic, Speaker, Volume2 } from 'lucide-react';

interface MediaDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export function DeviceSettings() {
  const { t } = useTranslation();
  const {
    selectedCamera,
    selectedMicrophone,
    selectedSpeaker,
    setSelectedCamera,
    setSelectedMicrophone,
    setSelectedSpeaker
  } = useAppStore();
  
  const [devices, setDevices] = useState<MediaDevice[]>([]);
  const [isTestingAudio, setIsTestingAudio] = useState(false);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    loadDevices();
    startCameraPreview();
    
    return () => {
      stopCameraPreview();
    };
  }, []);

  const loadDevices = async () => {
    try {
      // Request permissions first
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const filteredDevices = deviceList
        .filter(device => device.label && device.deviceId !== 'default')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label,
          kind: device.kind
        }));
      
      setDevices(filteredDevices);
      
      // Set default devices if none selected
      if (!selectedCamera) {
        const defaultCamera = filteredDevices.find(d => d.kind === 'videoinput');
        if (defaultCamera) setSelectedCamera(defaultCamera.deviceId);
      }
      
      if (!selectedMicrophone) {
        const defaultMic = filteredDevices.find(d => d.kind === 'audioinput');
        if (defaultMic) setSelectedMicrophone(defaultMic.deviceId);
      }
      
      if (!selectedSpeaker) {
        const defaultSpeaker = filteredDevices.find(d => d.kind === 'audiooutput');
        if (defaultSpeaker) setSelectedSpeaker(defaultSpeaker.deviceId);
      }
      
    } catch (error) {
      console.error('Failed to load devices:', error);
    }
  };

  const startCameraPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedCamera || undefined },
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

  const updateCameraPreview = async (deviceId: string) => {
    stopCameraPreview();
    setSelectedCamera(deviceId);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId },
        audio: false
      });
      
      setPreviewStream(stream);
      
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Failed to update camera:', error);
    }
  };

  const testAudio = async () => {
    setIsTestingAudio(true);
    
    try {
      // Play a test tone
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 1);
      
      setTimeout(() => {
        setIsTestingAudio(false);
        audioContext.close();
      }, 1000);
      
    } catch (error) {
      console.error('Failed to test audio:', error);
      setIsTestingAudio(false);
    }
  };

  const cameras = devices.filter(d => d.kind === 'videoinput');
  const microphones = devices.filter(d => d.kind === 'audioinput');
  const speakers = devices.filter(d => d.kind === 'audiooutput');

  return (
    <div className="p-4 space-y-6">
      {/* Camera Settings */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse text-lg">
            <Camera className="w-5 h-5" />
            <span>{t('devices.camera')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera Preview */}
          <div className="relative w-full h-32 bg-black rounded-xl overflow-hidden">
            <video
              ref={videoPreviewRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Camera Selection */}
          <div className="space-y-2">
            {cameras.map((camera) => (
              <button
                key={camera.deviceId}
                onClick={() => updateCameraPreview(camera.deviceId)}
                className={`w-full p-3 text-left rounded-xl border transition-colors ${
                  selectedCamera === camera.deviceId
                    ? 'border-primary-blue bg-blue-50 text-primary-blue'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm font-medium truncate">{camera.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Microphone Settings */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse text-lg">
            <Mic className="w-5 h-5" />
            <span>{t('devices.microphone')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {microphones.map((mic) => (
            <button
              key={mic.deviceId}
              onClick={() => setSelectedMicrophone(mic.deviceId)}
              className={`w-full p-3 text-left rounded-xl border transition-colors ${
                selectedMicrophone === mic.deviceId
                  ? 'border-primary-blue bg-blue-50 text-primary-blue'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className="text-sm font-medium truncate">{mic.label}</span>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Speaker Settings */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse text-lg">
            <Speaker className="w-5 h-5" />
            <span>{t('devices.speakers')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Speaker Selection */}
          <div className="space-y-2">
            {speakers.map((speaker) => (
              <button
                key={speaker.deviceId}
                onClick={() => setSelectedSpeaker(speaker.deviceId)}
                className={`w-full p-3 text-left rounded-xl border transition-colors ${
                  selectedSpeaker === speaker.deviceId
                    ? 'border-primary-blue bg-blue-50 text-primary-blue'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm font-medium truncate">{speaker.label}</span>
              </button>
            ))}
          </div>
          
          {/* Test Audio Button */}
          <Button
            onClick={testAudio}
            disabled={isTestingAudio}
            variant="outline"
            className="w-full"
          >
            <Volume2 className="w-4 h-4 mr-2" />
            {isTestingAudio ? t('devices.testing') : t('devices.testAudio')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}