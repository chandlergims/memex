"use client";

import { useState, useEffect } from 'react';

export default function EndOfDayTimer() {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({ 
    hours: 0, 
    minutes: 0, 
    seconds: 0 
  });
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay.getTime() - now.getTime();
      
      if (diff <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      return { hours, minutes, seconds };
    };
    
    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatNumber = (num: number) => num.toString().padStart(2, '0');
  
  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center space-x-1 font-mono text-2xl font-bold text-black">
        <span>{formatNumber(timeLeft.hours)}</span>
        <span>:</span>
        <span>{formatNumber(timeLeft.minutes)}</span>
        <span>:</span>
        <span>{formatNumber(timeLeft.seconds)}</span>
      </div>
    </div>
  );
}
