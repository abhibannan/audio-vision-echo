
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import ThemeToggle from '@/components/ThemeToggle';
import MusicToggle from '@/components/MusicToggle';
import ImageRecognition from '@/components/ImageRecognition';
import AudioFeedback from '@/components/AudioFeedback';
import { initSpeech, speak, toggleBackgroundMusic } from '@/utils/speechUtils';
import { Switch } from '@/components/ui/switch';

// Define available genres
const GENRES = ['General', 'Animals', 'Vehicles', 'Food', 'Nature'];

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('General');
  const [touchToSpeakEnabled, setTouchToSpeakEnabled] = useState<boolean>(true);
  const { toast } = useToast();

  // Initialize speech synthesis and check system preferences
  useEffect(() => {
    // Initialize speech synthesis
    initSpeech();
    
    // Check user preference for dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    
    // Add dark mode class if needed
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }

    // Welcome message
    const timeoutId = setTimeout(() => {
      speak('Welcome to AI Vision. I can recognize objects in your images. Upload a photo to get started.');
    }, 1000);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // Toggle dark mode
  const handleToggleTheme = () => {
    setIsDarkMode(prev => !prev);
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };
  
  // Toggle background music
  const handleToggleMusic = () => {
    const newState = toggleBackgroundMusic(
      isMusicPlaying,
      'https://dl.dropboxusercontent.com/s/5s0rjw873doc7re/ambient-music.mp3'
    );
    setIsMusicPlaying(newState);
    
    // Show toast notification
    toast({
      title: newState ? "Music On" : "Music Off",
      description: newState ? "Background music is now playing" : "Background music has been turned off",
      duration: 2000,
    });
  };
  
  // Handle genre selection
  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
    speak(`Selected category: ${genre}`);
    
    toast({
      title: "Category Changed",
      description: `Now analyzing images for ${genre}`,
      duration: 2000,
    });
  };
  
  // Handle touch to speak toggle
  const handleTouchToSpeakToggle = () => {
    setTouchToSpeakEnabled(prev => !prev);
    speak(touchToSpeakEnabled 
      ? 'Touch to speak disabled. You will need to press the button to hear predictions.' 
      : 'Touch to speak enabled. Predictions will be spoken automatically.');
  };

  return (
    <div className="min-h-screen flex flex-col pb-10">
      {/* Header with toggles */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border py-4">
        <div className="container max-w-7xl mx-auto px-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-primary">AI Vision Echo</h1>
          
          <div className="flex items-center gap-4">
            <ThemeToggle isDarkMode={isDarkMode} onToggle={handleToggleTheme} />
            <MusicToggle isPlaying={isMusicPlaying} onToggle={handleToggleMusic} />
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Genre selection */}
          <section>
            <h2 className="text-lg font-medium mb-3">Select Recognition Category</h2>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <AudioFeedback key={genre} text={`${genre} category`} isButton={true}>
                  <button
                    className={`px-4 py-2 rounded-full transition-all focus-ring ${
                      selectedGenre === genre
                        ? 'bg-primary text-white font-medium'
                        : 'bg-secondary hover:bg-secondary/80 text-foreground'
                    }`}
                    onClick={() => handleGenreSelect(genre)}
                    aria-label={`${genre} category`}
                    aria-pressed={selectedGenre === genre}
                  >
                    {genre}
                  </button>
                </AudioFeedback>
              ))}
            </div>
          </section>
          
          {/* Touch to speak toggle */}
          <section>
            <Card className="p-4 w-full max-w-sm">
              <AudioFeedback text="Touch to speak toggle. When enabled, predictions will be spoken automatically." isButton={true}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Automatic Speech</span>
                  <Switch
                    checked={touchToSpeakEnabled}
                    onCheckedChange={handleTouchToSpeakToggle}
                    aria-label="Toggle automatic speech"
                  />
                </div>
              </AudioFeedback>
            </Card>
          </section>
          
          {/* Image recognition component */}
          <section>
            <ImageRecognition 
              selectedGenre={selectedGenre} 
              touchToSpeakEnabled={touchToSpeakEnabled} 
            />
          </section>
          
          {/* Accessibility information */}
          <section className="mt-8">
            <h2 className="text-lg font-medium mb-2">Accessibility Features</h2>
            <p className="text-sm text-muted-foreground">
              This application is designed to be fully accessible. Hover over or focus on any interactive element to hear spoken descriptions.
              Use the toggles above to customize your experience.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;
