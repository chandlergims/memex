"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePrivy } from '@privy-io/react-auth';
import { useWebSocket } from "@/components/WebSocketProvider";
import BundleCardSkeleton from "@/components/BundleCardSkeleton";
import LeaderboardPodium from "@/components/LeaderboardPodium";
import LeaderboardTitle from "@/components/LeaderboardTitle";

// Countdown Timer Component
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      
      const diff = midnight.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      return { hours, minutes, seconds };
    };
    
    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format numbers to always have two digits
  const formatNumber = (num: number) => num.toString().padStart(2, '0');
  
  return (
    <div className="flex items-center justify-center">
        <div className="flex items-center space-x-1 font-mono bg-gray-50 px-4 py-2 rounded-md border border-gray-200">
          <span className="text-xl font-bold text-black">{formatNumber(timeLeft.hours)}</span>
          <span className="text-xl font-bold text-black">:</span>
          <span className="text-xl font-bold text-black">{formatNumber(timeLeft.minutes)}</span>
          <span className="text-xl font-bold text-black">:</span>
          <span className="text-xl font-bold text-black">{formatNumber(timeLeft.seconds)}</span>
        </div>
    </div>
  );
}

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

export default function LeaderboardPage() {
  const { authenticated, user } = usePrivy();
  const [bundles, setBundles] = useState<BundleWithMetrics[]>([]);
  const [bundlesLoading, setBundlesLoading] = useState(true);
  const [bundlesError, setBundlesError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [solanaAddress, setSolanaAddress] = useState<string>('');
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressSaved, setAddressSaved] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const bundlesPerPage = 50;
  
  // Get Twitter username from Privy
  const twitterUsername = user?.twitter?.username;
  const userId = user?.id;

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
  
  // Function to fetch user data
  const fetchUserData = useCallback(async () => {
    if (!authenticated || !userId) return;
    
    try {
      const response = await fetch(`/api/users?userId=${userId}`);
      
      // If we get a 404, it means the user doesn't exist yet, which is fine
      if (response.status === 404) {
        console.log("User not found in database yet. Will be created on first update.");
        return;
      }
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Set Solana address if it exists
        if (data.data.solanaAddress) {
          setSolanaAddress(data.data.solanaAddress);
        }
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  }, [authenticated, userId]);
  
  // Function to update Solana address
  const updateSolanaAddress = async () => {
    if (!authenticated || !userId) return;
    
    // Basic validation for Solana address
    if (!solanaAddress) {
      setAddressError("Please enter a Solana address");
      return;
    }
    
    // Simple format validation (this is basic, a real app would need more robust validation)
    if (solanaAddress.length < 32 || !solanaAddress.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
      setAddressError("Please enter a valid Solana address");
      return;
    }
    
    setAddressError(null);
    setIsSavingAddress(true);
    
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          solanaAddress
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setAddressSaved(true);
        setTimeout(() => setAddressSaved(false), 3000);
      } else {
        setAddressError(data.message || "Failed to save address");
      }
    } catch (err) {
      setAddressError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Check if the user is an admin
  useEffect(() => {
    if (authenticated && twitterUsername) {
      console.log('Checking admin status for Twitter username:', twitterUsername);
      
      // Check if the user's Twitter handle matches the admin Twitter handle
      if (twitterUsername === 'bonksdotapp') {
        setIsAdmin(true);
        console.log('User is admin!');
      } else {
        console.log('User is not admin');
      }
    }
  }, [authenticated, twitterUsername]);
  
  // Fetch user data on component mount
  useEffect(() => {
    if (authenticated) {
      fetchUserData();
    }
  }, [authenticated, fetchUserData]);
  
  // Use the WebSocket context for real-time updates
  const { lastEvent } = useWebSocket();
  
  // Handle WebSocket events
  useEffect(() => {
    if (!lastEvent) return;
    
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

  // Filter bundles with positive price change and active status
  const positiveBundles = useMemo(() => {
    return bundles.filter(bundle => 
      (bundle.metrics?.priceChangePercent || 0) > 0 && 
      bundle.isActive !== false // Only show active bundles
    );
  }, [bundles]);
  
  // Filter bundles based on search term
  const filteredBundles = useMemo(() => {
    if (!searchTerm.trim()) return positiveBundles;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return positiveBundles.filter(bundle => 
      bundle.title.toLowerCase().includes(lowerSearchTerm) ||
      (bundle.twitterUsername && bundle.twitterUsername.toLowerCase().includes(lowerSearchTerm))
    );
  }, [positiveBundles, searchTerm]);
  
  // Get top performers for podium (always from positive bundles, not filtered by search)
  const topPerformers = useMemo(() => {
    return positiveBundles
      .slice()
      .sort((a, b) => (b.metrics?.priceChangePercent || 0) - (a.metrics?.priceChangePercent || 0))
      .slice(0, 3);
  }, [positiveBundles]);
  
  // Get sorted and paginated bundles for display (filtered by search and excluding top 3)
  const displayBundles = useMemo(() => {
    // Get the IDs of the top 3 performers to exclude them
    const topPerformerIds = topPerformers.map(bundle => bundle._id);
    
    // Filter out the top 3 bundles by ID
    const bundlesExcludingTop3 = filteredBundles
      .filter(bundle => !topPerformerIds.includes(bundle._id))
      .sort((a, b) => (b.metrics?.priceChangePercent || 0) - (a.metrics?.priceChangePercent || 0));
    
    // Apply pagination
    return bundlesExcludingTop3.slice(
      (currentPage - 1) * bundlesPerPage, 
      currentPage * bundlesPerPage
    );
  }, [filteredBundles, topPerformers, currentPage, bundlesPerPage]);

  // Function to determine prize amount based on rank
  const getPrizeAmount = (rank: number): string => {
    if (rank === 1) return "$1,000";
    if (rank === 2) return "$500";
    if (rank === 3) return "$250";
    if (rank >= 4 && rank <= 10) return "$100";
    if (rank >= 11 && rank <= 20) return "$50";
    if (rank >= 21 && rank <= 50) return "$25";
    return "-";
  };
  
  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="relative mb-0 p-6">
            {/* Title */}
            <div className="text-center mb-8">
              <LeaderboardTitle />
              
              {/* Countdown Timer */}
              <div className="mt-4">
                <div className="inline-flex items-center gap-2">
                  <span className="font-bold text-black">Competition Ends:</span> 
                  <CountdownTimer />
                </div>
              </div>
            </div>
            
            {/* Admin Controls - Only visible to admin */}
            {isAdmin && (
              <div className="mb-8 p-4 bg-gray-100 rounded-lg max-w-md mx-auto">
                <h3 className="text-lg font-bold mb-2">Admin Controls</h3>
                <p className="text-sm text-gray-600 mb-4">Reset the leaderboard to start a new session. This will mark all existing Bonks as inactive.</p>
                <button 
                  onClick={async () => {
                    if (confirm('Are you sure you want to reset the leaderboard? This will mark all existing Bonks as inactive.')) {
                      try {
                        const response = await fetch('/api/admin/reset-leaderboard', {
                          method: 'POST',
                          headers: {
                            'Authorization': 'test-admin-key'
                          }
                        });
                        
                        const data = await response.json();
                        
                        if (data.success) {
                          alert(`Leaderboard reset successfully! ${data.updatedCount} Bonks marked as inactive.`);
                          // Refresh the page to show the updated leaderboard
                          window.location.reload();
                        } else {
                          alert(`Error: ${data.message}`);
                        }
                      } catch (error) {
                        alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                      }
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Reset Leaderboard
                </button>
              </div>
            )}
            
            {/* Top 3 Podium Section */}
            <div className="mb-2">
              {bundlesLoading ? (
                <div className="animate-pulse mt-10">
                  {/* Podium Skeleton - smaller and more proportional */}
                  <div className="flex justify-center items-end h-[150px] mb-4">
                    {/* Second Place */}
                    <div className="w-[80px] mx-2">
                      <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
                      <div className="h-[60px] bg-gray-200 rounded-t-lg"></div>
                    </div>
                    
                    {/* First Place */}
                    <div className="w-[80px] mx-2">
                      <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
                      <div className="h-[80px] bg-gray-200 rounded-t-lg"></div>
                    </div>
                    
                    {/* Third Place */}
                    <div className="w-[80px] mx-2">
                      <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
                      <div className="h-[40px] bg-gray-200 rounded-t-lg"></div>
                    </div>
                  </div>
                </div>
              ) : bundlesError ? (
                <div className="bg-red-50 p-4 rounded-md text-red-600">
                  {bundlesError}
                </div>
              ) : (
                <LeaderboardPodium 
                  topPerformers={topPerformers} 
                  loading={bundlesLoading}
                />
              )}
            </div>
            
            {/* Solana Address Section - Only show when authenticated */}
            {authenticated && (
              <div className="mt-4 max-w-sm mx-auto">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={solanaAddress}
                    onChange={(e) => setSolanaAddress(e.target.value)}
                    placeholder="Solana address for payouts"
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-gray-400"
                  />
                  <button
                    onClick={updateSolanaAddress}
                    disabled={isSavingAddress}
                    className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSavingAddress ? '...' : 'Save'}
                  </button>
                </div>
                {(addressError || addressSaved) && (
                  <div className={`text-xs mt-1 text-center ${addressError ? 'text-red-600' : 'text-green-600'}`}>
                    {addressError || 'Saved!'}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {bundlesLoading ? (
            <div className="min-h-[600px]">
              {/* Skeleton Loader */}
              <div className="animate-pulse space-y-4">
                {/* Search Bar Skeleton */}
                <div className="flex justify-end mb-4">
                  <div className="w-56 h-9 bg-gray-200 rounded-md"></div>
                </div>
                
                {Array(10).fill(0).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex flex-col items-end mr-6">
                        <div className="h-3 bg-gray-200 rounded w-8 mb-1"></div>
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="h-3 bg-gray-200 rounded w-8 mb-1"></div>
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : bundlesError ? (
            <div className="bg-red-50 p-4 rounded-md text-red-600">
              {bundlesError}
            </div>
          ) : (
            <div className="min-h-[600px]">
              {/* Search Bar */}
              <div className="mb-4 flex justify-end">
                <div className="relative w-56">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-1.5 pl-8 pr-8 rounded-md border border-gray-200 focus:outline-none focus:border-gray-300 text-sm"
                  />
                  <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-4 py-2 px-1" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {/* Show actual bundles */}
                {displayBundles.map((bundle, index) => {
                  const rank = (currentPage - 1) * bundlesPerPage + index + 4; // Start from rank 4 (since top 3 are in podium)
                  return (
                    <div 
                      key={bundle._id} 
                      className={`bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-4 flex items-center justify-between hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-shadow ${
                        rank === 1 ? 'border-l-4 border-[#ffd700]' : 
                        rank === 2 ? 'border-l-4 border-[#c0c0c0]' : 
                        rank === 3 ? 'border-l-4 border-[#cd7f32]' : 
                        ''
                      }`}
                    >
                      {/* Left section: Rank and Bundle Info */}
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-gray-100 text-gray-700 font-bold text-sm">
                          {rank}
                        </div>
                        
                        <Link href={`/index/${bundle._id}`} className="flex items-center group">
                          <div className="flex-shrink-0 h-10 w-10 relative">
                            {bundle.imageUrl ? (
                              <Image 
                                src={bundle.imageUrl} 
                                alt={bundle.title}
                                width={40}
                                height={40}
                                className="rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[#fff5eb] flex items-center justify-center text-[#ff5c01]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-bold text-gray-900 group-hover:text-black transition-colors">
                              {bundle.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {bundle.metrics?.tokenCount || bundle.tokenAddresses?.length || 0} tokens
                            </div>
                          </div>
                        </Link>
                      </div>
                      
                      {/* Right section: Stats and Prize */}
                      <div className="flex items-center">
                        <div className="flex flex-col items-end mr-6">
                          <span className="text-xs text-gray-500 mb-0.5">Gain</span>
                          <span className="text-sm font-bold text-green-600">
                            +{bundle.metrics?.priceChangePercent.toFixed(2) || "0.00"}%
                          </span>
                        </div>
                        <div className="flex flex-col items-end min-w-[60px]">
                          <span className="text-xs text-gray-500 mb-0.5">Prize</span>
                          <span className="text-sm font-bold text-gray-700">
                            {getPrizeAmount(rank)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Show placeholder positions if we have fewer than 10 total positions */}
                {Array.from({ length: Math.max(0, 10 - (topPerformers.length + displayBundles.length)) }, (_, index) => {
                  const rank = topPerformers.length + displayBundles.length + index + 1;
                  return (
                    <div 
                      key={`placeholder-${rank}`}
                      className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-4 flex items-center justify-between opacity-50"
                    >
                      {/* Left section: Rank and Empty Info */}
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-gray-100 text-gray-400 font-bold text-sm">
                          {rank}
                        </div>
                        
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 relative">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-bold text-gray-400">
                              Empty
                            </div>
                            <div className="text-xs text-gray-400">
                              0 tokens
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right section: Empty Stats and Prize */}
                      <div className="flex items-center">
                        <div className="flex flex-col items-end mr-6">
                          <span className="text-xs text-gray-400 mb-0.5">Gain</span>
                          <span className="text-sm font-bold text-gray-400">
                            -
                          </span>
                        </div>
                        <div className="flex flex-col items-end min-w-[60px]">
                          <span className="text-xs text-gray-400 mb-0.5">Prize</span>
                          <span className="text-sm font-bold text-gray-400">
                            {getPrizeAmount(rank)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Pagination */}
              {positiveBundles.length > bundlesPerPage && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Previous page"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <span className="text-sm font-medium text-gray-700">
                      Page {currentPage} of {Math.ceil(positiveBundles.length / bundlesPerPage)}
                    </span>
                    
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(positiveBundles.length / bundlesPerPage)))}
                      disabled={currentPage >= Math.ceil(positiveBundles.length / bundlesPerPage)}
                      className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
      </main>
    </div>
  );
}
