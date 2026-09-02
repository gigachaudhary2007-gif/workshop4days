import React, { createContext, useContext, useEffect, useState } from 'react';
import { soundEffects } from '../utils/soundEffects';

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playPop: () => void;
  playClick: () => void;
  playWhoosh: () => void;
  playSuccess: () => void;
  playToggle: (isOn: boolean) => void;
  playFolderOpen: () => void;
  playTabSwitch: () => void;
}

const SoundContext = createContext<SoundContextType>({
  isMuted: false,
  toggleMute: () => {},
  playPop: () => {},
  playClick: () => {},
  playWhoosh: () => {},
  playSuccess: () => {},
  playToggle: () => {},
  playFolderOpen: () => {},
  playTabSwitch: () => {},
});

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEffects.getMuted());

  useEffect(() => {
    const unsubscribe = soundEffects.subscribe((muted) => {
      setIsMuted(muted);
    });
    return unsubscribe;
  }, []);

  const toggleMute = () => {
    soundEffects.toggleMuted();
  };

  return (
    <SoundContext.Provider
      value={{
        isMuted,
        toggleMute,
        playPop: () => soundEffects.playPop(),
        playClick: () => soundEffects.playClick(),
        playWhoosh: () => soundEffects.playWhoosh(),
        playSuccess: () => soundEffects.playSuccess(),
        playToggle: (isOn: boolean) => soundEffects.playToggle(isOn),
        playFolderOpen: () => soundEffects.playFolderOpen(),
        playTabSwitch: () => soundEffects.playTabSwitch(),
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
