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
    <div 
      className={`${
        isNew 
          ? 'bg-white shadow-md animate-shake' 
          : 'bg-white shadow-sm hover:shadow-md'
      } transition-all duration-300 overflow-hidden flex flex-col relative`}
    >
      <div className="absolute top-1 right-2 text-[10px] text-gray-400">
        <TimeCounter date={bundle.createdAt} />
      </div>
      <div className="p-4">
        <div className="flex items-center">
          {/* Bundle Image (if available) */}
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 mr-3">
            {bundle.imageUrl ? (
              <Image 
                src={bundle.imageUrl} 
                alt={bundle.title}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#fff5eb] text-[#ff5c01]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            )}
          </div>
          
          <div className="flex-grow">
            <div className="flex justify-between items-center">
                <div className="max-w-[150px] overflow-hidden">
                <h2 className="text-sm font-semibold text-gray-800 truncate">{bundle.title}</h2>
                {bundle.description && (
                  <p className="text-xs text-gray-500 truncate">{bundle.description}</p>
                )}
              </div>
              
              <div className="flex items-center ml-2">
                <div className="flex flex-col items-end mr-4">
                  <span className="text-sm font-bold">
                    ${bundle.metrics?.currentPrice.toLocaleString() || '0.00'}
                  </span>
                  
                  {bundle.metrics && (
                    <div className={`text-xs font-medium flex items-center ${
                      bundle.metrics.priceChangePercent > 0 
                        ? 'text-green-600' 
                        : bundle.metrics.priceChangePercent < 0 
                          ? 'text-red-600' 
                          : 'text-gray-600'
                    }`}>
                      {bundle.metrics.priceChangePercent > 0 ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-arrow-up-right mr-1" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0z"/>
                        </svg>
                      ) : bundle.metrics.priceChangePercent < 0 ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-arrow-down-right mr-1" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M13.5 13.5a.5.5 0 0 0 .5-.5v-6a.5.5 0 0 0-1 0v4.793L2.854 1.646a.5.5 0 1 0-.708.708L12.293 12.5H7.5a.5.5 0 0 0 0 1h6z"/>
                        </svg>
                      ) : null}
                      {Math.abs(bundle.metrics.priceChangePercent).toFixed(2)}%
                    </div>
                  )}
                </div>
                
                <Link 
                  href={`/bifs/${bundle._id}`}
                  className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-200"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
