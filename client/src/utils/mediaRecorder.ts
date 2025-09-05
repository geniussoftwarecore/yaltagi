export interface RecordingOptions {
  video: boolean;
  audio: boolean;
  mimeType?: string;
  videoBitsPerSecond?: number;
  audioBitsPerSecond?: number;
}

export interface RecordingMetadata {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  participants: string[];
  meetingTitle?: string;
  size: number;
}

export class MeetingRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording = false;
  private startTime: Date | null = null;
  private onDataAvailable?: (chunk: Blob) => void;
  private onRecordingComplete?: (blob: Blob, metadata: RecordingMetadata) => void;
  private onStateChange?: (state: 'inactive' | 'recording' | 'paused') => void;
  private recordingId: string;
  private participants: string[] = [];
  private meetingTitle?: string;

  constructor(
    onDataAvailable?: (chunk: Blob) => void,
    onRecordingComplete?: (blob: Blob, metadata: RecordingMetadata) => void,
    onStateChange?: (state: 'inactive' | 'recording' | 'paused') => void
  ) {
    this.onDataAvailable = onDataAvailable;
    this.onRecordingComplete = onRecordingComplete;
    this.onStateChange = onStateChange;
    this.recordingId = this.generateRecordingId();
  }

  private generateRecordingId(): string {
    return `recording-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async startRecording(stream: MediaStream, options: RecordingOptions = { video: true, audio: true }): Promise<void> {
    if (this.isRecording) {
      throw new Error('Recording is already in progress');
    }

    try {
      // Determine the best MIME type
      const mimeType = this.getBestMimeType(options.mimeType);
      
      const mediaRecorderOptions: MediaRecorderOptions = {
        mimeType
      };

      if (options.videoBitsPerSecond) {
        mediaRecorderOptions.videoBitsPerSecond = options.videoBitsPerSecond;
      }
      
      if (options.audioBitsPerSecond) {
        mediaRecorderOptions.audioBitsPerSecond = options.audioBitsPerSecond;
      }

      this.mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);
      this.recordedChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
          this.onDataAvailable?.(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.handleRecordingComplete();
      };

      this.mediaRecorder.onstart = () => {
        this.isRecording = true;
        this.startTime = new Date();
        this.onStateChange?.('recording');
      };

      this.mediaRecorder.onpause = () => {
        this.onStateChange?.('paused');
      };

      this.mediaRecorder.onresume = () => {
        this.onStateChange?.('recording');
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        this.isRecording = false;
        this.onStateChange?.('inactive');
      };

      // Start recording with data available every 1 second
      this.mediaRecorder.start(1000);
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  pauseRecording(): void {
    if (this.mediaRecorder && this.isRecording && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }

  private handleRecordingComplete(): void {
    if (this.recordedChunks.length === 0) {
      console.warn('No recorded data available');
      return;
    }

    const mimeType = this.mediaRecorder?.mimeType || 'video/webm';
    const recordingBlob = new Blob(this.recordedChunks, { type: mimeType });
    
    const endTime = new Date();
    const duration = this.startTime ? endTime.getTime() - this.startTime.getTime() : 0;

    const metadata: RecordingMetadata = {
      id: this.recordingId,
      startTime: this.startTime || new Date(),
      endTime,
      duration,
      participants: [...this.participants],
      meetingTitle: this.meetingTitle,
      size: recordingBlob.size
    };

    this.onRecordingComplete?.(recordingBlob, metadata);
    this.onStateChange?.('inactive');

    // Reset for next recording
    this.recordedChunks = [];
    this.recordingId = this.generateRecordingId();
  }

  private getBestMimeType(preferredType?: string): string {
    if (preferredType && MediaRecorder.isTypeSupported(preferredType)) {
      return preferredType;
    }

    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4;codecs=h264,aac',
      'video/mp4'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'video/webm'; // Fallback
  }

  downloadRecording(blob: Blob, filename?: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const defaultFilename = `meeting-recording-${timestamp}.webm`;
    
    a.href = url;
    a.download = filename || defaultFilename;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up the URL
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  getRecordingState(): 'inactive' | 'recording' | 'paused' {
    if (!this.mediaRecorder) return 'inactive';
    return this.mediaRecorder.state;
  }

  getRecordingDuration(): number {
    if (!this.startTime || !this.isRecording) return 0;
    return Date.now() - this.startTime.getTime();
  }

  setParticipants(participants: string[]): void {
    this.participants = [...participants];
  }

  setMeetingTitle(title: string): void {
    this.meetingTitle = title;
  }

  isRecordingActive(): boolean {
    return this.isRecording;
  }

  getSupportedMimeTypes(): string[] {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus', 
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4;codecs=h264,aac',
      'video/mp4'
    ];

    return types.filter(type => MediaRecorder.isTypeSupported(type));
  }

  cleanup(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.stopRecording();
    }
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.startTime = null;
  }
}

// Utility functions for recording management
export function formatRecordingDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function createRecordingPreview(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(blob);
    
    video.src = url;
    video.currentTime = 1; // Seek to 1 second for preview
    
    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      ctx.drawImage(video, 0, 0);
      
      const previewUrl = canvas.toDataURL('image/jpeg', 0.8);
      URL.revokeObjectURL(url);
      resolve(previewUrl);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load video for preview'));
    };
  });
}