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
      <div className="p-6">
        <div className="flex items-start justify-between">
          {/* Left side: Bundle Image and Title */}
          <div className="flex items-start">
            <div className="mr-6">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-white flex-shrink-0 border border-gray-200 shadow-sm">
                {bundle.imageUrl ? (
                  <Image 
                    src={bundle.imageUrl} 
                    alt={bundle.title}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#fff5eb] text-[#ff5c01]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">{bundle.title}</h1>
                <div className="ml-4 flex items-center text-sm text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">{formattedCreationDate}</span>
                </div>
              </div>
              
              <div className="text-gray-600 mt-2">
                <span className="font-bold">Created by:</span> {bundle.twitterUsername && (
                  <a 
                    href={`https://twitter.com/${bundle.twitterUsername.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#ff5c01] hover:text-[#e65400] font-bold"
                  >
                    {twitterUsername}
                  </a>
                )}
              </div>
              
              {bundle.description && (
                <p className="text-gray-600 mt-2 max-w-2xl">{bundle.description}</p>
              )}
            </div>
          </div>
          
          {/* Right side: Token count */}
          <div>
            <span className="inline-flex items-center px-4 py-2 text-sm font-bold bg-orange-500 text-white rounded-lg shadow-sm">
              {tokenCount} tokens
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
