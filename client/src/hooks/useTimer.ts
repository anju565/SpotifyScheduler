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
  
  // Store session data for reporting
  const recordSession = (type: 'study' | 'break', duration: number, completed: boolean) => {
    try {
      const sessionData = JSON.parse(localStorage.getItem('studySessionsData') || '[]');
      const currentSession = {
        id: Date.now(),
        type: type,
        date: new Date().toISOString(),
        duration: duration,
        completed: completed
      };
      sessionData.push(currentSession);
      localStorage.setItem('studySessionsData', JSON.stringify(sessionData));
    } catch (e) {
      console.error('Failed to save session data', e);
    }
  };

  // Handle timer logic
  useEffect(() => {
    if (!isRunning) return;
    
    // Record session start if starting new
    if (timerRef.current === null) {
      recordSession(isStudyMode ? 'study' : 'break', 
                   isStudyMode ? studyDuration : breakDuration, 
                   false);
    }
    
    timerRef.current = window.setInterval(() => {
      setCurrentSeconds((prev) => {
        if (prev <= 1) {
          // Timer complete - record completed session
          recordSession(
            isStudyMode ? 'study' : 'break',
            isStudyMode ? studyDuration - 1 : breakDuration - 1,
            true
          );
          
          if (isStudyMode) {
            // Switch to break mode automatically
            setIsStudyMode(false);
            // Trigger study complete callback to play music
            onStudyComplete?.();
            // Auto-start the break timer
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
