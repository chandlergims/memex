"use client";

import React from "react";

export default function BundleDetailsLoading() {
  return (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white shadow-md rounded-lg mb-6 overflow-hidden">
        <div className="relative">
          {/* Background Banner */}
          <div className="h-32 bg-gray-200"></div>
          
          {/* Bundle Image */}
          <div className="absolute left-8 -bottom-12">
            <div className="w-24 h-24 rounded-full bg-gray-300 border-4 border-white"></div>
          </div>
        </div>
        
        <div className="pt-16 pb-6 px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div className="mb-4 md:mb-0">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="h-10 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded w-40"></div>
            </div>
          </div>
          
          <div className="flex items-center mt-6">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
      
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
      
      {/* Tokens Section Skeleton */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="flex space-x-2">
              <div className="h-9 w-9 bg-gray-200 rounded"></div>
              <div className="h-9 w-9 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 h-48"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
