"use client";

import { useState, useEffect, useRef } from 'react';

interface TimeCounterProps {
  date: Date | string | number;
  className?: string;
}

/**
 * A component that displays a live counter of seconds elapsed since the given date
 */
export default function TimeCounter({ date, className = "" }: TimeCounterProps) {
  const [seconds, setSeconds] = useState<number>(0);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    
    // Calculate initial seconds
    const startDate = date instanceof Date ? date : new Date(date);
    const initialSeconds = Math.floor((new Date().getTime() - startDate.getTime()) / 1000);
    setSeconds(initialSeconds);
    
    // Function to get the appropriate update interval based on elapsed time
    const getUpdateInterval = (elapsedSeconds: number) => {
      if (elapsedSeconds >= 86400) {
        // If days, update every hour
        return 3600000; // 1 hour
      } else if (elapsedSeconds >= 3600) {
        // If hours, update every minute
        return 60000; // 1 minute
      } else if (elapsedSeconds >= 60) {
        // If minutes, update every 10 seconds
        return 10000; // 10 seconds
      } else {
        // If seconds, update every second
        return 1000; // 1 second
      }
    };
    
    // Initial update interval
    let updateInterval = getUpdateInterval(initialSeconds);
    
    // Function to update the seconds and potentially adjust the interval
    const updateTime = () => {
      const newSeconds = Math.floor((new Date().getTime() - startDate.getTime()) / 1000);
      setSeconds(newSeconds);
      
      // Check if we need to adjust the interval
      const newInterval = getUpdateInterval(newSeconds);
      if (newInterval !== updateInterval) {
        // If the appropriate interval has changed, clear the current interval and set a new one
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
        }
        updateInterval = newInterval;
        intervalIdRef.current = setInterval(updateTime, updateInterval);
      }
    };
    
    // Set up the initial interval
    intervalIdRef.current = setInterval(updateTime, updateInterval);
    
    // Clean up the interval when the component unmounts
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [date]);
  
  // Format the time display
  const formatTime = () => {
    if (seconds < 60) {
      // Less than a minute: show seconds
      return `${seconds}s`;
    } else if (seconds < 3600) {
      // Less than an hour: show minutes
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m`;
    } else if (seconds < 86400) {
      // Less than a day: show hours
      const hours = Math.floor(seconds / 3600);
      return `${hours}h`;
    } else {
      // More than a day: show days
      const days = Math.floor(seconds / 86400);
      return `${days}d`;
    }
  };

  return (
    <span className={className}>
      {formatTime()}
    </span>
  );
}
