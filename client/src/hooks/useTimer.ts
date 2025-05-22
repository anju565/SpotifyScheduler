import { useState, useEffect, useRef } from "react";

interface UseTimerProps {
  defaultStudyDuration: number;
  defaultBreakDuration: number;
  onStudyComplete?: () => void;
  onBreakComplete?: () => void;
}

export function useTimer({ 
  defaultStudyDuration, 
  defaultBreakDuration,
  onStudyComplete,
  onBreakComplete
}: UseTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isStudyMode, setIsStudyMode] = useState(true);
  const [studyDuration, setStudyDuration] = useState(defaultStudyDuration);
  const [breakDuration, setBreakDuration] = useState(defaultBreakDuration);
  const [currentSeconds, setCurrentSeconds] = useState(defaultStudyDuration);
  const [playNotification, setPlayNotification] = useState(true);
  
  const timerRef = useRef<number | null>(null);
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Handle timer logic
  useEffect(() => {
    if (!isRunning) return;
    
    timerRef.current = window.setInterval(() => {
      setCurrentSeconds((prev) => {
        if (prev <= 1) {
          // Timer complete
          if (isStudyMode) {
            // Switch to break mode
            setIsStudyMode(false);
            // Trigger study complete callback to play music
            onStudyComplete?.();
            return breakDuration;
          } else {
            // Switch back to study mode
            setIsStudyMode(true);
            onBreakComplete?.();
            return studyDuration;
          }
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, isStudyMode, studyDuration, breakDuration, onStudyComplete, onBreakComplete]);
  
  // When study or break duration changes, update the current seconds if not running
  useEffect(() => {
    if (!isRunning && isStudyMode) {
      setCurrentSeconds(studyDuration);
    }
  }, [studyDuration, isRunning, isStudyMode]);
  
  useEffect(() => {
    if (!isRunning && !isStudyMode) {
      setCurrentSeconds(breakDuration);
    }
  }, [breakDuration, isRunning, isStudyMode]);
  
  const start = () => {
    setIsRunning(true);
  };
  
  const pause = () => {
    setIsRunning(false);
  };
  
  const reset = () => {
    pause();
    if (!isStudyMode) {
      setIsStudyMode(true);
    }
    setCurrentSeconds(studyDuration);
  };
  
  const skip = () => {
    pause();
    if (isStudyMode) {
      setIsStudyMode(false);
      setCurrentSeconds(breakDuration);
      onStudyComplete?.();
    } else {
      setIsStudyMode(true);
      setCurrentSeconds(studyDuration);
      onBreakComplete?.();
    }
  };
  
  return {
    isRunning,
    isStudyMode,
    currentSeconds,
    studyDuration,
    breakDuration,
    playNotification,
    setStudyDuration,
    setBreakDuration,
    setPlayNotification,
    start,
    pause,
    reset,
    skip,
  };
}
