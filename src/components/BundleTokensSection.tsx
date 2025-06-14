"use client";

import React, { useState } from "react";
import BundleTokenGrid from "./BundleTokenGrid";

interface Token {
  _id: string;
  address: string;
  name: string;
  symbol: string;
  price: number;
  logoURI?: string;
}

interface BundleTokensSectionProps {
  tokens: Token[];
  totalPrice: number;
}

export default function BundleTokensSection({ tokens, totalPrice }: BundleTokensSectionProps) {
  const TOKENS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate total pages
  const totalPages = Math.ceil(tokens.length / TOKENS_PER_PAGE);
  
  // Get current tokens for the page
  const indexOfLastToken = currentPage * TOKENS_PER_PAGE;
  const indexOfFirstToken = indexOfLastToken - TOKENS_PER_PAGE;
  const currentTokens = tokens.slice(indexOfFirstToken, indexOfLastToken);
  
  return (
    <div className="bg-white">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Index Composition</h2>
          
          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Previous page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <span className="text-sm text-gray-600">
                {currentPage} / {totalPages}
              </span>
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Next page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <div className="min-h-[500px]">
          <BundleTokenGrid tokens={currentTokens} totalPrice={totalPrice} />
        </div>
      </div>
    </div>
  );
}
