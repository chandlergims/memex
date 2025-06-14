"use client";

import React from "react";

export default function LiveTickerBarSkeleton() {
  return (
    <div className="bg-white border-b border-gray-100 py-1.5 relative flex h-[40px] w-full items-center overflow-hidden">
      <div className="flex items-center space-x-8 animate-pulse px-4 overflow-x-auto w-full">
        {Array(11).fill(0).map((_, index) => (
          <div key={index} className="flex items-center">
            <div className="h-4 bg-gray-200 rounded w-20 mr-2"></div>
            <div className="h-5 bg-gray-200 rounded w-12"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
