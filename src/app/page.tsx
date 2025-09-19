"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWebSocket } from "@/components/WebSocketProvider";
import CountdownTimer from "@/components/CountdownTimer";
import BundleCard from "@/components/BundleCard";
import BundleCardSkeleton from "@/components/BundleCardSkeleton";
import PodiumSection from "@/components/PodiumSection";

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
  isActive?: boolean;
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
  const [activeFilter, setActiveFilter] = useState<'all' | 'approved'>('all');
  const [newBundleId, setNewBundleId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const bundlesPerPage = 21;

  // Function to fetch bundles
  const fetchBundles = useCallback(async () => {
    try {
      setBundlesLoading(true);
      setBundlesError("");
      
      const response = await fetch("/api/bonks");
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Fetch details for each bundle
        const bundlesWithDetails = await Promise.all(
          data.data.map(async (bundle: Bundle) => {
            try {
              const detailsResponse = await fetch(`/api/bonks/${bundle._id}`);
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
    
    // Handle bundle:created or bonk:created events
    if ((lastEvent.type === 'bundle:created' || lastEvent.type === 'bonk:created') && lastEvent.data?.bundle) {
      const newBundle = lastEvent.data.bundle;
      console.log('New bundle created via WebSocket:', newBundle);
      
      // Fetch complete bundle details before adding to state
      const fetchBundleDetails = async () => {
        try {
          const detailsResponse = await fetch(`/api/bonks/${newBundle._id}`);
          const detailsData = await detailsResponse.json();
          
          if (detailsData.success && detailsData.data) {
            const bundleWithDetails = {
              ...newBundle,
              metrics: detailsData.data.metrics,
              tokens: detailsData.data.tokens
            };
            
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
              return [bundleWithDetails, ...prevBundles];
            });
          }
        } catch (err) {
          console.error(`Error fetching details for new bundle ${newBundle._id}:`, err);
        }
      };
      
      fetchBundleDetails();
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

  
  // Get sorted and paginated bundles for display
  const displayBundles = useMemo(() => {
    // Filter out inactive bundles
    const activeBundles = bundles.filter(bundle => bundle.isActive !== false);
    
    if (activeFilter === 'approved') {
      // For approved filter, return empty array (coming soon)
      return [];
    }
    
    return activeBundles
      .slice()
      .sort((a, b) => {
        // Sort by most recent for 'all' filter
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      // Apply pagination
      .slice((currentPage - 1) * bundlesPerPage, currentPage * bundlesPerPage);
  }, [bundles, activeFilter, currentPage, bundlesPerPage]);
  
  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Top Performing BIFs Section */}
          <div className="mb-12">
            <PodiumSection topPerformers={bundles.slice().sort((a, b) => (b.metrics?.priceChangePercent || 0) - (a.metrics?.priceChangePercent || 0)).slice(0, 3)} loading={bundlesLoading} />
          </div>
          
          {/* Token Bundles Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold text-black">Indexes</h2>
              <Link 
                href="/create"
                className="px-4 py-2 bg-black text-white font-medium text-sm rounded-lg hover:bg-gray-800 transition-all duration-200 cursor-pointer"
              >
                + create
              </Link>
            </div>
            
            {/* Price Update Timer - Centered under Indexes */}
            <div className="mb-4 flex justify-center">
              <div className="inline-flex items-center gap-2 text-xs">
                <span className="text-gray-500">Prices update every 5 minutes</span>
                <span className="text-gray-700">(<CountdownTimer intervalMinutes={5} />)</span>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button 
                    className={`px-4 py-2 text-sm font-medium transition-all cursor-pointer rounded-lg ${
                      activeFilter === 'all' 
                        ? 'bg-gray-100 text-black' 
                        : 'text-gray-600 hover:text-black hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveFilter('all')}
                  >
                    All {bundles.filter(bundle => bundle.isActive !== false).length}
                  </button>
                  <button 
                    className={`px-4 py-2 text-sm font-medium transition-all cursor-pointer rounded-lg ${
                      activeFilter === 'approved' 
                        ? 'bg-gray-100 text-black' 
                        : 'text-gray-600 hover:text-black hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveFilter('approved')}
                  >
                    Approved 0
                  </button>
                </div>
                
                {/* Pagination Controls */}
                {bundles.filter(bundle => bundle.isActive !== false).length > bundlesPerPage && (
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 flex items-center justify-center bg-transparent text-gray-700 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      aria-label="Previous page"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <span className="text-sm font-bold text-gray-800 px-2">
                      {currentPage} / {Math.ceil(bundles.filter(bundle => bundle.isActive !== false).length / bundlesPerPage)}
                    </span>
                    
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(bundles.filter(bundle => bundle.isActive !== false).length / bundlesPerPage)))}
                      disabled={currentPage >= Math.ceil(bundles.filter(bundle => bundle.isActive !== false).length / bundlesPerPage)}
                      className="w-8 h-8 flex items-center justify-center bg-transparent text-gray-700 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
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
              <div className="min-h-[800px]">
                {/* Skeleton Loader for Bundle Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8 auto-rows-fr">
                  {Array(9).fill(0).map((_, index) => (
                    <BundleCardSkeleton key={index} />
                  ))}
                </div>
              </div>
            ) : bundlesError ? (
              <div className="bg-red-50 p-4 rounded-md text-red-600">
                {bundlesError}
              </div>
            ) : bundles.length === 0 ? (
              <div className="p-6 rounded-md text-center border border-gray-200 shadow-sm bg-white">
                <div className="text-gray-800 font-bold text-lg">No Index created yet</div>
              </div>
            ) : activeFilter === 'approved' ? (
              <div className="p-6 text-center">
                <div className="max-w-sm mx-auto">
                  <div className="text-gray-800 font-bold text-lg mb-2">Approved Indexes - Coming Soon</div>
                  <div className="text-gray-500 text-xs">
                    Curated, safe indexes for direct investment.
                  </div>
                </div>
              </div>
            ) : (
              <div className="min-h-[800px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8 auto-rows-fr">
                  {displayBundles.map((bundle) => (
                    <BundleCard 
                      key={bundle._id} 
                      bundle={bundle} 
                      isNew={newBundleId === bundle._id}
                    />
                  ))}
                </div>
                
                {/* Mobile Pagination (only shown on small screens) */}
                {bundles.filter(bundle => bundle.isActive !== false).length > bundlesPerPage && (
                  <div className="flex justify-center mt-8 md:hidden">
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="w-10 h-10 flex items-center justify-center bg-transparent text-gray-700 hover:text-green-600 disabled:opacity-30 cursor-pointer transition-colors"
                        aria-label="Previous page"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      <span className="text-sm font-bold text-gray-800 px-2 py-1 border-b border-gray-300">
                        {currentPage} / {Math.ceil(bundles.filter(bundle => bundle.isActive !== false).length / bundlesPerPage)}
                      </span>
                      
                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(bundles.filter(bundle => bundle.isActive !== false).length / bundlesPerPage)))}
                        disabled={currentPage >= Math.ceil(bundles.filter(bundle => bundle.isActive !== false).length / bundlesPerPage)}
                        className="w-10 h-10 flex items-center justify-center bg-transparent text-gray-700 hover:text-green-600 disabled:opacity-30 cursor-pointer transition-colors"
                        aria-label="Next page"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
