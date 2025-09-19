"use client";

import React from "react";

interface BundleMetrics {
  initialPrice: number;
  currentPrice: number;
  priceChangePercent: number;
  totalPrice: number;
  tokenCount: number;
}

interface BundleStatsProps {
  metrics: BundleMetrics;
}

export default function BundleStats({ metrics }: BundleStatsProps) {
  // Format price with appropriate decimal places
  const formatPrice = (price: number): string => {
    if (price === 0) return "$0";
    
    if (price < 0.001) {
      return `$${price.toFixed(6)}`;
    } else if (price < 0.01) {
      return `$${price.toFixed(5)}`;
    } else if (price < 0.1) {
      return `$${price.toFixed(4)}`;
    } else if (price < 1) {
      return `$${price.toFixed(3)}`;
    } else if (price < 10) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    }
  };

  // Helper function to render price change with arrow
  const renderPriceChange = (change: number) => {
    const isPositive = change > 0;
    const isNegative = change < 0;
    const color = isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600';
    
    return (
      <div className={`text-lg font-bold flex items-center ${color}`}>
        {isPositive ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="mr-1" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0z"/>
          </svg>
        ) : isNegative ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="mr-1" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M13.5 13.5a.5.5 0 0 0 .5-.5v-6a.5.5 0 0 0-1 0v4.793L2.854 1.646a.5.5 0 1 0-.708.708L12.293 12.5H7.5a.5.5 0 0 0 0 1h6z"/>
          </svg>
        ) : null}
        {Math.abs(change).toFixed(2)}%
      </div>
    );
  };

  return (
    <div className="p-4 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <div className="text-xs font-bold text-gray-700 mb-1">Initial Price</div>
          <div className="text-lg font-bold text-black">
            {formatPrice(metrics.initialPrice)}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <div className="text-xs font-bold text-gray-700 mb-1">Current Price</div>
          <div className="text-lg font-bold text-black">
            {formatPrice(metrics.currentPrice)}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <div className="text-xs font-bold text-gray-700 mb-1">Performance</div>
          {renderPriceChange(metrics.priceChangePercent)}
        </div>
      </div>
    </div>
  );
}
