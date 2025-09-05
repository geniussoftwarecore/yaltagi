import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';

interface Participant {
  id: string;
  name: string;
  stream?: MediaStream;
  isHost?: boolean;
}

interface WebRTCHook {
  localStream: MediaStream | null;
  participants: Participant[];
  isConnected: boolean;
  error: string | null;
  startCall: (roomId: string) => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
}

const STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export function useWebRTC(): WebRTCHook {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const roomIdRef = useRef<string | null>(null);
  
  const { 
    username, 
    isMuted, 
    isCameraOn, 
    isScreenSharing,
    toggleMute: toggleMuteStore,
    toggleCamera: toggleCameraStore,
    toggleScreenShare: toggleScreenShareStore
  } = useAppStore();

  // Initialize local media stream
  const initializeLocalStream = useCallback(async (video: boolean = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? { width: 1280, height: 720 } : false,
        audio: true
      });
      
      setLocalStream(stream);
      return stream;
    } catch (err) {
      setError('Failed to access camera/microphone');
      console.error('Media access error:', err);
      return null;
    }
  }, []);

  // WebSocket connection
  const connectWebSocket = useCallback((roomId: string) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Join room
      wsRef.current?.send(JSON.stringify({
        type: 'join',
        roomId,
        username
      }));
    };
    
    wsRef.current.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      await handleWebSocketMessage(message);
    };
    
    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection failed');
    };
  }, [username]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback(async (message: any) => {
    switch (message.type) {
      case 'peer-joined':
        await handlePeerJoined(message);
        break;
      case 'offer':
        await handleOffer(message);
        break;
      case 'answer':
        await handleAnswer(message);
        break;
      case 'candidate':
        await handleCandidate(message);
        break;
      case 'peer-left':
        handlePeerLeft(message);
        break;
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback((peerId: string) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: STUN_SERVERS
    });
    
    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }
    
    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const remoteStream = event.streams[0];
      setParticipants(prev => prev.map(p => 
        p.id === peerId ? { ...p, stream: remoteStream } : p
      ));
    };
    
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        wsRef.current?.send(JSON.stringify({
          type: 'candidate',
          candidate: event.candidate,
          peerId
        }));
      }
    };
    
    peerConnectionsRef.current.set(peerId, peerConnection);
    return peerConnection;
  }, [localStream]);

  // Handle peer joined
  const handlePeerJoined = useCallback(async (message: any) => {
    const { peerId, username: peerName } = message;
    
    setParticipants(prev => [...prev, { id: peerId, name: peerName }]);
    
    const peerConnection = createPeerConnection(peerId);
    
    // Create offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    wsRef.current?.send(JSON.stringify({
      type: 'offer',
      offer,
      peerId
    }));
  }, [createPeerConnection]);

  // Handle offer
  const handleOffer = useCallback(async (message: any) => {
    const { offer, peerId } = message;
    
    const peerConnection = createPeerConnection(peerId);
    await peerConnection.setRemoteDescription(offer);
    
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    wsRef.current?.send(JSON.stringify({
      type: 'answer',
      answer,
      peerId
    }));
  }, [createPeerConnection]);

  // Handle answer
  const handleAnswer = useCallback(async (message: any) => {
    const { answer, peerId } = message;
    const peerConnection = peerConnectionsRef.current.get(peerId);
    
    if (peerConnection) {
      await peerConnection.setRemoteDescription(answer);
    }
  }, []);

  // Handle ICE candidate
  const handleCandidate = useCallback(async (message: any) => {
    const { candidate, peerId } = message;
    const peerConnection = peerConnectionsRef.current.get(peerId);
    
    if (peerConnection) {
      await peerConnection.addIceCandidate(candidate);
    }
  }, []);

  // Handle peer left
  const handlePeerLeft = useCallback((message: any) => {
    const { peerId } = message;
    
    const peerConnection = peerConnectionsRef.current.get(peerId);
    if (peerConnection) {
      peerConnection.close();
      peerConnectionsRef.current.delete(peerId);
    }
    
    setParticipants(prev => prev.filter(p => p.id !== peerId));
  }, []);

  // Start call
  const startCall = useCallback(async (roomId: string) => {
    try {
      roomIdRef.current = roomId;
      
      const stream = await initializeLocalStream();
      if (!stream) return;
      
      connectWebSocket(roomId);
    } catch (err) {
      setError('Failed to start call');
      console.error('Start call error:', err);
    }
  }, [initializeLocalStream, connectWebSocket]);

  // End call
  const endCall = useCallback(() => {
    // Close all peer connections
    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();
    
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setParticipants([]);
    setIsConnected(false);
    roomIdRef.current = null;
  }, [localStream]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        toggleMuteStore();
      }
    }
  }, [localStream, toggleMuteStore]);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        toggleCameraStore();
      }
    }
  }, [localStream, toggleCameraStore]);

  // Start screen share
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      const videoTrack = screenStream.getVideoTracks()[0];
      
      // Replace video track in all peer connections
      peerConnectionsRef.current.forEach(async (pc) => {
        const sender = pc.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      });
      
      toggleScreenShareStore();
      
      // Stop screen share when user stops sharing
      videoTrack.onended = () => {
        stopScreenShare();
      };
      
    } catch (err) {
      console.error('Screen share error:', err);
      setError('Failed to start screen sharing');
    }
  }, [toggleScreenShareStore]);

  // Stop screen share
  const stopScreenShare = useCallback(async () => {
    try {
      // Get camera stream again
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false
      });
      
      const videoTrack = cameraStream.getVideoTracks()[0];
      
      // Replace screen share track with camera track
      peerConnectionsRef.current.forEach(async (pc) => {
        const sender = pc.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      });
      
      if (isScreenSharing) {
        toggleScreenShareStore();
      }
      
    } catch (err) {
      console.error('Stop screen share error:', err);
    }
  }, [isScreenSharing, toggleScreenShareStore]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    localStream,
    participants,
    isConnected,
    error,
    startCall,
    endCall,
    toggleMute,
    toggleCamera,
    startScreenShare,
    stopScreenShare
  };
}