"use client";

import { Token } from "@/types";
import { PlusIcon } from "./icons/PlusIcon";
import { RemoveIcon } from "./icons/RemoveIcon";

interface TokenSelectionStepProps {
  selectedTokens: Token[];
  availableTokens: Token[];
  tokensLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: Token[];
  tokenAddress: string;
  setTokenAddress: (address: string) => void;
  tokenDetails: Token | null;
  tokenLoading: boolean;
  tokenError: string;
  handleAddToken: (token: Token) => void;
  handleRemoveToken: (address: string) => void;
  fetchTokenDetails: () => void;
  isTokenSelected: (address: string) => boolean;
}

export default function TokenSelectionStep({
  selectedTokens,
  availableTokens,
  tokensLoading,
  searchTerm,
  setSearchTerm,
  searchResults,
  tokenAddress,
  setTokenAddress,
  tokenDetails,
  tokenLoading,
  tokenError,
  handleAddToken,
  handleRemoveToken,
  fetchTokenDetails,
  isTokenSelected
}: TokenSelectionStepProps) {
  return (
    <div className="space-y-4">
      {/* Requirements Card */}
      <div className="bg-green-50 p-3 rounded-md border border-green-200 mb-4">
        <h3 className="text-sm font-bold text-green-600 mb-2">Index Requirements</h3>
        <ul className="text-xs text-green-700 space-y-1 ml-5 list-disc">
          <li>Select between 5-20 tokens</li>
          <li>Currently selected: <span className="font-semibold">{selectedTokens.length}/20</span></li>
          <li>Status: <span className={`font-semibold ${selectedTokens.length < 5 ? 'text-yellow-600' : 'text-green-600'}`}>
            {selectedTokens.length < 5 ? `Need ${5 - selectedTokens.length} more` : 'Minimum met'}
          </span></li>
        </ul>
      </div>
      
      {/* Token Address Search */}
      <div className="mb-4 border-b border-gray-200 pb-4">
        <h3 className="text-sm font-bold mb-2">Add Token by Address</h3>
        <p className="text-xs text-gray-600 mb-2">
          Don't see a token on this list? Enter a valid Solana token address to add it to our database.
        </p>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="Enter Solana token address"
            className="flex-1 px-3 py-2 border border-gray-100 bg-gray-50 rounded-md focus:outline-none text-sm"
          />
          <button
            type="button"
            onClick={fetchTokenDetails}
            disabled={tokenLoading}
            className="bg-green-50 text-green-600 px-3 py-2 rounded-md hover:bg-green-100 focus:outline-none disabled:opacity-50 whitespace-nowrap text-sm cursor-pointer"
          >
            {tokenLoading ? "Loading..." : <span className="font-bold">Fetch</span>}
          </button>
        </div>
        
        {tokenError && (
          <div className="mb-2 text-red-600 bg-red-50 p-2 rounded-md text-xs border border-red-200">
            {tokenError}
          </div>
        )}
        
        {tokenDetails && (
          <div 
            className={`p-2 rounded-md mb-2 border cursor-pointer ${
              isTokenSelected(tokenDetails.address) 
                ? 'bg-green-50 border-green-600' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
            onClick={() => isTokenSelected(tokenDetails.address) ? handleRemoveToken(tokenDetails.address) : handleAddToken(tokenDetails)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {tokenDetails.logoURI && (
                  <img
                    src={tokenDetails.logoURI}
                    alt={`${tokenDetails.symbol} logo`}
                    className="w-6 h-6 rounded-full mr-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <div className="font-bold text-sm">{tokenDetails.symbol}</div>
                  <div className="text-xs text-gray-500">${tokenDetails.price}</div>
                </div>
              </div>
              
              {/* Icon removed as requested */}
            </div>
          </div>
        )}
      </div>
      
      {/* Available Tokens */}
      <div>
        <h3 className="text-sm font-bold mb-2">Available Tokens</h3>
        <div className="mb-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter tokens by name or symbol..."
            className="w-full px-3 py-2 border border-gray-100 bg-gray-50 rounded-md focus:outline-none text-sm"
          />
        </div>
        
        {tokensLoading ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            <svg className="animate-spin h-5 w-5 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading available tokens...
          </div>
        ) : availableTokens.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            No tokens found in the database.
          </div>
        ) : searchTerm.length >= 2 && searchResults.length === 0 ? (
          <div className="text-center py-2 text-gray-500 text-sm">
            No tokens found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-1 max-h-[200px] overflow-y-auto pr-1">
            {(searchTerm.length >= 2 ? searchResults : availableTokens).map((token) => (
              <div 
                key={token._id || token.address} 
                className={`flex items-center justify-between p-2 rounded-md border cursor-pointer transition-colors ${
                  isTokenSelected(token.address) 
                    ? 'bg-green-50 border-green-600' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => isTokenSelected(token.address) ? handleRemoveToken(token.address) : handleAddToken(token)}
              >
                <div className="flex items-center">
                  {token.logoURI && (
                    <img
                      src={token.logoURI}
                      alt={`${token.symbol} logo`}
                      className="w-6 h-6 rounded-full mr-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div>
                    <div className="font-bold text-sm">{token.symbol}</div>
                    <div className="text-xs text-gray-500">${token.price}</div>
                  </div>
                </div>
                
                {/* Icon removed as requested */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
