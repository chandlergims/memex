import React from 'react';

interface ProfileHeaderProps {
  twitterUsername: string | undefined;
  bundles: any[];
  bestRank: number | null;
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
    <div className="bg-white p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        {/* Left section: User info */}
        <div className="flex items-center mb-4 md:mb-0">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mr-4">
            <span className="text-black font-bold text-xl">
              {twitterUsername ? twitterUsername.charAt(1).toUpperCase() : 'U'}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black">
              {twitterUsername ? `@${twitterUsername}` : 'Your Profile'}
            </h1>
            <p className="text-gray-600">
              {bundles.length} Index{bundles.length !== 1 ? 'es' : ''} created
            </p>
          </div>
        </div>
        
        {/* Right section: Stats */}
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
          {/* Best Rank */}
          <div className="text-center md:text-right">
            <div className="text-sm font-medium text-gray-500 mb-1">Best Rank</div>
            <div className="text-2xl font-bold text-black">
              {bestRank ? `#${bestRank}` : '-'}
            </div>
          </div>
          
          {/* Solana Address Section */}
          <div className="bg-gray-50 rounded-lg p-4 min-w-[300px]">
            <div className="text-sm font-medium text-black mb-2">Solana Address</div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={solanaAddress}
                onChange={(e) => setSolanaAddress(e.target.value)}
                placeholder="Enter your Solana address"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-400"
              />
              <button
                onClick={updateSolanaAddress}
                disabled={isSavingAddress}
                className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSavingAddress ? 'Saving...' : 'Save'}
              </button>
            </div>
            {addressError && (
              <div className="text-red-600 text-xs mt-1">{addressError}</div>
            )}
            {addressSaved && (
              <div className="text-black text-xs mt-1">Address saved successfully!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
