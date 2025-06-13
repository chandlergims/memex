"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { usePrivy } from '@privy-io/react-auth';

interface Token {
  _id: string;
  address: string;
  name: string;
  symbol: string;
  price: number;
  logoURI?: string;
}

interface Bundle {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  tokenAddresses: string[];
  initialPrice: number;
  currentPrice: number;
  priceChangePercent: number;
  createdAt: string;
  lastUpdated: string;
  userId?: string;
  twitterUsername?: string;
}

interface BundleDetails {
  bundle: Bundle;
  tokens: Token[];
  metrics: {
    initialPrice: number;
    currentPrice: number;
    priceChangePercent: number;
    totalPrice: number;
    tokenCount: number;
  };
}

export default function BundleDetailsPage() {
  const params = useParams();
  const bundleId = params.id as string;
  
  const [bundleDetails, setBundleDetails] = useState<BundleDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const { user } = usePrivy();

  useEffect(() => {
    const fetchBundleDetails = async () => {
      if (!bundleId) return;
      
      try {
        setLoading(true);
        setError("");
        
        const response = await fetch(`/api/bundles/${bundleId}`);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setBundleDetails(data.data);
        } else {
          setError(data.message || "Failed to fetch bundle details");
        }
      } catch (err) {
        setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBundleDetails();
  }, [bundleId]);

  const handleDelete = async () => {
    if (!bundleId || !confirm("Are you sure you want to delete this bundle?")) {
      return;
    }
    
    try {
      setDeleteLoading(true);
      setDeleteError("");
      
      const response = await fetch(`/api/bundles/${bundleId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Redirect to home page after successful deletion
        window.location.href = "/";
      } else {
        setDeleteError(data.message || "Failed to delete bundle");
      }
    } catch (err) {
      setDeleteError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Sort tokens by price (descending)
  const sortedTokens = bundleDetails?.tokens 
    ? [...bundleDetails.tokens].sort((a, b) => (b.price || 0) - (a.price || 0))
    : [];

  // Helper function to render price change with arrow
  const renderPriceChange = (change: number | undefined, label: string) => {
    if (change === undefined) return null;
    
    const isPositive = change > 0;
    const isNegative = change < 0;
    const color = isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600';
    
    return (
      <div className="flex items-center">
        <span className="text-xs font-medium text-gray-500 mr-2">{label}:</span>
        <span className={`text-xs font-semibold flex items-center ${color}`}>
          {isPositive ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="mr-1" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0z"/>
            </svg>
          ) : isNegative ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="mr-1" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M13.5 13.5a.5.5 0 0 0 .5-.5v-6a.5.5 0 0 0-1 0v4.793L2.854 1.646a.5.5 0 1 0-.708.708L12.293 12.5H7.5a.5.5 0 0 0 0 1h6z"/>
            </svg>
          ) : null}
          {Math.abs(change).toFixed(2)}%
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-end mb-6">
            {!loading && !error && bundleDetails && user && bundleDetails.bundle.userId === user.id && (
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete Index"}
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-lg">Loading bundle details...</div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-6 rounded-md text-red-600">
              {error}
            </div>
          ) : bundleDetails ? (
            <div>
              {/* Bundle Header Card */}
              <div className="bg-white shadow-md rounded-lg mb-8 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    {/* Bundle Image (if available) */}
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 mr-5 border-4 border-white shadow">
                      {bundleDetails.bundle.imageUrl ? (
                        <img 
                          src={bundleDetails.bundle.imageUrl} 
                          alt={bundleDetails.bundle.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <h1 className="text-2xl font-bold uppercase">{bundleDetails.bundle.title}</h1>
                          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium ml-3">
                            Index
                          </div>
                        </div>
                        {bundleDetails.bundle.description && (
                          <p className="text-gray-600 text-sm mt-2">{bundleDetails.bundle.description}</p>
                        )}
                        <div className="flex flex-col text-sm text-gray-500 mt-2">
                          <div>Created: {new Date(bundleDetails.bundle.createdAt).toLocaleString()}</div>
                          <div>Last Updated: {new Date(bundleDetails.bundle.lastUpdated).toLocaleString()}</div>
                          {bundleDetails.bundle.twitterUsername && (
                            <div>Creator: @{bundleDetails.bundle.twitterUsername}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium ml-4 shadow-sm">
                      {bundleDetails.metrics.tokenCount} tokens
                    </div>
                  </div>
                  
                  {/* Market Stats */}
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-100">
                      <div className="text-sm font-medium text-gray-500 mb-1">Initial Price</div>
                      <div className="text-2xl font-bold text-gray-800">
                        ${bundleDetails.metrics.initialPrice.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-100">
                      <div className="text-sm font-medium text-gray-500 mb-1">Current Price</div>
                      <div className="text-2xl font-bold text-gray-800">
                        ${bundleDetails.metrics.currentPrice.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-100">
                      <div className="text-sm font-medium text-gray-500 mb-1">Performance</div>
                      <div className={`text-2xl font-bold flex items-center ${
                        bundleDetails.metrics.priceChangePercent > 0 
                          ? 'text-green-600' 
                          : bundleDetails.metrics.priceChangePercent < 0 
                            ? 'text-red-600' 
                            : 'text-gray-600'
                      }`}>
                        {bundleDetails.metrics.priceChangePercent > 0 ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="mr-1" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0z"/>
                          </svg>
                        ) : bundleDetails.metrics.priceChangePercent < 0 ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="mr-1" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M13.5 13.5a.5.5 0 0 0 .5-.5v-6a.5.5 0 0 0-1 0v4.793L2.854 1.646a.5.5 0 1 0-.708.708L12.293 12.5H7.5a.5.5 0 0 0 0 1h6z"/>
                          </svg>
                        ) : null}
                        {Math.abs(bundleDetails.metrics.priceChangePercent).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Token Chips - Horizontal Scrollable */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-3">Index Composition</div>
                    <div className="overflow-x-auto pb-2">
                      <div className="flex space-x-3 min-w-max">
                        {sortedTokens.map((token) => {
                          // Calculate token weight
                          const weight = bundleDetails.metrics.totalPrice > 0
                            ? ((token.price || 0) / bundleDetails.metrics.totalPrice) * 100
                            : (1 / sortedTokens.length) * 100;
                            
                          return (
                            <div 
                              key={token._id} 
                              className="flex items-center bg-white rounded-lg px-3 py-2 border border-gray-200 shadow-sm"
                            >
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
                                <div className="text-sm font-medium">{token.symbol}</div>
                                <div className="text-xs text-gray-500">{weight.toFixed(1)}%</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Token Table */}
              <div className="bg-white shadow-md rounded-lg">
                <div className="p-5 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">Index Components</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Token
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Weight
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedTokens.map((token) => {
                        // Calculate token weight in the bundle
                        const weight = bundleDetails.metrics.totalPrice > 0
                          ? ((token.price || 0) / bundleDetails.metrics.totalPrice) * 100
                          : (1 / sortedTokens.length) * 100;
                          
                        return (
                          <tr key={token._id} className="hover:bg-gray-50">
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center">
                                {token.logoURI && (
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
                                )}
                                <div>
                                  <div className="text-sm font-semibold text-gray-900">
                                    {token.symbol}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {token.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="text-sm font-bold text-gray-900">
                                ${token.price.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                                  <div 
                                    className={`h-2 rounded-full ${weight > 20 ? 'bg-blue-600' : 'bg-blue-400'}`}
                                    style={{ width: `${Math.min(100, weight)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {weight.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
          
          {deleteError && (
            <div className="mt-4 bg-red-50 p-4 rounded-md text-red-600">
              {deleteError}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
