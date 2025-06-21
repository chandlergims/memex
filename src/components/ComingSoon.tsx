"use client";

import React, { useEffect } from 'react';
import Image from 'next/image';

interface ComingSoonProps {
  isActive: boolean;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ isActive }) => {
  // Add custom font styles
  useEffect(() => {
    // Create style element if it doesn't exist
    if (!document.getElementById('custom-font-style')) {
      const style = document.createElement('style');
      style.id = 'custom-font-style';
      style.innerHTML = `
        @font-face {
          font-family: 'Fredoka';
          src: url('/fonts/Fredoka-VariableFont_wdth,wght.ttf') format('truetype');
          font-weight: 100 900;
          font-style: normal;
          font-display: swap;
        }
        
        .fredoka-font {
          font-family: 'Fredoka', sans-serif;
        }
      `;
      document.head.appendChild(style);
    }
    
    return () => {
      // Clean up the style element when component unmounts
      const style = document.getElementById('custom-font-style');
      if (style) {
        style.remove();
      }
    };
  }, []);
  if (isActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-transparent backdrop-blur-md">
      <div className="text-center p-8 max-w-2xl">
        <div className="mb-8">
          <Image 
            src="/navbarlogo.png" 
            alt="Bonks Logo" 
            width={200} 
            height={60} 
            className="mx-auto"
            priority
          />
        </div>
        
        <p className="text-xs font-bold text-[#ff9a61] mb-6 fredoka-font" style={{ fontSize: '14px', letterSpacing: '0.5px' }}>
          Coming Soon
        </p>
        
        
        <div className="flex justify-center space-x-6">
          <a 
            href="https://twitter.com/bonksdotapp" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#ff5c01] hover:text-[#ff7c31] transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
