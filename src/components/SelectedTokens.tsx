"use client";

import { Token } from "@/types";
import { BundleMetricsResult, calculateBundleMetrics } from "@/utils/bundleUtils";

interface SelectedTokensProps {
  tokens: Token[];
  onRemoveToken: (address: string) => void;
}

export default function SelectedTokens({ tokens, onRemoveToken }: SelectedTokensProps) {
  const metrics: BundleMetricsResult = calculateBundleMetrics(tokens);
  
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Selected Tokens</h2>
      
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium text-gray-700">
          Selected: {tokens.length}/20
        </span>
        <span className={`text-sm font-medium ${tokens.length < 5 ? 'text-red-600' : 'text-green-600'}`}>
          {tokens.length < 5 ? `Need ${5 - tokens.length} more` : 'Minimum met'}
        </span>
      </div>
      
      {/* Bundle Metrics */}
      {tokens.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <div className="text-sm font-medium mb-2">Bundle Metrics:</div>
          <div className="flex justify-between text-sm mb-2">
            <span>Total Price:</span>
            <span className="font-semibold">${metrics.totalPrice.toLocaleString()}</span>
          </div>
          
        </div>
      )}
      
      {tokens.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No tokens selected yet. Add tokens using the search options.
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {tokens.map((token) => (
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
                onClick={() => onRemoveToken(token.address)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
