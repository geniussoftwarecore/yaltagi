import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  Square, 
  Play, 
  Pause, 
  Download, 
  Settings, 
  Clock,
  FileVideo,
  HardDrive,
  X
} from 'lucide-react';
import { MeetingRecorder, RecordingOptions, RecordingMetadata, formatRecordingDuration, formatFileSize } from '@/utils/mediaRecorder';

interface Recording {
  id: string;
  blob: Blob;
  metadata: RecordingMetadata;
  previewUrl?: string;
}

interface RecordingPanelProps {
  stream: MediaStream | null;
  isHost: boolean;
  participants: string[];
  meetingTitle?: string;
  onClose: () => void;
}

export function RecordingPanel({ 
  stream, 
  isHost, 
  participants, 
  meetingTitle, 
  onClose 
}: RecordingPanelProps) {
  const { t } = useTranslation();
  const [recorder, setRecorder] = useState<MeetingRecorder | null>(null);
  const [recordingState, setRecordingState] = useState<'inactive' | 'recording' | 'paused'>('inactive');
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [currentRecordingDuration, setCurrentRecordingDuration] = useState(0);
  const [recordingOptions, setRecordingOptions] = useState<RecordingOptions>({
    video: true,
    audio: true,
    videoBitsPerSecond: 2500000, // 2.5 Mbps
    audioBitsPerSecond: 128000   // 128 kbps
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!recorder) {
      const newRecorder = new MeetingRecorder(
        undefined, // onDataAvailable
        (blob: Blob, metadata: RecordingMetadata) => {
          // Recording completed
          const newRecording: Recording = {
            id: metadata.id,
            blob,
            metadata
          };
          setRecordings(prev => [newRecording, ...prev]);
          setCurrentRecordingDuration(0);
        },
        (state: 'inactive' | 'recording' | 'paused') => {
          setRecordingState(state);
        }
      );

      newRecorder.setParticipants(participants);
      if (meetingTitle) {
        newRecorder.setMeetingTitle(meetingTitle);
      }

      setRecorder(newRecorder);
    }

    return () => {
      if (recorder) {
        recorder.cleanup();
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (recordingState === 'recording' && recorder) {
      interval = setInterval(() => {
        setCurrentRecordingDuration(recorder.getRecordingDuration());
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recordingState, recorder]);

  const startRecording = async () => {
    if (!recorder || !stream) return;

    try {
      await recorder.startRecording(stream, recordingOptions);
    } catch (error) {
      console.error('Failed to start recording:', error);
      // Here you would show an error toast
    }
  };

  const stopRecording = () => {
    if (recorder) {
      recorder.stopRecording();
    }
  };

  const pauseRecording = () => {
    if (recorder) {
      recorder.pauseRecording();
    }
  };

  const resumeRecording = () => {
    if (recorder) {
      recorder.resumeRecording();
    }
  };

  const downloadRecording = (recording: Recording) => {
    if (recorder) {
      const timestamp = recording.metadata.startTime.toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `meeting-recording-${timestamp}.webm`;
      recorder.downloadRecording(recording.blob, filename);
    }
  };

  const deleteRecording = (recordingId: string) => {
    setRecordings(prev => prev.filter(r => r.id !== recordingId));
  };

  const getSupportedFormats = () => {
    if (!recorder) return [];
    return recorder.getSupportedMimeTypes();
  };

  if (!isHost) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-center gradient-text">التسجيل</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Video className="w-16 h-16 mx-auto text-teal-500 mb-4 animate-pulse" />
            <p className="text-gray-600 mb-4">
              التسجيل متاح للمضيف فقط
            </p>
            <Button onClick={onClose} variant="outline" className="w-full">
              إغلاق
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-effect animate-[scaleIn_0.4s_ease-out]">
        <CardHeader className="pb-4 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold gradient-text flex items-center">
              <Video className="w-6 h-6 text-teal-500 ml-2" />
              تسجيل الاجتماع
            </CardTitle>
            <div className="flex items-center gap-2">
              {recordingState === 'recording' && (
                <Badge className="bg-red-100 text-red-800 border-red-200 animate-pulse flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full ml-1 animate-pulse"></div>
                  جار التسجيل
                </Badge>
              )}
              <Button onClick={onClose} variant="ghost" size="sm" className="hover-lift">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Current Recording Controls */}
            <Card className="border-teal-200/50 bg-gradient-to-br from-teal-50/30 to-cyan-50/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center">
                    <Play className="w-5 h-5 text-teal-500 ml-2" />
                    التحكم في التسجيل
                  </span>
                  <Button
                    onClick={() => setShowSettings(!showSettings)}
                    variant="outline"
                    size="sm"
                    className="hover-lift"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Recording Status */}
                <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      recordingState === 'recording' ? 'bg-red-500 animate-pulse' :
                      recordingState === 'paused' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />
                    <span className="font-medium">
                      {recordingState === 'recording' ? 'يسجل الآن' :
                       recordingState === 'paused' ? 'متوقف مؤقتاً' : 'غير نشط'}
                    </span>
                  </div>
                  
                  {recordingState !== 'inactive' && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="font-mono">
                        {formatRecordingDuration(currentRecordingDuration)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Control Buttons */}
                <div className="flex gap-3">
                  {recordingState === 'inactive' && (
                    <Button
                      onClick={startRecording}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover-lift"
                      disabled={!stream}
                    >
                      <Video className="w-4 h-4 ml-1" />
                      بدء التسجيل
                    </Button>
                  )}
                  
                  {recordingState === 'recording' && (
                    <>
                      <Button
                        onClick={pauseRecording}
                        variant="outline"
                        className="flex-1 hover-lift"
                      >
                        <Pause className="w-4 h-4 ml-1" />
                        إيقاف مؤقت
                      </Button>
                      <Button
                        onClick={stopRecording}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover-lift"
                      >
                        <Square className="w-4 h-4 ml-1" />
                        إيقاف التسجيل
                      </Button>
                    </>
                  )}
                  
                  {recordingState === 'paused' && (
                    <>
                      <Button
                        onClick={resumeRecording}
                        className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white hover-lift"
                      >
                        <Play className="w-4 h-4 ml-1" />
                        متابعة التسجيل
                      </Button>
                      <Button
                        onClick={stopRecording}
                        variant="outline"
                        className="flex-1 hover-lift"
                      >
                        <Square className="w-4 h-4 ml-1" />
                        إيقاف نهائي
                      </Button>
                    </>
                  )}
                </div>

                {/* Settings Panel */}
                {showSettings && (
                  <div className="bg-white/50 p-4 rounded-xl border border-white/50 space-y-4">
                    <h4 className="font-semibold">إعدادات التسجيل</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={recordingOptions.video}
                            onChange={(e) => setRecordingOptions(prev => ({
                              ...prev,
                              video: e.target.checked
                            }))}
                            disabled={recordingState !== 'inactive'}
                          />
                          <span>تسجيل الفيديو</span>
                        </label>
                      </div>
                      
                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={recordingOptions.audio}
                            onChange={(e) => setRecordingOptions(prev => ({
                              ...prev,
                              audio: e.target.checked
                            }))}
                            disabled={recordingState !== 'inactive'}
                          />
                          <span>تسجيل الصوت</span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">جودة الفيديو</label>
                        <select
                          value={recordingOptions.videoBitsPerSecond}
                          onChange={(e) => setRecordingOptions(prev => ({
                            ...prev,
                            videoBitsPerSecond: parseInt(e.target.value)
                          }))}
                          disabled={recordingState !== 'inactive'}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value={1000000}>منخفضة (1 Mbps)</option>
                          <option value={2500000}>متوسطة (2.5 Mbps)</option>
                          <option value={5000000}>عالية (5 Mbps)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">جودة الصوت</label>
                        <select
                          value={recordingOptions.audioBitsPerSecond}
                          onChange={(e) => setRecordingOptions(prev => ({
                            ...prev,
                            audioBitsPerSecond: parseInt(e.target.value)
                          }))}
                          disabled={recordingState !== 'inactive'}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value={64000}>منخفضة (64 kbps)</option>
                          <option value={128000}>متوسطة (128 kbps)</option>
                          <option value={256000}>عالية (256 kbps)</option>
                        </select>
                      </div>
                    </div>

                    <div className="text-xs text-gray-600">
                      الصيغ المدعومة: {getSupportedFormats().slice(0, 2).join(', ')}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Previous Recordings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center">
                <FileVideo className="w-5 h-5 text-teal-500 ml-2" />
                التسجيلات المحفوظة ({recordings.length})
              </h3>
              
              {recordings.length === 0 ? (
                <div className="text-center py-12">
                  <FileVideo className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h4 className="text-lg font-medium text-gray-600 mb-2">لا توجد تسجيلات</h4>
                  <p className="text-gray-500">
                    ستظهر التسجيلات المكتملة هنا للتحميل
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {recordings.map((recording) => (
                    <Card key={recording.id} className="hover-lift">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">
                              تسجيل الاجتماع
                            </h4>
                            <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 ml-1" />
                                {formatRecordingDuration(recording.metadata.duration)}
                              </span>
                              <span className="flex items-center">
                                <HardDrive className="w-3 h-3 ml-1" />
                                {formatFileSize(recording.metadata.size)}
                              </span>
                              <span>
                                {recording.metadata.startTime.toLocaleDateString('ar-SA')} - 
                                {recording.metadata.startTime.toLocaleTimeString('ar-SA', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => downloadRecording(recording)}
                              size="sm"
                              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white hover-lift"
                            >
                              <Download className="w-4 h-4 ml-1" />
                              تحميل
                            </Button>
                            <Button
                              onClick={() => deleteRecording(recording.id)}
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              حذف
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Recording Tips */}
            <Card className="border-blue-200/50 bg-gradient-to-br from-blue-50/30 to-sky-50/30">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">نصائح للتسجيل</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• يتم التسجيل محلياً على جهازك فقط</li>
                  <li>• تأكد من وجود مساحة كافية على القرص الصلب</li>
                  <li>• الجودة العالية تستهلك مساحة أكبر</li>
                  <li>• يمكنك إيقاف التسجيل مؤقتاً ثم متابعته</li>
                  <li>• سيتم حفظ التسجيل بصيغة WebM</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}