import React from 'react';

export default function CrownIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
    >
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 3.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 8.16 9.9 7s.94-2.1 2.1-2.1zm0 14.9c-3.52 0-6.58-2.79-7.86-6.71 2.01-.16 4.02-.42 6.03-.84 1.21-.26 2.45-.36 3.67-.36 1.21 0 2.45.1 3.67.36 2.01.42 4.02.68 6.03.84-1.28 3.92-4.34 6.71-7.86 6.71z" />
    </svg>
  );
}
