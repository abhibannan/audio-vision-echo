
import React, { FC } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import AudioFeedback from './AudioFeedback';
import { speak } from '../utils/speechUtils';

interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

const ThemeToggle: FC<ThemeToggleProps> = ({ isDarkMode, onToggle }) => {
  const handleToggle = () => {
    const newMode = !isDarkMode;
    onToggle();
    speak(newMode ? 'Dark mode enabled' : 'Light mode enabled');
  };

  return (
    <AudioFeedback text={`Theme toggle. Currently in ${isDarkMode ? 'dark' : 'light'} mode. Press to toggle.`}>
      <div className="flex items-center gap-2">
        <Sun className={`h-5 w-5 ${isDarkMode ? 'text-muted-foreground' : 'text-yellow-500'}`} />
        <Switch 
          checked={isDarkMode}
          onCheckedChange={handleToggle}
          aria-label={`Theme toggle. Currently in ${isDarkMode ? 'dark' : 'light'} mode`}
          className="focus-ring"
        />
        <Moon className={`h-5 w-5 ${isDarkMode ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
    </AudioFeedback>
  );
};

export default ThemeToggle;
