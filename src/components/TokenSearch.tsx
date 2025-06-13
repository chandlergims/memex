"use client";

import { useState, useEffect } from "react";
import { Token, isValidSolanaAddress } from "@/types";

interface TokenSearchProps {
  onAddToken: (token: Token) => void;
  selectedTokens: Token[];
  availableTokens: Token[];
  isLoading: boolean;
}

export default function TokenSearch({ 
  onAddToken, 
  selectedTokens, 
  availableTokens, 
  isLoading 
}: TokenSearchProps) {
  // Token search by name/symbol state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Token[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  
  // Token address search state
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenDetails, setTokenDetails] = useState<Token | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [dataSource, setDataSource] = useState<string>("");

  // Filter available tokens based on search term
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = availableTokens.filter(token => 
      token.name.toLowerCase().includes(term) || 
      token.symbol.toLowerCase().includes(term)
    );
    
    setSearchResults(filtered);
  }, [searchTerm, availableTokens]);

  // Fetch token details by address
  const fetchTokenDetails = async () => {
    if (!tokenAddress.trim()) {
      setTokenError("Please enter a Solana token address");
      return;
    }

    // Validate that the address is a valid Solana address
    if (!isValidSolanaAddress(tokenAddress.trim())) {
      setTokenError("Invalid Solana token address format");
      return;
    }

    setTokenLoading(true);
    setTokenError("");
    setTokenDetails(null);
    setDataSource("");

    try {
      // Use our API route which checks the database first
      const response = await fetch(`/api/tokens?address=${tokenAddress}`);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setTokenDetails(data.data);
        setDataSource(data.source || "unknown");
      } else {
        setTokenError(data.message || "Failed to fetch token details");
      }
    } catch (err) {
      setTokenError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setTokenLoading(false);
    }
  };

  // Check if a token is already selected
  const isTokenSelected = (address: string) => {
    return selectedTokens.some(t => t.address.toLowerCase() === address.toLowerCase());
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Add Tokens to Bundle</h2>
      
      {/* Token Address Search */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Add Token by Address</h3>
        <p className="text-sm text-gray-600 mb-3">
          Enter a Solana token address to add a token that may not be in our database
        </p>
        <div className="flex flex-col md:flex-row gap-2 mb-3">
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="Enter Solana token address"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchTokenDetails}
            disabled={tokenLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {tokenLoading ? "Loading..." : "Search"}
          </button>
        </div>
        
        {tokenError && (
          <div className="mb-3 text-red-600 bg-red-50 p-3 rounded-md text-sm">
            {tokenError}
          </div>
        )}
        
        {tokenDetails && (
          <div className="bg-gray-50 p-4 rounded-md mb-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {dataSource && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  dataSource === 'database' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  Data from: {dataSource === 'database' ? 'Cache' : 'Birdeye API'}
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {tokenDetails.logoURI && (
                  <img
                    src={tokenDetails.logoURI}
                    alt={`${tokenDetails.symbol} logo`}
                    className="w-8 h-8 rounded-full mr-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <div className="font-medium">{tokenDetails.symbol}</div>
                  <div className="text-xs text-gray-500">{tokenDetails.name}</div>
                </div>
              </div>
              
              <button
                onClick={() => onAddToken(tokenDetails)}
                disabled={isTokenSelected(tokenDetails.address)}
                className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:hover:text-gray-400"
              >
                {isTokenSelected(tokenDetails.address) ? "Already Added" : "Add to Bundle"}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Available Tokens */}
      <div>
        <h3 className="text-lg font-medium mb-2">Available Tokens</h3>
        <div className="mb-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter tokens by name or symbol..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            Loading available tokens...
          </div>
        ) : availableTokens.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tokens found in the database.
          </div>
        ) : searchTerm.length >= 2 && searchResults.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No tokens found matching your search.
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {(searchTerm.length >= 2 ? searchResults : availableTokens).map((token) => (
              <div key={token._id || token.address} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  {token.logoURI && (
                    <img
                      src={token.logoURI}
                      alt={`${token.symbol} logo`}
                      className="w-8 h-8 rounded-full mr-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div>
                    <div className="font-medium">{token.symbol}</div>
                    <div className="text-xs text-gray-500">{token.name}</div>
                    <div className="text-xs text-gray-500">
                      ${token.price}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => onAddToken(token)}
                  disabled={isTokenSelected(token.address)}
                  className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:hover:text-gray-400"
                >
                  {isTokenSelected(token.address) ? "Added" : "Add"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
