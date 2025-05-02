
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import ThemeToggle from '@/components/ThemeToggle';
import MusicToggle from '@/components/MusicToggle';
import ImageRecognition from '@/components/ImageRecognition';
import AudioFeedback from '@/components/AudioFeedback';
import { initSpeech, speak, toggleBackgroundMusic } from '@/utils/speechUtils';
import { Switch } from '@/components/ui/switch';
import { Github, HelpCircle, Info, Settings, Share2, Volume2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

// Define available genres
const GENRES = ['General', 'Animals', 'Vehicles', 'Food', 'Nature'];

// Audio tracks available
const AUDIO_TRACKS = [
  { name: 'Ambient Music', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3' },
  { name: 'Soft Piano', url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8fbcfc959.mp3' },
  { name: 'Focus Mode', url: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92a7f.mp3' },
];

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('General');
  const [touchToSpeakEnabled, setTouchToSpeakEnabled] = useState<boolean>(true);
  const [selectedTrack, setSelectedTrack] = useState<number>(0);
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
      AUDIO_TRACKS[selectedTrack].url
    );
    setIsMusicPlaying(newState);
    
    // Show toast notification
    toast({
      title: newState ? "Music On" : "Music Off",
      description: newState ? `Now playing: ${AUDIO_TRACKS[selectedTrack].name}` : "Background music has been turned off",
      duration: 2000,
    });
  };
  
  // Change music track
  const changeTrack = (index: number) => {
    setSelectedTrack(index);
    if (isMusicPlaying) {
      // Toggle off then on to switch tracks
      const wasPlaying = toggleBackgroundMusic(true, '');
      setTimeout(() => {
        const newState = toggleBackgroundMusic(false, AUDIO_TRACKS[index].url);
        setIsMusicPlaying(newState);
        
        toast({
          title: "Track Changed",
          description: `Now playing: ${AUDIO_TRACKS[index].name}`,
          duration: 2000,
        });
      }, 100);
    }
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

  // Open help dialog
  const openHelp = () => {
    speak('AI Vision Help: This application uses artificial intelligence to recognize objects in images. Upload an image and the system will analyze it and provide predictions.');
    
    toast({
      title: "Help",
      description: "AI Vision uses machine learning to identify objects in your photos. Upload an image to get started.",
      duration: 5000,
    });
  };

  return (
    <div className="min-h-screen flex flex-col pb-10">
      {/* Header with toggles */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border py-4">
        <div className="container max-w-7xl mx-auto px-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-primary">AI Vision Echo</h1>
          
          <div className="flex items-center gap-4">
            <AudioFeedback text="Get help with using AI Vision" isButton={true}>
              <Button variant="ghost" size="icon" onClick={openHelp}>
                <HelpCircle className="h-5 w-5" />
              </Button>
            </AudioFeedback>
            
            <ThemeToggle isDarkMode={isDarkMode} onToggle={handleToggleTheme} />
            <MusicToggle isPlaying={isMusicPlaying} onToggle={handleToggleMusic} />

            <AudioFeedback text="Share AI Vision" isButton={true}>
              <Button variant="ghost" size="icon" onClick={() => speak("Share feature not yet implemented")}>
                <Share2 className="h-5 w-5" />
              </Button>
            </AudioFeedback>
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
          
          {/* Music track selection */}
          {isMusicPlaying && (
            <section>
              <h2 className="text-lg font-medium mb-3">Background Music</h2>
              <div className="flex flex-wrap gap-2">
                {AUDIO_TRACKS.map((track, index) => (
                  <AudioFeedback key={track.name} text={`${track.name} music track`} isButton={true}>
                    <Button 
                      variant={selectedTrack === index ? "default" : "outline"}
                      onClick={() => changeTrack(index)}
                      className="flex gap-2 items-center"
                    >
                      <Volume2 className="h-4 w-4" />
                      {track.name}
                    </Button>
                  </AudioFeedback>
                ))}
              </div>
            </section>
          )}
          
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
      
      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-border">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold">AI Vision Echo</h2>
              <p className="text-sm text-muted-foreground">
                Accessibility-first image recognition
              </p>
            </div>
            
            <div className="flex gap-6">
              <AudioFeedback text="About AI Vision" isButton={true}>
                <Button variant="ghost" size="sm" className="text-sm" onClick={() => speak("About AI Vision: An accessible image recognition tool powered by machine learning")}>
                  <Info className="h-4 w-4 mr-1" />
                  About
                </Button>
              </AudioFeedback>
              
              <AudioFeedback text="Settings" isButton={true}>
                <Button variant="ghost" size="sm" className="text-sm" onClick={() => speak("Settings page not yet implemented")}>
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </Button>
              </AudioFeedback>
              
              <AudioFeedback text="View source code on GitHub" isButton={true}>
                <Button variant="ghost" size="sm" className="text-sm" onClick={() => speak("GitHub repository not yet implemented")}>
                  <Github className="h-4 w-4 mr-1" />
                  GitHub
                </Button>
              </AudioFeedback>
            </div>
            
            <p className="text-xs text-muted-foreground">© 2025 AI Vision Echo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
