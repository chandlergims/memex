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

interface BundleTokenListProps {
  tokens: Token[];
  totalPrice: number;
}

export default function BundleTokenList({ tokens, totalPrice }: BundleTokenListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Token
            </th>
            <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Weight
            </th>
            <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Value
            </th>
            <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tokens.map((token, index) => {
            // Calculate token weight in the bundle
            const weight = totalPrice > 0
              ? ((token.price || 0) / totalPrice) * 100
              : (1 / tokens.length) * 100;
              
            // Calculate token value in the bundle
            const value = (token.price || 0);
              
            return (
              <tr key={token._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {token.logoURI ? (
                      <div className="flex-shrink-0 h-10 w-10 mr-4">
                        <img
                          className="h-10 w-10 rounded-full border border-gray-200"
                          src={token.logoURI}
                          alt={`${token.symbol} logo`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                        <span className="text-gray-500 font-bold">{token.symbol.substring(0, 2)}</span>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {token.symbol}
                      </div>
                      <div className="text-xs text-gray-500 max-w-xs truncate">
                        {token.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-bold text-gray-900">
                    ${token.price.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-end">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className={`h-2 rounded-full ${
                          weight > 30 ? 'bg-indigo-600' : 
                          weight > 15 ? 'bg-indigo-500' : 
                          'bg-indigo-400'
                        }`}
                        style={{ width: `${Math.min(100, weight)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {weight.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900">
                    ${value.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <a 
                    href={`https://solscan.io/token/${token.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                  >
                    View
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
