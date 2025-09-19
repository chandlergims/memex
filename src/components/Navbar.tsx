"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWebSocket } from './WebSocketProvider';
import HowItWorksModal from './HowItWorksModal';

const Navbar = () => {
  const { login, logout, authenticated, user } = usePrivy();
  const { isConnected, lastEvent } = useWebSocket();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const twitterUsername = user?.twitter?.username;
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <nav className="w-full bg-white px-4 py-3 shadow-sm border-b border-gray-200">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
              <Image 
                src="/Untitled design (63).png" 
                alt="BIF Logo" 
                width={100} 
                height={30} 
                style={{ maxHeight: '40px', width: 'auto' }}
                priority
              />
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* How it works button */}
          <button
            onClick={() => setIsHowItWorksOpen(true)}
            className="flex items-center space-x-2 text-gray-700 hover:text-black cursor-pointer px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">how it works</span>
          </button>

          <Link
            href="/leaderboard"
            className="flex items-center space-x-2 text-gray-700 hover:text-black cursor-pointer px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm font-medium">leaderboard</span>
          </Link>

          {authenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-black cursor-pointer px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                {twitterUsername ? (
                  <>
                    <span className="text-sm font-medium">{twitterUsername}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                ) : (
                  <span className="text-sm font-medium">Account</span>
                )}
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl z-10 overflow-hidden border border-gray-200">
                  {/* User Info Section */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-semibold text-black">
                          {twitterUsername ? `${twitterUsername}` : 'User'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-1">
                    <Link 
                      href="/leaderboard" 
                      className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-black transition-colors cursor-pointer flex items-center"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Leaderboard
                    </Link>
                    
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                        </svg>
                        Log out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={login}
              className="px-5 py-2 bg-black text-white font-medium text-sm rounded-lg hover:bg-gray-800 transition-all duration-200 cursor-pointer"
            >
              connect x
            </button>
          )}
        </div>
        
        <div className="md:hidden">
          {/* Mobile menu button - not implemented for simplicity */}
          <button className="text-gray-700 hover:text-black">
            Menu
          </button>
        </div>
      </div>
      
      {/* How It Works Modal */}
      <HowItWorksModal 
        isOpen={isHowItWorksOpen} 
        onClose={() => setIsHowItWorksOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;
