"use client";

import React from "react";

interface Token {
  _id: string;
  address: string;
  name: string;
  symbol: string;
  price: number;
  logoURI?: string;
}

interface BundleTokenGridProps {
  tokens: Token[];
  totalPrice: number;
}

export default function BundleTokenGrid({ tokens, totalPrice }: BundleTokenGridProps) {
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {tokens.map((token) => {
        // Calculate token weight
        const weight = totalPrice > 0
          ? ((token.price || 0) / totalPrice) * 100
          : (1 / tokens.length) * 100;
          
        return (
          <div 
            key={token._id} 
            className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
          >
            <div className="p-5">
              <div className="flex items-center mb-4">
                {token.logoURI ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-3 border border-gray-200 shadow-sm">
                    <img
                      src={token.logoURI}
                      alt={`${token.symbol} logo`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#fff5eb] flex items-center justify-center mr-3 shadow-sm">
                    <span className="text-[#ff5c01] font-bold">{token.symbol.substring(0, 2)}</span>
                  </div>
                )}
                
                <div>
                  <div className="text-base font-bold text-gray-900">{token.symbol}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[150px]">{token.name}</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-3 bg-gray-50 p-2 rounded-lg">
                <div className="text-xs font-bold text-gray-500">Price</div>
                <div className="text-sm font-bold text-gray-900">{formatPrice(token.price)}</div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-xs font-bold text-gray-500">Weight</div>
                  <div className="text-sm font-bold text-gray-900">{weight.toFixed(1)}%</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      weight > 30 ? 'bg-[#ff5c01]' : 
                      weight > 15 ? 'bg-[#ff7a33]' : 
                      'bg-[#ff9966]'
                    }`}
                    style={{ width: `${Math.min(100, weight)}%` }}
                  ></div>
                </div>
              </div>
              
              <a 
                href={`https://solscan.io/token/${token.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-[#fff5eb] text-[#ff5c01] hover:bg-[#ffead3] hover:text-[#e65400] px-3 py-2 rounded-md flex items-center justify-center transition-colors font-bold"
              >
                View on Solscan
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
