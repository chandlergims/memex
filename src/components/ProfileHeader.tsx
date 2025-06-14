import React from 'react';

interface ProfileHeaderProps {
  twitterUsername: string | undefined;
  bundles: any[];
  bestRank: number | null; // Renamed to currentRank in the profile page
  solanaAddress: string;
  setSolanaAddress: (value: string) => void;
  isSavingAddress: boolean;
  updateSolanaAddress: () => void;
  addressError: string | null;
  addressSaved: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  twitterUsername,
  bundles,
  bestRank,
  solanaAddress,
  setSolanaAddress,
  isSavingAddress,
  updateSolanaAddress,
  addressError,
  addressSaved
}) => {
  return (
    <div className="bg-white rounded-xl p-8 mb-8 shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Left Column - Profile Image */}
        <div className="flex flex-col items-center">
          <div className="w-28 h-28 bg-[#ff5c01] rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-md">
            {twitterUsername ? twitterUsername.charAt(0).toUpperCase() : 'B'}
          </div>
          
          <div className="mt-4 text-center">
            <h1 className="text-xl font-bold text-gray-800">
              {twitterUsername ? `@${twitterUsername}` : 'Your Profile'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Member since June 2025</p>
          </div>
        </div>
        
        {/* Stats and Actions */}
        <div className="flex-1 flex flex-col justify-center w-full">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mt-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 mb-1">Created</p>
              <p className="text-2xl font-bold text-gray-800">{bundles.length}</p>
              <p className="text-xs text-gray-500">Bonks</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 mb-1">Current Rank</p>
              <p className="text-2xl font-bold text-gray-800">
                {bestRank ? bestRank : '-'}
              </p>
              <p className="text-xs text-gray-500">Leaderboard</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 mb-1">Total Rewards</p>
              <p className="text-2xl font-bold text-[#ff5c01]">$0</p>
              <p className="text-xs text-gray-500">Earned</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 mb-1">Best Return</p>
              {bundles.length > 0 ? (
                <p className={`text-2xl font-bold ${
                  Math.max(...bundles.map(b => b.priceChangePercent)) > 0 
                    ? 'text-green-600' 
                    : Math.max(...bundles.map(b => b.priceChangePercent)) < 0 
                      ? 'text-red-600' 
                      : 'text-gray-600'
                }`}>
                  {Math.max(...bundles.map(b => b.priceChangePercent)) > 0 ? '+' : ''}
                  {Math.max(...bundles.map(b => b.priceChangePercent)).toFixed(2)}%
                </p>
              ) : (
                <p className="text-2xl font-bold text-gray-800">-</p>
              )}
              <p className="text-xs text-gray-500">Single Bonk</p>
            </div>
          </div>
          
          {/* Empty div to maintain spacing */}
          <div className="h-6"></div>
        </div>
      </div>
      
      {/* Solana Address Input - Always visible under stat cards */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-grow">
            <h4 className="text-md font-bold text-gray-800 mb-1">Solana Payout Address</h4>
            <p className="text-sm text-gray-600">Enter your wallet address to receive reward payouts</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              type="text"
              value={solanaAddress}
              onChange={(e) => setSolanaAddress(e.target.value)}
              placeholder="Enter Solana address"
              className="flex-grow px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-gray-300 bg-white shadow-sm"
            />
            <button
              onClick={updateSolanaAddress}
              disabled={isSavingAddress}
              className="px-4 py-2 bg-[#ff5c01] text-white font-bold rounded-md hover:bg-[#e65400] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-sm"
            >
              {isSavingAddress ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </div>
        {addressError && (
          <p className="mt-2 text-sm text-red-600 font-bold">{addressError}</p>
        )}
        {addressSaved && (
          <p className="mt-2 text-sm text-green-600">Address saved successfully!</p>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
