
import React, { FC, useEffect, useRef } from 'react';
import { speak } from '../utils/speechUtils';

// Props for the AudioFeedback component
interface AudioFeedbackProps {
  children: React.ReactNode;
  text: string;
  disabled?: boolean;
  isButton?: boolean;
}

// AudioFeedback component that provides speech feedback on hover
const AudioFeedback: FC<AudioFeedbackProps> = ({ children, text, disabled = false, isButton = false }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleMouseEnter = () => {
      if (!disabled) {
        speak(text);
      }
    };
    
    const handleFocus = () => {
      if (!disabled) {
        speak(text);
      }
    };
    
    const element = elementRef.current;
    
    if (element) {
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('focus', handleFocus);
      
      return () => {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('focus', handleFocus);
      };
    }
  }, [text, disabled]);
  
  return (
    <div 
      ref={elementRef}
      className={`${isButton ? "cursor-pointer" : ""}`}
      tabIndex={isButton ? 0 : -1}
      role={isButton ? "button" : undefined}
      aria-label={text}
    >
      {children}
    </div>
  );
};

export default AudioFeedback;
