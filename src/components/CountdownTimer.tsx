"use client";

import { useState, useEffect, useRef } from 'react';

interface CountdownTimerProps {
  intervalMinutes: number;
  className?: string;
}

/**
 * A component that displays a countdown timer to the next interval
 * For example, if intervalMinutes is 5, it will count down to the next 5-minute mark (0, 5, 10, 15, etc.)
 */
export default function CountdownTimer({ intervalMinutes, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number }>({ minutes: 0, seconds: 0 });
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Function to calculate time left until next interval
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentMinute = now.getMinutes();
      const currentSecond = now.getSeconds();
      
      // Find the next 5-minute mark (0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55)
      const remainder = currentMinute % intervalMinutes;
      const minutesToNext = remainder === 0 && currentSecond === 0 
        ? intervalMinutes 
        : intervalMinutes - remainder;
      
      // Calculate total seconds left
      const secondsLeft = (minutesToNext * 60) - currentSecond;
      
      return {
        minutes: Math.floor(secondsLeft / 60),
        seconds: secondsLeft % 60
      };
    };
    
    // Initial calculation
    setTimeLeft(calculateTimeLeft());
    
    // Update every second
    intervalIdRef.current = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    // Clean up the interval when the component unmounts
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [intervalMinutes]);
  
  return (
    <span className={className}>
      {timeLeft.minutes}:{timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds}
    </span>
  );
}
