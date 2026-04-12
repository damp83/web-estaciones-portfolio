import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const PresentationContext = createContext();

export const PresentationProvider = ({ children }) => {
  const [isPresenting, setIsPresenting] = useState(false);
  const [timerType, setTimerType] = useState(null); // 'estacion', 'cambio', null
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Fullscreen management
  const togglePresentation = useCallback(async () => {
    if (!isPresenting) {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.warn('Error attempting to enable fullscreen:', err);
      }
      setIsPresenting(true);
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      setIsPresenting(false);
      stopTimer();
    }
  }, [isPresenting]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsPresenting(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      setIsFinished(true);
      playAlert();
      setTimeout(() => setIsFinished(false), 5000); // Reset visual alert after 5s
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startStation = (minutes) => {
    setTimerType('estacion');
    setTimeLeft(minutes * 60);
    setIsActive(true);
    setIsFinished(false);
  };

  const startChange = () => {
    setTimerType('cambio');
    setTimeLeft(60); // 1 minute
    setIsActive(true);
    setIsFinished(false);
  };

  const stopTimer = () => {
    setIsActive(false);
    setTimerType(null);
    setTimeLeft(0);
    setIsFinished(false);
  };

  const playAlert = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // Pitch A5
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
      
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 1);
    } catch (e) {
      console.warn('Audio alert failed', e);
    }
  };

  return (
    <PresentationContext.Provider value={{ 
      isPresenting, togglePresentation, 
      timerType, timeLeft, isActive, isFinished,
      startStation, startChange, stopTimer 
    }}>
      {children}
    </PresentationContext.Provider>
  );
};

export const usePresentation = () => useContext(PresentationContext);
