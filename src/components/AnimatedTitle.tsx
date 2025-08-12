"use client";

import React, { useState, useEffect, useRef } from 'react';

export default function AnimatedTitle() {
  const [text, setText] = useState('Daily Performing ');
  const [bonksText, setBonksText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(50); // Fast typing speed
  const textRef = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    if (isComplete) return;
    
    let ticker = setTimeout(() => {
      if (bonksText.length < 'BIFs'.length) {
        setBonksText('BIFs'.substring(0, bonksText.length + 1));
      } else {
        setIsComplete(true);
      }
    }, typingSpeed);

    return () => clearTimeout(ticker);
  }, [bonksText, isComplete, typingSpeed]);
  
  const renderStyledText = () => {
    return (
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-700">
        {text}{bonksText}
      </span>
    );
  };
  
  return (
    <h2 className="text-3xl font-bold relative min-h-[2rem] flex items-center justify-center">
      <span ref={textRef} className="inline-block">
        {renderStyledText()}
      </span>
      <span className={`border-r-2 border-green-600 h-6 ml-1 ${isComplete ? 'animate-blink' : ''}`}></span>
    </h2>
  );
}
