"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import TimeCounter from "@/components/TimeCounter";
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

interface BundleCardProps {
  bundle: BundleWithMetrics;
  isNew?: boolean;
}

export default function BundleCard({ bundle, isNew = false }: BundleCardProps) {
  return (
    <Link 
      href={`/index/${bundle._id}`}
      className={`flex flex-col justify-between h-[120px] bg-white rounded-[18px] p-4 border border-gray-200 hover:bg-gray-50 hover:border-gray-400 active:translate-y-[1px] transition-all duration-200 ${
        isNew ? 'animate-shake border-green-300 shadow-lg' : ''
      }`}
    >
      {/* Top section with image, title, and percentage */}
      <div className="flex items-start gap-3 flex-1 min-h-0">
        {/* Bundle Image */}
        <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
          {bundle.imageUrl ? (
            <Image 
              src={bundle.imageUrl} 
              alt={bundle.title}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Title */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-black line-clamp-2 leading-tight break-words overflow-hidden">
            {bundle.title}
          </h3>
        </div>
        
        {/* Performance Percentage */}
        {bundle.metrics && (
          <div className={`text-sm font-semibold flex-shrink-0 ${
            bundle.metrics.priceChangePercent > 0 
              ? 'text-green-600' 
              : bundle.metrics.priceChangePercent < 0 
                ? 'text-red-600' 
                : 'text-gray-600'
          }`}>
            {bundle.metrics.priceChangePercent > 0 ? '+' : bundle.metrics.priceChangePercent < 0 ? '-' : ''}{Math.abs(bundle.metrics.priceChangePercent).toFixed(2)}%
          </div>
        )}
      </div>
      
      {/* Bottom tags section */}
      <div className="flex items-center gap-1.5 overflow-hidden flex-shrink-0">
        {/* Time tag */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded-md flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
            <path d="M12 6v6l4 2"></path>
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
          <span className="text-xs text-black whitespace-nowrap">
            <TimeCounter date={bundle.createdAt} />
          </span>
        </div>
        
        {/* Initial Price tag */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded-md flex-shrink-0">
          <span className="text-xs text-gray-500">I:</span>
          <span className="text-xs text-black whitespace-nowrap">
            ${bundle.metrics?.initialPrice?.toFixed(2) || '0.00'}
          </span>
        </div>
        
        {/* Current Price tag */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded-md flex-shrink-0">
          <span className="text-xs text-gray-500">C:</span>
          <span className="text-xs text-black whitespace-nowrap">
            ${bundle.metrics?.currentPrice?.toFixed(2) || '0.00'}
          </span>
        </div>
        
        {/* Creator tag */}
        {bundle.twitterUsername && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded-md flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 flex-shrink-0">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs text-black whitespace-nowrap">
              @{bundle.twitterUsername}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
