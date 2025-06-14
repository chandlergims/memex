"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWebSocket } from './WebSocketProvider';
import CreateBundleModal from './CreateBundleModal';

const Navbar = () => {
  const { login, logout, authenticated, user } = usePrivy();
  const { isConnected, lastEvent } = useWebSocket();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
    <nav className="w-full bg-gradient-to-r from-[#ff5c01] via-[#ff7a01] to-[#ff8a01] px-4 py-4 shadow-md border-b border-[#ff9a01]">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-extrabold text-white">Bonks</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="create-button px-6 py-2 bg-white text-[#ff5c01] font-bold text-sm rounded-md hover:bg-gray-100 transition-all duration-200 cursor-pointer shadow-sm border border-[#ff5c01]"
          >
            Create
          </button>
          
          {authenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 text-white hover:text-gray-100 cursor-pointer"
              >
                {twitterUsername ? (
                  <>
                    <span className="text-sm font-bold">@{twitterUsername}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                ) : (
                  <span className="text-sm font-bold">Account</span>
                )}
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 overflow-hidden">
                  <Link 
                    href="/profile" 
                    className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-[#ff5c01] transition-colors cursor-pointer flex items-center border-b border-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                  
                  <Link 
                    href="/leaderboard" 
                    className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-[#ff5c01] transition-colors cursor-pointer flex items-center border-b border-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Leaderboard
                  </Link>
                  
                  <button
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-[#ff5c01] transition-colors cursor-pointer flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={login}
              className="px-6 py-2 bg-white text-[#ff5c01] font-bold text-sm rounded-md hover:bg-gray-100 transition-all duration-200 cursor-pointer shadow-sm border border-[#ff5c01]"
            >
              Connect
            </button>
          )}
        </div>
        
        <div className="md:hidden">
          {/* Mobile menu button - not implemented for simplicity */}
          <button className="text-white hover:text-gray-100">
            Menu
          </button>
        </div>
      </div>
      
      {/* Create Bundle Modal */}
      <CreateBundleModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
