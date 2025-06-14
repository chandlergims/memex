"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWebSocket } from "@/components/WebSocketProvider";
import TimeCounter from "@/components/TimeCounter";
import PodiumSection from "@/components/PodiumSection";
import BundleCard from "@/components/BundleCard";
import BundleCardSkeleton from "@/components/BundleCardSkeleton";

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
  const [activeFilter, setActiveFilter] = useState<'recent' | 'highest' | 'lowest'>('recent');
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

  // Get top 3 performing indexes for the podium
  // Using useMemo to recalculate when bundles change (including WebSocket updates)
  const topPerformers = useMemo(() => {
    if (bundlesLoading || bundlesError) return [];
    
    // Even if there are no bundles, return an empty array but don't return early
    if (bundles.length === 0) return [];
    
    // Filter bundles with positive price change and active status
    const positiveBundles = bundles.filter(bundle => 
      (bundle.metrics?.priceChangePercent || 0) > 0 &&
      bundle.isActive !== false // Only show active bundles
    );
    
    // Even if there are no positive bundles, return an empty array but don't return early
    if (positiveBundles.length === 0) return [];
    
    // Sort bundles by price change percentage (highest first)
    return [...positiveBundles]
      .sort((a, b) => (b.metrics?.priceChangePercent || 0) - (a.metrics?.priceChangePercent || 0))
      .slice(0, 3); // Get top 3
  }, [bundles, bundlesLoading, bundlesError]);
  
  // Get sorted and paginated bundles for display
  const displayBundles = useMemo(() => {
    return bundles
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
      .slice((currentPage - 1) * bundlesPerPage, currentPage * bundlesPerPage);
  }, [bundles, activeFilter, currentPage, bundlesPerPage]);
  
  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto py-10 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Top Performers Podium Section */}
          <PodiumSection topPerformers={topPerformers} loading={bundlesLoading} />
          
          {/* Price Update Info Banner - Small and centered */}
          <div className="mb-4 mt-1 flex justify-center">
            <div className="inline-flex items-center gap-1 bg-[#fff5eb] px-3 py-1 rounded-md shadow-sm border border-[#ffead3] text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-[#ff5c01]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-medium text-gray-700">
                <span className="font-bold text-[#ff5c01]">Bonks Index prices</span> <span className="font-bold">updated every minute</span>
              </span>
            </div>
          </div>
          
          {/* Token Bundles Section */}
          <div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                  <button 
                    className={`px-5 py-2 text-sm font-bold transition-all cursor-pointer border-b-2 ${
                      activeFilter === 'recent' 
                        ? 'text-[#ff5c01] border-[#ff5c01]' 
                        : 'text-gray-600 hover:text-gray-800 border-transparent'
                    }`}
                    onClick={() => setActiveFilter('recent')}
                  >
                    RECENT
                  </button>
                  <button 
                    className={`px-5 py-2 text-sm font-bold transition-all cursor-pointer border-b-2 ${
                      activeFilter === 'highest' 
                        ? 'text-[#ff5c01] border-[#ff5c01]' 
                        : 'text-gray-600 hover:text-gray-800 border-transparent'
                    }`}
                    onClick={() => setActiveFilter('highest')}
                  >
                    GAINERS
                  </button>
                  <button 
                    className={`px-5 py-2 text-sm font-bold transition-all cursor-pointer border-b-2 ${
                      activeFilter === 'lowest' 
                        ? 'text-[#ff5c01] border-[#ff5c01]' 
                        : 'text-gray-600 hover:text-gray-800 border-transparent'
                    }`}
                    onClick={() => setActiveFilter('lowest')}
                  >
                    LOSERS
                  </button>
                </div>
                
                {/* Pagination Controls */}
                {bundles.length > bundlesPerPage && (
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 flex items-center justify-center bg-transparent text-gray-700 hover:text-[#ff5c01] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      aria-label="Previous page"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <span className="text-sm font-bold text-gray-800 px-2">
                      {currentPage} / {Math.ceil(bundles.length / bundlesPerPage)}
                    </span>
                    
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(bundles.length / bundlesPerPage)))}
                      disabled={currentPage >= Math.ceil(bundles.length / bundlesPerPage)}
                      className="w-8 h-8 flex items-center justify-center bg-transparent text-gray-700 hover:text-[#ff5c01] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
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
                <div className="text-gray-800 font-bold text-lg">No Bonks created yet</div>
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
                {bundles.length > bundlesPerPage && (
                  <div className="flex justify-center mt-8 md:hidden">
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="w-10 h-10 flex items-center justify-center bg-transparent text-gray-700 hover:text-[#ff5c01] disabled:opacity-30 cursor-pointer transition-colors"
                        aria-label="Previous page"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      <span className="text-sm font-bold text-gray-800 px-2 py-1 border-b border-gray-300">
                        {currentPage} / {Math.ceil(bundles.length / bundlesPerPage)}
                      </span>
                      
                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(bundles.length / bundlesPerPage)))}
                        disabled={currentPage >= Math.ceil(bundles.length / bundlesPerPage)}
                        className="w-10 h-10 flex items-center justify-center bg-transparent text-gray-700 hover:text-[#ff5c01] disabled:opacity-30 cursor-pointer transition-colors"
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
