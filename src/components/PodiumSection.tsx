"use client";

import React from "react";
import Link from "next/link";
import { Bundle } from "@/types";
import AnimatedTitle from "./AnimatedTitle";
import LeaderboardPodium from "./LeaderboardPodium";

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
}

interface PodiumSectionProps {
  topPerformers: BundleWithMetrics[];
  loading: boolean;
  showLeaderboardLink?: boolean;
}

export default function PodiumSection({ topPerformers, loading, showLeaderboardLink = true }: PodiumSectionProps) {
  return (
    <div className="mb-12 relative">
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#fff5eb10] to-transparent rounded-xl -z-10"></div>
      <div className="absolute inset-0 bg-[url('/globe.svg')] bg-no-repeat bg-center opacity-5 -z-10"></div>
      
      <div className="text-center mb-8">
        <div className="inline-block relative">
          <AnimatedTitle />
          <div className="absolute -top-1 -left-2 -right-2 h-10 bg-gradient-to-r from-[#fff5eb00] via-[#fff5eb40] to-[#fff5eb00] rounded-full animate-shine"></div>
        </div>
        {showLeaderboardLink && (
          <div className="mt-2">
            <Link 
              href="/leaderboard" 
              className="px-4 py-2 bg-gradient-to-r from-green-50 to-white rounded-full shadow-sm text-green-600 hover:shadow-md transition-all duration-300 text-sm font-bold inline-flex items-center border border-green-200"
            >
              View Full Leaderboard
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
      
      {/* Use the LeaderboardPodium component */}
      <LeaderboardPodium topPerformers={topPerformers} loading={loading} />
    </div>
  );
}
