
import React, { FC, useState } from 'react';
import { Music, Volume2, VolumeX } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import AudioFeedback from './AudioFeedback';
import { speak } from '../utils/speechUtils';

interface MusicToggleProps {
  isPlaying: boolean;
  onToggle: () => void;
}

const MusicToggle: FC<MusicToggleProps> = ({ isPlaying, onToggle }) => {
  const [volume, setVolume] = useState<number>(0.3);
  
  const handleToggle = () => {
    const newState = !isPlaying;
    onToggle();
    speak(newState ? 'Background music enabled' : 'Background music disabled');
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (isPlaying && backgroundMusicElement) {
      backgroundMusicElement.volume = newVolume;
    }
  };

  return (
    <AudioFeedback text={`Music toggle. Background music is currently ${isPlaying ? 'on' : 'off'}. Press to toggle.`}>
      <div className="flex items-center gap-3">
        {isPlaying ? 
          <Volume2 className="h-5 w-5 text-ai-purple" /> : 
          <VolumeX className="h-5 w-5 text-muted-foreground" />
        }
        <Switch 
          checked={isPlaying}
          onCheckedChange={handleToggle}
          aria-label={`Background music is currently ${isPlaying ? 'on' : 'off'}`}
          className="focus-ring"
        />
        <span className="text-sm">Music</span>
        
        {isPlaying && (
          <div className="flex items-center ml-2">
            <input 
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-2"
              aria-label="Music volume"
            />
          </div>
        )}
      </div>
    </AudioFeedback>
  );
};

// Reference backgroundMusicElement from speechUtils for volume control
declare let backgroundMusicElement: HTMLAudioElement | null;

export default MusicToggle;
