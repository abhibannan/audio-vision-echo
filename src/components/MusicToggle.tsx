
import React, { FC } from 'react';
import { Music } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import AudioFeedback from './AudioFeedback';
import { speak } from '../utils/speechUtils';

interface MusicToggleProps {
  isPlaying: boolean;
  onToggle: () => void;
}

const MusicToggle: FC<MusicToggleProps> = ({ isPlaying, onToggle }) => {
  const handleToggle = () => {
    const newState = !isPlaying;
    onToggle();
    speak(newState ? 'Background music enabled' : 'Background music disabled');
  };

  return (
    <AudioFeedback text={`Music toggle. Background music is currently ${isPlaying ? 'on' : 'off'}. Press to toggle.`}>
      <div className="flex items-center gap-2">
        <Music className={`h-5 w-5 ${isPlaying ? 'text-ai-purple' : 'text-muted-foreground'}`} />
        <Switch 
          checked={isPlaying}
          onCheckedChange={handleToggle}
          aria-label={`Background music is currently ${isPlaying ? 'on' : 'off'}`}
          className="focus-ring"
        />
        <span className="text-sm">Music</span>
      </div>
    </AudioFeedback>
  );
};

export default MusicToggle;
