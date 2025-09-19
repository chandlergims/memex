"use client";

import React from "react";
import Link from "next/link";
import { Bundle } from "@/types";
import AnimatedTitle from "./AnimatedTitle";
import LeaderboardPodium from "./LeaderboardPodium";
import EndOfDayTimer from "./EndOfDayTimer";

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
    <div className="mb-12">
      <div className="text-center mb-6">
        <EndOfDayTimer />
      </div>
      
      {/* Use the LeaderboardPodium component */}
      <LeaderboardPodium topPerformers={topPerformers} loading={loading} />
    </div>
  );
}
