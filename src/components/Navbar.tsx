"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePrivy } from '@privy-io/react-auth';
import { useWebSocket } from './WebSocketProvider';

const Navbar = () => {
  const { login, logout, authenticated, user } = usePrivy();
  const { isConnected, lastEvent } = useWebSocket();
  
  const twitterUsername = user?.twitter?.username;
  return (
    <nav className="w-full bg-white border-b border-gray-200 px-4 py-3">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/next.svg"
              alt="Next.js Logo"
              width={100}
              height={24}
              priority
            />
          </Link>
        </div>
        
        <div className="hidden md:flex space-x-8">
          <Link href="/tokens" className="text-gray-700 hover:text-gray-900 font-medium">
            Tokens
          </Link>
          <Link href="/create" className="text-gray-700 hover:text-gray-900 font-medium">
            Create
          </Link>
          <Link href="#" className="text-gray-700 hover:text-gray-900 font-medium">
            About
          </Link>
        </div>
        
        <div className="flex items-center">
          {/* WebSocket connection indicator */}
          <div className="mr-4 flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
              {lastEvent && isConnected && ` • Last event: ${lastEvent.type}`}
            </span>
          </div>
          
          {authenticated ? (
            <div className="flex items-center">
              {twitterUsername && (
                <span className="text-sm text-gray-600 mr-3">
                  @{twitterUsername}
                </span>
              )}
              <button
                onClick={logout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Login with Twitter
            </button>
          )}
        </div>
        
        <div className="md:hidden">
          {/* Mobile menu button - not implemented for simplicity */}
          <button className="text-gray-700 hover:text-gray-900">
            Menu
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
