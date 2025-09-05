// Network Quality and Connection Management
export interface NetworkQuality {
  bandwidth: number;
  latency: number;
  packetLoss: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface QualitySettings {
  video: 'auto' | 'high' | 'medium' | 'low';
  audio: 'auto' | 'high' | 'medium' | 'low';
  adaptiveBitrate: boolean;
}

export class NetworkManager {
  private peerConnection: RTCPeerConnection | null = null;
  private qualitySettings: QualitySettings = {
    video: 'auto',
    audio: 'auto',
    adaptiveBitrate: true
  };
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private qualityCheckInterval: NodeJS.Timeout | null = null;
  private onNetworkQualityChange?: (quality: NetworkQuality) => void;
  private onConnectionStateChange?: (state: RTCPeerConnectionState) => void;

  constructor(onNetworkQualityChange?: (quality: NetworkQuality) => void, onConnectionStateChange?: (state: RTCPeerConnectionState) => void) {
    this.onNetworkQualityChange = onNetworkQualityChange;
    this.onConnectionStateChange = onConnectionStateChange;
  }

  setPeerConnection(pc: RTCPeerConnection) {
    this.peerConnection = pc;
    this.setupConnectionMonitoring();
  }

  private setupConnectionMonitoring() {
    if (!this.peerConnection) return;

    // Monitor connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      if (!this.peerConnection) return;
      
      const state = this.peerConnection.connectionState;
      this.onConnectionStateChange?.(state);
      
      if (state === 'failed' || state === 'disconnected') {
        this.handleConnectionFailure();
      } else if (state === 'connected') {
        this.reconnectAttempts = 0;
        this.startQualityMonitoring();
      }
    };

    // Monitor ICE connection state
    this.peerConnection.oniceconnectionstatechange = () => {
      if (!this.peerConnection) return;
      
      const iceState = this.peerConnection.iceConnectionState;
      if (iceState === 'failed' || iceState === 'disconnected') {
        this.handleICEFailure();
      }
    };
  }

  private async handleConnectionFailure() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

    await new Promise(resolve => setTimeout(resolve, this.reconnectDelay * this.reconnectAttempts));
    
    try {
      await this.restartICE();
    } catch (error) {
      console.error('ICE restart failed:', error);
    }
  }

  private async handleICEFailure() {
    console.log('ICE connection failed, attempting restart');
    try {
      await this.restartICE();
    } catch (error) {
      console.error('ICE restart failed:', error);
    }
  }

  private async restartICE() {
    if (!this.peerConnection) return;

    try {
      // Create new offer with iceRestart
      const offer = await this.peerConnection.createOffer({ iceRestart: true });
      await this.peerConnection.setLocalDescription(offer);
      
      // Signal the offer to the remote peer (would be handled by signaling server)
      console.log('ICE restart offer created');
    } catch (error) {
      console.error('Failed to restart ICE:', error);
      throw error;
    }
  }

  private startQualityMonitoring() {
    if (this.qualityCheckInterval) {
      clearInterval(this.qualityCheckInterval);
    }

    this.qualityCheckInterval = setInterval(() => {
      this.checkNetworkQuality();
    }, 2000);
  }

  private async checkNetworkQuality() {
    if (!this.peerConnection) return;

    try {
      const stats = await this.peerConnection.getStats();
      const quality = this.analyzeStats(stats);
      
      if (this.qualitySettings.adaptiveBitrate) {
        await this.adaptBitrate(quality);
      }
      
      this.onNetworkQualityChange?.(quality);
    } catch (error) {
      console.error('Failed to check network quality:', error);
    }
  }

  private analyzeStats(stats: RTCStatsReport): NetworkQuality {
    let bandwidth = 0;
    let latency = 0;
    let packetLoss = 0;

    for (const stat of stats.values()) {
      if (stat.type === 'inbound-rtp' && stat.kind === 'video') {
        bandwidth = stat.bytesReceived || 0;
        packetLoss = (stat.packetsLost || 0) / (stat.packetsReceived || 1);
      }
      if (stat.type === 'candidate-pair' && stat.state === 'succeeded') {
        latency = stat.currentRoundTripTime || 0;
      }
    }

    // Convert to more readable units
    bandwidth = bandwidth * 8 / 1000; // Convert to kbps
    latency = latency * 1000; // Convert to ms
    packetLoss = packetLoss * 100; // Convert to percentage

    // Determine quality level
    let quality: NetworkQuality['quality'] = 'excellent';
    if (latency > 300 || packetLoss > 5 || bandwidth < 500) {
      quality = 'poor';
    } else if (latency > 150 || packetLoss > 2 || bandwidth < 1000) {
      quality = 'fair';
    } else if (latency > 100 || packetLoss > 1 || bandwidth < 2000) {
      quality = 'good';
    }

    return { bandwidth, latency, packetLoss, quality };
  }

  private async adaptBitrate(quality: NetworkQuality) {
    if (!this.peerConnection) return;

    const senders = this.peerConnection.getSenders();
    
    for (const sender of senders) {
      if (!sender.track) continue;

      const params = sender.getParameters();
      if (params.encodings && params.encodings.length > 0) {
        const encoding = params.encodings[0];
        
        // Adjust bitrate based on quality
        if (quality.quality === 'poor') {
          encoding.maxBitrate = sender.track.kind === 'video' ? 300000 : 64000; // 300kbps video, 64kbps audio
        } else if (quality.quality === 'fair') {
          encoding.maxBitrate = sender.track.kind === 'video' ? 500000 : 128000; // 500kbps video, 128kbps audio
        } else if (quality.quality === 'good') {
          encoding.maxBitrate = sender.track.kind === 'video' ? 1000000 : 256000; // 1Mbps video, 256kbps audio
        } else {
          encoding.maxBitrate = sender.track.kind === 'video' ? 2000000 : 320000; // 2Mbps video, 320kbps audio
        }

        try {
          await sender.setParameters(params);
        } catch (error) {
          console.error('Failed to set bitrate:', error);
        }
      }
    }
  }

  setQualitySettings(settings: Partial<QualitySettings>) {
    this.qualitySettings = { ...this.qualitySettings, ...settings };
    
    // Apply quality settings immediately if connected
    if (this.peerConnection && this.peerConnection.connectionState === 'connected') {
      this.applyQualitySettings();
    }
  }

  private async applyQualitySettings() {
    if (!this.peerConnection) return;

    const senders = this.peerConnection.getSenders();
    
    for (const sender of senders) {
      if (!sender.track) continue;

      const params = sender.getParameters();
      if (params.encodings && params.encodings.length > 0) {
        const encoding = params.encodings[0];
        
        if (sender.track.kind === 'video') {
          switch (this.qualitySettings.video) {
            case 'low':
              encoding.maxBitrate = 200000;
              encoding.scaleResolutionDownBy = 2;
              break;
            case 'medium':
              encoding.maxBitrate = 500000;
              encoding.scaleResolutionDownBy = 1.5;
              break;
            case 'high':
              encoding.maxBitrate = 2000000;
              encoding.scaleResolutionDownBy = 1;
              break;
            default: // auto
              delete encoding.maxBitrate;
              delete encoding.scaleResolutionDownBy;
          }
        } else if (sender.track.kind === 'audio') {
          switch (this.qualitySettings.audio) {
            case 'low':
              encoding.maxBitrate = 64000;
              break;
            case 'medium':
              encoding.maxBitrate = 128000;
              break;
            case 'high':
              encoding.maxBitrate = 320000;
              break;
            default: // auto
              delete encoding.maxBitrate;
          }
        }

        try {
          await sender.setParameters(params);
        } catch (error) {
          console.error('Failed to apply quality settings:', error);
        }
      }
    }
  }

  getQualitySettings(): QualitySettings {
    return { ...this.qualitySettings };
  }

  cleanup() {
    if (this.qualityCheckInterval) {
      clearInterval(this.qualityCheckInterval);
      this.qualityCheckInterval = null;
    }
  }
}

// Noise Suppression utilities
export class AudioProcessor {
  private audioContext: AudioContext | null = null;
  private noiseSuppressionNode: AudioWorkletNode | null = null;

  async initializeNoiseSuppression(stream: MediaStream): Promise<MediaStream> {
    try {
      this.audioContext = new AudioContext();
      
      // Load noise suppression worklet (would need implementation)
      await this.audioContext.audioWorklet.addModule('/audio-worklets/noise-suppression.js');
      
      const source = this.audioContext.createMediaStreamSource(stream);
      this.noiseSuppressionNode = new AudioWorkletNode(this.audioContext, 'noise-suppression-processor');
      
      const destination = this.audioContext.createMediaStreamDestination();
      
      source.connect(this.noiseSuppressionNode);
      this.noiseSuppressionNode.connect(destination);
      
      return destination.stream;
    } catch (error) {
      console.error('Failed to initialize noise suppression:', error);
      return stream; // Return original stream if noise suppression fails
    }
  }

  enableNoiseSuppression(enabled: boolean) {
    if (this.noiseSuppressionNode) {
      this.noiseSuppressionNode.parameters.get('enabled')?.setValueAtTime(enabled ? 1 : 0, this.audioContext?.currentTime || 0);
    }
  }

  cleanup() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.noiseSuppressionNode = null;
  }
}