"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Bundle } from "@/types";

interface BundleWithMetrics extends Bundle {
  metrics?: {
    initialPrice: number;
    currentPrice: number;
    priceChangePercent: number;
    totalPrice: number;
    tokenCount: number;
  };
  tokens?: any[];
  imageUrl?: string;
  twitterUsername?: string;
}

interface LeaderboardPodiumProps {
  topPerformers: BundleWithMetrics[];
  loading: boolean;
}

export default function LeaderboardPodium({ topPerformers, loading }: LeaderboardPodiumProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-end space-x-4 mb-4">
        {/* 2nd Place Skeleton */}
        <div className="flex flex-col items-center animate-pulse-subtle">
          <div className="bg-white border border-gray-200 rounded-full p-0.5 mb-1 shadow-md">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white w-24 h-20 flex flex-col items-center justify-center rounded-t-md shadow-md border border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
            </div>
              <div className="bg-black h-6 w-24 flex items-center justify-center rounded-b-md shadow-md">
                <div className="text-white font-bold text-xs">2nd</div>
              </div>
          <div className="mt-1 text-sm font-bold text-black">$500</div>
          </div>
        </div>
        
        {/* 1st Place Skeleton */}
        <div className="flex flex-col items-center animate-glow-subtle">
          <div className="bg-white border border-gray-200 rounded-full p-0.5 mb-1 shadow-md">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-100 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white w-28 h-24 flex flex-col items-center justify-center rounded-t-md shadow-md border border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
              <div className="bg-black h-7 w-28 flex items-center justify-center rounded-b-md shadow-md">
                <div className="text-white font-bold text-sm">1st</div>
              </div>
          <div className="mt-1 text-base font-bold text-black">$1,000</div>
          </div>
        </div>
        
        {/* 3rd Place Skeleton */}
        <div className="flex flex-col items-center animate-pulse-subtle">
          <div className="bg-white border border-gray-200 rounded-full p-0.5 mb-1 shadow-md">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white w-20 h-16 flex flex-col items-center justify-center rounded-t-md shadow-md border border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-14 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-10 animate-pulse"></div>
            </div>
              <div className="bg-black h-5 w-20 flex items-center justify-center rounded-b-md shadow-md">
                <div className="text-white font-bold text-xs">3rd</div>
              </div>
          <div className="mt-1 text-sm font-bold text-black">$250</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-end space-x-4 mb-4">
      {/* 2nd Place */}
      <div className="flex flex-col items-center animate-fade-in">
        {topPerformers[1] ? (
          <Link href={`/index/${topPerformers[1]._id}`} className="cursor-pointer transition-transform hover:scale-110">
            <div className="bg-white border border-gray-200 rounded-full p-0.5 mb-1 shadow-lg">
              {topPerformers[1]?.imageUrl ? (
                <Image 
                  src={topPerformers[1].imageUrl} 
                  alt={topPerformers[1].title}
                  width={96}
                  height={96}
                  className="w-12 h-12 rounded-full object-cover relative z-10"
                  priority
                />
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#fff5eb] text-[#ff5c01] relative z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              )}
            </div>
          </Link>
        ) : (
          <div className="bg-white border border-gray-200 rounded-full p-0.5 mb-1 shadow-md">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        )}
        <div className="text-center">
          {topPerformers[1] ? (
            <Link href={`/index/${topPerformers[1]._id}`} className="cursor-pointer hover:opacity-90 block">
              <div className="bg-white w-24 h-20 flex flex-col items-center justify-center rounded-t-md shadow-md border border-gray-200">
                <div className="text-sm font-bold text-black truncate max-w-[80px]">{topPerformers[1]?.title}</div>
                <div className={`font-bold text-sm ${
                  (topPerformers[1]?.metrics?.priceChangePercent || 0) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {(topPerformers[1]?.metrics?.priceChangePercent || 0) >= 0 ? '+' : ''}
                  {topPerformers[1]?.metrics?.priceChangePercent.toFixed(2)}%
                </div>
              </div>
              <div className="bg-black h-6 w-24 flex items-center justify-center rounded-b-md shadow-md">
                <div className="text-white font-bold text-xs">2nd</div>
              </div>
            </Link>
          ) : (
            <div>
              <div className="bg-white w-24 h-20 flex flex-col items-center justify-center rounded-t-md shadow-md border border-gray-200">
                <div className="text-sm font-bold text-gray-400">Empty</div>
              </div>
              <div className="bg-black h-6 w-24 flex items-center justify-center rounded-b-md shadow-md">
                <div className="text-white font-bold text-xs">2nd</div>
              </div>
            </div>
          )}
          <div className="mt-1 text-sm font-bold text-black">$500</div>
        </div>
      </div>
      
      {/* 1st Place */}
      <div className="flex flex-col items-center animate-fade-in-fast">
        {topPerformers[0] ? (
          <Link href={`/index/${topPerformers[0]._id}`} className="cursor-pointer transition-transform hover:scale-110">
            <div className="bg-white border border-gray-200 rounded-full p-0.5 mb-1 shadow-lg">
              {topPerformers[0]?.imageUrl ? (
                <Image 
                  src={topPerformers[0].imageUrl} 
                  alt={topPerformers[0].title}
                  width={112}
                  height={112}
                  className="w-14 h-14 rounded-full object-cover relative z-10"
                  priority
                />
              ) : (
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#fff5eb] text-[#ff5c01] relative z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              )}
            </div>
          </Link>
        ) : (
          <div className="bg-white border border-gray-200 rounded-full p-0.5 mb-1 shadow-md">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        )}
        <div className="text-center">
          {topPerformers[0] ? (
            <Link href={`/index/${topPerformers[0]._id}`} className="cursor-pointer hover:opacity-90 block">
              <div className="bg-white w-28 h-24 flex flex-col items-center justify-center rounded-t-md shadow-md border border-gray-200">
                <div className="text-base font-bold text-black truncate max-w-[90px]">{topPerformers[0]?.title}</div>
                <div className={`font-bold text-sm ${
                  (topPerformers[0]?.metrics?.priceChangePercent || 0) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {(topPerformers[0]?.metrics?.priceChangePercent || 0) >= 0 ? '+' : ''}
                  {topPerformers[0]?.metrics?.priceChangePercent.toFixed(2)}%
                </div>
              </div>
              <div className="bg-black h-7 w-28 flex items-center justify-center rounded-b-md shadow-md">
                <div className="text-white font-bold text-sm">1st</div>
              </div>
            </Link>
          ) : (
            <div>
              <div className="bg-white w-28 h-24 flex flex-col items-center justify-center rounded-t-md shadow-md border border-gray-200">
                <div className="text-base font-bold text-gray-400">Empty</div>
              </div>
              <div className="bg-black h-7 w-28 flex items-center justify-center rounded-b-md shadow-md">
                <div className="text-white font-bold text-sm">1st</div>
              </div>
            </div>
          )}
          <div className="mt-1 text-base font-bold text-black">$1,000</div>
        </div>
      </div>
      
      {/* 3rd Place */}
      <div className="flex flex-col items-center animate-fade-in">
        {topPerformers[2] ? (
          <Link href={`/index/${topPerformers[2]._id}`} className="cursor-pointer transition-transform hover:scale-110">
            <div className="bg-white border border-gray-200 rounded-full p-0.5 mb-1 shadow-lg">
              {topPerformers[2]?.imageUrl ? (
                <Image 
                  src={topPerformers[2].imageUrl} 
                  alt={topPerformers[2].title}
                  width={80}
                  height={80}
                  className="w-10 h-10 rounded-full object-cover relative z-10"
                  priority
                />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#fff5eb] text-[#ff5c01] relative z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              )}
            </div>
          </Link>
        ) : (
          <div className="bg-white border border-gray-200 rounded-full p-0.5 mb-1 shadow-md">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        )}
        <div className="text-center">
          {topPerformers[2] ? (
            <Link href={`/index/${topPerformers[2]._id}`} className="cursor-pointer hover:opacity-90 block">
              <div className="bg-white w-20 h-16 flex flex-col items-center justify-center rounded-t-md shadow-md border border-gray-200">
                <div className="text-sm font-bold text-black truncate max-w-[70px]">{topPerformers[2]?.title}</div>
                <div className={`font-bold text-sm ${
                  (topPerformers[2]?.metrics?.priceChangePercent || 0) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {(topPerformers[2]?.metrics?.priceChangePercent || 0) >= 0 ? '+' : ''}
                  {topPerformers[2]?.metrics?.priceChangePercent.toFixed(2)}%
                </div>
              </div>
              <div className="bg-black h-5 w-20 flex items-center justify-center rounded-b-md shadow-md">
                <div className="text-white font-bold text-xs">3rd</div>
              </div>
            </Link>
          ) : (
            <div>
              <div className="bg-white w-20 h-16 flex flex-col items-center justify-center rounded-t-md shadow-md border border-gray-200">
                <div className="text-sm font-bold text-gray-400">Empty</div>
              </div>
              <div className="bg-black h-5 w-20 flex items-center justify-center rounded-b-md shadow-md">
                <div className="text-white font-bold text-xs">3rd</div>
              </div>
            </div>
          )}
          <div className="mt-1 text-sm font-bold text-black">$250</div>
        </div>
      </div>
    </div>
  );
}
