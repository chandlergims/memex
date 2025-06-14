"use client";

import React from "react";

export default function BundleCardSkeleton() {
  return (
    <div className="bg-white shadow-sm overflow-hidden flex flex-col relative animate-pulse">
      <div className="p-4">
        <div className="flex items-center">
          {/* Skeleton Bundle Image */}
          <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 mr-3"></div>
          
          <div className="flex-grow">
            <div className="flex justify-between items-center">
              <div className="max-w-[150px]">
                {/* Skeleton Title */}
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                {/* Skeleton Description */}
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              
              <div className="flex items-center ml-2">
                <div className="flex flex-col items-end mr-4">
                  {/* Skeleton Price */}
                  <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                  {/* Skeleton Change */}
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
                
                {/* Skeleton Button */}
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
