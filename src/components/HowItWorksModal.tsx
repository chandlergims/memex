"use client";

import React, { useEffect } from "react";

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-black">How It Works</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="text-center">
            <p className="text-gray-600 text-xs mb-4">
              Create custom token indexes on Solana and compete for daily cash rewards based on performance!
            </p>
            
            <div className="space-y-3 text-left">
              <div className="flex items-start text-xs">
                <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center font-bold text-xs mr-3 mt-0.5 flex-shrink-0">1</div>
                <div>
                  <div className="font-semibold text-black mb-0.5">Select Your Tokens</div>
                  <div className="text-gray-600">Choose from existing SPL tokens or add your own custom tokens to create a diversified index</div>
                </div>
              </div>
              
              <div className="flex items-start text-xs">
                <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center font-bold text-xs mr-3 mt-0.5 flex-shrink-0">2</div>
                <div>
                  <div className="font-semibold text-black mb-0.5">Create Your Index</div>
                  <div className="text-gray-600">Bundle your selected tokens into a custom index. We track the initial total value when created and monitor performance over time</div>
                </div>
              </div>
              
              <div className="flex items-start text-xs">
                <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center font-bold text-xs mr-3 mt-0.5 flex-shrink-0">3</div>
                <div>
                  <div className="font-semibold text-black mb-0.5">Live Price Tracking</div>
                  <div className="text-gray-600">Prices update every 5 minutes. Your index performance is calculated as: (Current Total Value - Initial Value) / Initial Value × 100</div>
                </div>
              </div>
              
              <div className="flex items-start text-xs">
                <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center font-bold text-xs mr-3 mt-0.5 flex-shrink-0">4</div>
                <div>
                  <div className="font-semibold text-black mb-0.5">Compete & Earn</div>
                  <div className="text-gray-600">Your index competes on the leaderboard based on percentage gain. Rankings update in real-time as prices change!</div>
                </div>
              </div>
              
              <div className="flex items-start text-xs">
                <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center font-bold text-xs mr-3 mt-0.5 flex-shrink-0">5</div>
                <div>
                  <div className="font-semibold text-black mb-0.5">Get Rewarded</div>
                  <div className="text-gray-600">Daily prizes: 1st place $1,000, 2nd place $500, 3rd place $250, plus rewards for top 50 performers</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-800">
                  <strong className="text-blue-900">How Performance is Calculated:</strong> When you create an index, we record the total USD value of all tokens at that moment. Every 5 minutes, we recalculate the current total value and determine your percentage gain or loss. Higher gains = higher leaderboard position!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm cursor-pointer"
          >
            Start Creating Indexes
          </button>
        </div>
      </div>
    </div>
  );
}
