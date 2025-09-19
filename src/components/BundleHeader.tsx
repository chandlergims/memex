"use client";

import React from "react";
import Image from "next/image";
import TimeCounter from "@/components/TimeCounter";
import { usePrivy } from '@privy-io/react-auth';

interface Bundle {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  tokenAddresses: string[];
  initialPrice: number;
  currentPrice: number;
  priceChangePercent: number;
  createdAt: string;
  lastUpdated: string;
  userId?: string;
  twitterUsername?: string;
}

interface BundleHeaderProps {
  bundle: Bundle;
  tokenCount: number;
  onDelete: () => void;
  deleteLoading: boolean;
}

export default function BundleHeader({ bundle, tokenCount, onDelete, deleteLoading }: BundleHeaderProps) {
  const { user } = usePrivy();
  
  // Format the creation date to show exact time
  const createdDate = new Date(bundle.createdAt);
  const formattedCreationDate = createdDate.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Format Twitter username (remove @ if it already exists in the username)
  const twitterUsername = bundle.twitterUsername ? 
    (bundle.twitterUsername.startsWith('@') ? bundle.twitterUsername : `@${bundle.twitterUsername}`) : '';

  return (
    <div className="bg-white">
      <div className="p-4">
        <div className="flex items-start justify-between">
          {/* Left side: Bundle Image and Title */}
          <div className="flex items-start">
            <div className="mr-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-white flex-shrink-0 border border-gray-200 shadow-sm">
                {bundle.imageUrl ? (
                  <Image 
                    src={bundle.imageUrl} 
                    alt={bundle.title}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-black">{bundle.title}</h1>
                <div className="ml-3 flex items-center text-xs text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formattedCreationDate}</span>
                </div>
              </div>
              
              <div className="text-gray-600 mt-1 text-sm">
                <span className="font-medium">Created by:</span> {bundle.twitterUsername && (
                  <a 
                    href={`https://twitter.com/${bundle.twitterUsername.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black hover:text-gray-700 font-medium ml-1"
                  >
                    {twitterUsername}
                  </a>
                )}
              </div>
              
              {bundle.description && (
                <p className="text-gray-600 mt-1 max-w-2xl text-sm">{bundle.description}</p>
              )}
            </div>
          </div>
          
          {/* Right side: Token count */}
          <div>
            <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-black text-white rounded-md">
              {tokenCount} tokens
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
