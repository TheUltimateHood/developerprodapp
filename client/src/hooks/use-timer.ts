import { useState, useEffect, useRef } from "react";

export function useTimer(startTime?: Date) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (startTime) {
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
      setTime(elapsed);
      setIsRunning(true);
    }
  }, [startTime]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const start = () => {
    setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const reset = () => {
    setIsRunning(false);
    setTime(0);
  };

  return {
    time,
    isRunning,
    start,
    pause,
    reset,
  };
}
