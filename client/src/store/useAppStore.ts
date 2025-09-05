import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Language and RTL
  language: 'ar' | 'en';
  direction: 'rtl' | 'ltr';
  setLanguage: (lang: 'ar' | 'en') => void;
  
  // User settings
  username: string;
  setUsername: (name: string) => void;
  
  // Meeting state
  currentRoom: string | null;
  isInMeeting: boolean;
  isMuted: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  
  // Device settings
  selectedCamera: string | null;
  selectedMicrophone: string | null;
  selectedSpeaker: string | null;
  
  // Meeting controls
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => void;
  
  // Device settings
  setSelectedCamera: (deviceId: string) => void;
  setSelectedMicrophone: (deviceId: string) => void;
  setSelectedSpeaker: (deviceId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Language and RTL
      language: 'ar',
      direction: 'rtl',
      setLanguage: (lang) => {
        const direction = lang === 'ar' ? 'rtl' : 'ltr';
        set({ language: lang, direction });
        
        // Update document direction
        document.documentElement.dir = direction;
        document.documentElement.lang = lang;
      },
      
      // User settings
      username: '',
      setUsername: (name) => set({ username: name }),
      
      // Meeting state
      currentRoom: null,
      isInMeeting: false,
      isMuted: false,
      isCameraOn: true,
      isScreenSharing: false,
      
      // Device settings
      selectedCamera: null,
      selectedMicrophone: null,
      selectedSpeaker: null,
      
      // Meeting controls
      joinRoom: (roomId) => set({ currentRoom: roomId, isInMeeting: true }),
      leaveRoom: () => set({ 
        currentRoom: null, 
        isInMeeting: false, 
        isScreenSharing: false 
      }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      toggleCamera: () => set((state) => ({ isCameraOn: !state.isCameraOn })),
      toggleScreenShare: () => set((state) => ({ isScreenSharing: !state.isScreenSharing })),
      
      // Device settings
      setSelectedCamera: (deviceId) => set({ selectedCamera: deviceId }),
      setSelectedMicrophone: (deviceId) => set({ selectedMicrophone: deviceId }),
      setSelectedSpeaker: (deviceId) => set({ selectedSpeaker: deviceId }),
    }),
    {
      name: 'yaltaqi-app-store',
      partialize: (state) => ({
        language: state.language,
        direction: state.direction,
        username: state.username,
        selectedCamera: state.selectedCamera,
        selectedMicrophone: state.selectedMicrophone,
        selectedSpeaker: state.selectedSpeaker,
      }),
    }
  )
);