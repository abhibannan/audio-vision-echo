
// Speech synthesis utility functions
let audioContext: AudioContext | null = null;
let backgroundMusicSource: MediaElementAudioSourceNode | null = null;
let backgroundMusicElement: HTMLAudioElement | null = null;

// Initialize speech synthesis
export const initSpeech = (): SpeechSynthesis => {
  return window.speechSynthesis;
};

// Speak text with the specified voice
export const speak = (text: string, rate = 1, pitch = 1, volume = 1): void => {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Get available voices and set English voice if available
  const voices = synth.getVoices();
  const englishVoice = voices.find(
    (voice) => voice.lang.includes("en") && !voice.lang.includes("en-GB")
  );
  
  if (englishVoice) {
    utterance.voice = englishVoice;
  }
  
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;
  
  // Cancel any previous speech
  synth.cancel();
  
  // Speak the text
  synth.speak(utterance);
};

// Initialize audio context for background music
export const initAudioContext = (): void => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
};

// Toggle background music
export const toggleBackgroundMusic = (isPlaying: boolean, musicPath: string): boolean => {
  initAudioContext();
  
  if (!audioContext) return false;
  
  if (isPlaying) {
    if (backgroundMusicElement) {
      backgroundMusicElement.pause();
      if (backgroundMusicSource) {
        backgroundMusicSource.disconnect();
        backgroundMusicSource = null;
      }
    }
    return false;
  } else {
    if (!backgroundMusicElement) {
      backgroundMusicElement = new Audio(musicPath);
      backgroundMusicElement.loop = true;
      backgroundMusicElement.volume = 0.3;
      
      // Add error handling for audio loading
      backgroundMusicElement.onerror = (e) => {
        console.error("Error loading audio:", e);
      };
    }
    
    if (audioContext && backgroundMusicElement) {
      backgroundMusicElement.play()
        .then(() => {
          if (audioContext) {
            backgroundMusicSource = audioContext.createMediaElementSource(backgroundMusicElement!);
            backgroundMusicSource.connect(audioContext.destination);
          }
        })
        .catch(err => {
          console.error("Error playing music:", err);
          return false;
        });
      return true;
    }
    
    return false;
  }
};

// Load example background music using an audio element
export const initBackgroundMusic = (musicPath: string): HTMLAudioElement => {
  const audio = new Audio(musicPath);
  audio.loop = true;
  audio.volume = 0.2;
  return audio;
};

// Clean up speech synthesis
export const cleanupSpeech = (): void => {
  const synth = window.speechSynthesis;
  synth.cancel();
  
  if (backgroundMusicElement) {
    backgroundMusicElement.pause();
    backgroundMusicElement.currentTime = 0;
  }
  
  if (backgroundMusicSource) {
    backgroundMusicSource.disconnect();
  }
  
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  
  backgroundMusicSource = null;
  backgroundMusicElement = null;
};
