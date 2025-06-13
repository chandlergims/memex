"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWebSocket } from "@/components/WebSocketProvider";
import TimeCounter from "@/components/TimeCounter";

interface TokenDetails {
  _id?: string;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  price: number;
  supply: number;
  logoURI?: string;
  [key: string]: any;
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

interface BundleWithMetrics extends Bundle {
  metrics: {
    initialPrice: number;
    currentPrice: number;
    priceChangePercent: number;
    totalPrice: number;
    tokenCount: number;
  };
  tokens: TokenDetails[];
}

export default function Home() {
  const [bundles, setBundles] = useState<BundleWithMetrics[]>([]);
  const [bundlesLoading, setBundlesLoading] = useState(true);
  const [bundlesError, setBundlesError] = useState("");
  const [activeFilter, setActiveFilter] = useState<'recent' | 'highest' | 'lowest'>('recent');
  const [newBundleId, setNewBundleId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const bundlesPerPage = 21;

  // Function to fetch bundles
  const fetchBundles = useCallback(async () => {
    try {
      setBundlesLoading(true);
      setBundlesError("");
      
      const response = await fetch("/api/bundles");
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Fetch details for each bundle
        const bundlesWithDetails = await Promise.all(
          data.data.map(async (bundle: Bundle) => {
            try {
              const detailsResponse = await fetch(`/api/bundles/${bundle._id}`);
              const detailsData = await detailsResponse.json();
              
              if (detailsData.success && detailsData.data) {
                return {
                  ...bundle,
                  metrics: detailsData.data.metrics,
                  tokens: detailsData.data.tokens
                };
              }
              return bundle;
            } catch (err) {
              console.error(`Error fetching details for bundle ${bundle._id}:`, err);
              return bundle;
            }
          })
        );
        
        setBundles(bundlesWithDetails);
      } else {
        setBundlesError(data.message || "Failed to fetch bundles");
      }
    } catch (err) {
      setBundlesError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBundlesLoading(false);
    }
  }, []);
  
  // Fetch bundles on component mount
  useEffect(() => {
    fetchBundles();
  }, [fetchBundles]);
  
  // Use the WebSocket context for real-time updates
  const { socket, isConnected, lastEvent } = useWebSocket();
  
  // Handle WebSocket events
  useEffect(() => {
    if (!lastEvent) return;
    
    // Handle bundle:created events
    if (lastEvent.type === 'bundle:created' && lastEvent.data?.bundle) {
      const newBundle = lastEvent.data.bundle;
      console.log('New bundle created via WebSocket:', newBundle);
      
      // Add the new bundle to the state
      setBundles(prevBundles => {
        // Check if the bundle already exists to avoid duplicates
        const exists = prevBundles.some(b => b._id === newBundle._id);
        if (exists) return prevBundles;
        
        // Set the new bundle ID to highlight it
        setNewBundleId(newBundle._id);
        
        // Clear the highlight after 5 seconds
        setTimeout(() => {
          setNewBundleId(null);
        }, 5000);
        
        // Add the new bundle at the beginning of the array
        return [newBundle, ...prevBundles];
      });
    }
    
    // Handle prices:updated events
    if (lastEvent.type === 'prices:updated' && lastEvent.data?.updatedBundles) {
      console.log('Prices updated via WebSocket:', lastEvent.data);
      
      // Update the bundles with the new price data
      setBundles(prevBundles => {
        return prevBundles.map(bundle => {
          // Find the updated bundle data
          const updatedBundle = lastEvent.data.updatedBundles.find(
            (b: any) => b._id === bundle._id
          );
          
          // If this bundle was updated, merge the new data
          if (updatedBundle) {
            return {
              ...bundle,
              currentPrice: updatedBundle.currentPrice,
              priceChangePercent: updatedBundle.priceChangePercent,
              lastUpdated: updatedBundle.lastUpdated,
              metrics: {
                ...bundle.metrics,
                currentPrice: updatedBundle.currentPrice,
                priceChangePercent: updatedBundle.priceChangePercent
              }
            };
          }
          
          return bundle;
        });
      });
    }
  }, [lastEvent]);

  // Helper function to render price change with arrow
  const renderPriceChange = (change: number | undefined, label: string) => {
    if (change === undefined) return null;
    
    const isPositive = change > 0;
    const isNegative = change < 0;
    const color = isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600';
    const bgColor = isPositive ? 'bg-green-50' : isNegative ? 'bg-red-50' : 'bg-gray-50';
    const arrow = isPositive ? '↑' : isNegative ? '↓' : '→';
    
    return (
      <div className="flex items-center">
        {label && <span className="text-xs font-medium text-gray-500 mr-2">{label}:</span>}
        <span className={`text-xs font-semibold flex items-center ${color} ${bgColor} px-2 py-1 rounded-full`}>
          {arrow} {isPositive ? '+' : ''}{change.toFixed(2)}%
        </span>
      </div>
    );
  };

  // Get top 3 performing indexes for the podium
  // Using useMemo to recalculate when bundles change (including WebSocket updates)
  const topPerformers = useMemo(() => {
    if (bundlesLoading || bundlesError || bundles.length === 0) return [];
    
    // Sort bundles by price change percentage (highest first)
    return [...bundles]
      .sort((a, b) => (b.metrics?.priceChangePercent || 0) - (a.metrics?.priceChangePercent || 0))
      .slice(0, 3); // Get top 3
  }, [bundles, bundlesLoading, bundlesError]);
  
  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto py-10 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Top Performers Podium Section */}
          {!bundlesLoading && !bundlesError && bundles.length >= 3 && (
            <div className="mb-8">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Top Performing Indexes</h2>
                <p className="text-sm text-gray-600 mt-1">Weekly prizes for best performers</p>
              </div>
              
              <div className="flex justify-center items-end space-x-4 mb-4">
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                  <div className="bg-white border border-gray-200 rounded-full p-0.5 mb-1 shadow">
                    {topPerformers[1]?.imageUrl ? (
                      <Image 
                        src={topPerformers[1].imageUrl} 
                        alt={topPerformers[1].title}
                        width={96}
                        height={96}
                        className="w-12 h-12 rounded-full object-cover"
                        priority
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-50 text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                    )}
                  </div>
                      <div className="text-center">
                    <div className="bg-gray-100 w-24 h-20 flex flex-col items-center justify-center rounded-t-md shadow-sm">
                      <div className="text-sm font-bold text-gray-800 truncate max-w-[80px]">{topPerformers[1]?.title}</div>
                      <div className="text-green-600 font-bold text-sm">+{topPerformers[1]?.metrics?.priceChangePercent.toFixed(2)}%</div>
                    </div>
                    <div className="bg-silver h-6 w-24 flex items-center justify-center rounded-b-md shadow-sm">
                      <div className="text-white font-bold text-xs">$5,000</div>
                    </div>
                    <div className="mt-1 text-sm font-bold text-gray-700">2nd</div>
                  </div>
                </div>
                
                {/* 1st Place */}
                <div className="flex flex-col items-center">
                  <div className="bg-white border border-yellow-300 rounded-full p-0.5 mb-1 shadow">
                    {topPerformers[0]?.imageUrl ? (
                      <Image 
                        src={topPerformers[0].imageUrl} 
                        alt={topPerformers[0].title}
                        width={112}
                        height={112}
                        className="w-14 h-14 rounded-full object-cover"
                        priority
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full flex items-center justify-center bg-blue-50 text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="bg-yellow-50 w-28 h-24 flex flex-col items-center justify-center rounded-t-md shadow-sm">
                      <div className="text-base font-bold text-gray-800 truncate max-w-[90px]">{topPerformers[0]?.title}</div>
                      <div className="text-green-600 font-bold text-sm">+{topPerformers[0]?.metrics?.priceChangePercent.toFixed(2)}%</div>
                    </div>
                    <div className="bg-gold h-7 w-28 flex items-center justify-center rounded-b-md shadow-sm">
                      <div className="text-white font-bold text-sm">$10,000</div>
                    </div>
                    <div className="mt-1 text-base font-bold text-yellow-600">1st</div>
                  </div>
                </div>
                
                {/* 3rd Place */}
                <div className="flex flex-col items-center">
                  <div className="bg-white border border-gray-200 rounded-full p-0.5 mb-1 shadow">
                    {topPerformers[2]?.imageUrl ? (
                      <Image 
                        src={topPerformers[2].imageUrl} 
                        alt={topPerformers[2].title}
                        width={80}
                        height={80}
                        className="w-10 h-10 rounded-full object-cover"
                        priority
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50 text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="bg-orange-50 w-20 h-16 flex flex-col items-center justify-center rounded-t-md shadow-sm">
                      <div className="text-sm font-bold text-gray-800 truncate max-w-[70px]">{topPerformers[2]?.title}</div>
                      <div className="text-green-600 font-bold text-sm">+{topPerformers[2]?.metrics?.priceChangePercent.toFixed(2)}%</div>
                    </div>
                    <div className="bg-bronze h-5 w-20 flex items-center justify-center rounded-b-md shadow-sm">
                      <div className="text-white font-bold text-xs">$2,500</div>
                    </div>
                    <div className="mt-1 text-sm font-bold text-orange-600">3rd</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Token Bundles Section */}
          <div>
            <div className="mb-4">
              <h1 className="text-2xl font-bold">Memecoin Indexes</h1>
            </div>
            
            <div className="mb-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex space-x-6">
                  <button 
                    className={`px-4 py-3 text-sm font-medium transition-all cursor-pointer border-b-2 ${
                      activeFilter === 'recent' 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveFilter('recent')}
                  >
                    Recent
                  </button>
                  <button 
                    className={`px-4 py-3 text-sm font-medium transition-all cursor-pointer border-b-2 ${
                      activeFilter === 'highest' 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveFilter('highest')}
                  >
                    Highest Gain
                  </button>
                  <button 
                    className={`px-4 py-3 text-sm font-medium transition-all cursor-pointer border-b-2 ${
                      activeFilter === 'lowest' 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveFilter('lowest')}
                  >
                    Lowest Gain
                  </button>
                </div>
                
                {/* Pagination Controls */}
                {bundles.length > bundlesPerPage && (
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
                      {currentPage} / {Math.ceil(bundles.length / bundlesPerPage)}
                    </span>
                    
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(bundles.length / bundlesPerPage)))}
                      disabled={currentPage >= Math.ceil(bundles.length / bundlesPerPage)}
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
            
            {bundlesLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading bundles...</div>
              </div>
            ) : bundlesError ? (
              <div className="bg-red-50 p-4 rounded-md text-red-600">
                {bundlesError}
              </div>
            ) : bundles.length === 0 ? (
              <div className="bg-yellow-50 p-6 rounded-md text-yellow-700 text-center">
                <p className="mb-4">No memecoin indexes found.</p>
                <Link href="/create" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Create Your First Index
                </Link>
              </div>
            ) : (
              <div className="min-h-[800px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8 auto-rows-fr">
                {bundles
                  .slice()
                  .sort((a, b) => {
                    if (activeFilter === 'recent') {
                      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    } else if (activeFilter === 'highest') {
                      return (b.metrics?.priceChangePercent || 0) - (a.metrics?.priceChangePercent || 0);
                    } else {
                      return (a.metrics?.priceChangePercent || 0) - (b.metrics?.priceChangePercent || 0);
                    }
                  })
                  // Apply pagination
                  .slice((currentPage - 1) * bundlesPerPage, currentPage * bundlesPerPage)
                  .map((bundle) => (
                  <div 
                    key={bundle._id} 
                    className={`${
                      newBundleId === bundle._id 
                        ? 'bg-white shadow-md animate-shake' 
                        : 'bg-white shadow-sm hover:shadow-md'
                    } transition-all duration-300 overflow-hidden flex flex-col relative`}
                  >
                    <div className="absolute top-1 right-2 text-[10px] text-gray-400">
                      <TimeCounter date={bundle.createdAt} />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center">
                        {/* Bundle Image (if available) */}
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 mr-3">
                          {bundle.imageUrl ? (
                            <Image 
                              src={bundle.imageUrl} 
                              alt={bundle.title}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                              priority
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex justify-between items-center">
                            <div className="max-w-[150px] overflow-hidden">
                              <h2 className="text-sm font-semibold text-gray-800 truncate">{bundle.title}</h2>
                              {bundle.description && (
                                <p className="text-xs text-gray-500 truncate">{bundle.description}</p>
                              )}
                              {bundle.twitterUsername && (
                                <p className="text-xs text-blue-500 truncate">@{bundle.twitterUsername}</p>
                              )}
                            </div>
                            
                            <div className="flex items-center ml-2">
                              <div className="flex flex-col items-end mr-4">
                                <span className="text-sm font-bold">
                                  ${bundle.metrics?.currentPrice.toLocaleString() || '0.00'}
                                </span>
                                
                                {bundle.metrics && (
                                  <div className={`text-xs font-medium flex items-center ${
                                    bundle.metrics.priceChangePercent > 0 
                                      ? 'text-green-600' 
                                      : bundle.metrics.priceChangePercent < 0 
                                        ? 'text-red-600' 
                                        : 'text-gray-600'
                                  }`}>
                                    {bundle.metrics.priceChangePercent > 0 ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-arrow-up-right mr-1" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0z"/>
                                      </svg>
                                    ) : bundle.metrics.priceChangePercent < 0 ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-arrow-down-right mr-1" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M13.5 13.5a.5.5 0 0 0 .5-.5v-6a.5.5 0 0 0-1 0v4.793L2.854 1.646a.5.5 0 1 0-.708.708L12.293 12.5H7.5a.5.5 0 0 0 0 1h6z"/>
                                      </svg>
                                    ) : null}
                                    {Math.abs(bundle.metrics.priceChangePercent).toFixed(2)}%
                                  </div>
                                )}
                              </div>
                              
                              <Link 
                                href={`/bundles/${bundle._id}`}
                                className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-200"
                              >
                                View
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
                
                {/* Mobile Pagination (only shown on small screens) */}
                {bundles.length > bundlesPerPage && (
                  <div className="flex justify-center mt-8 md:hidden">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
                        aria-label="Previous page"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      <span className="text-sm text-gray-600 bg-white px-3 py-2 rounded-md border">
                        {currentPage} / {Math.ceil(bundles.length / bundlesPerPage)}
                      </span>
                      
                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(bundles.length / bundlesPerPage)))}
                        disabled={currentPage >= Math.ceil(bundles.length / bundlesPerPage)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
                        aria-label="Next page"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
