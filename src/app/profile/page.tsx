"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import BundleCard from "@/components/BundleCard";
import BundleCardSkeleton from "@/components/BundleCardSkeleton";
import ProfileHeader from "@/components/ProfileHeader";
import ProfileHeaderSkeleton from "@/components/ProfileHeaderSkeleton";
// import ProfileRewardsTab from "@/components/ProfileRewardsTab";

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

export default function ProfilePage() {
  const { authenticated, user, login } = usePrivy();
  const router = useRouter();
  const [bundles, setBundles] = useState<BundleWithMetrics[]>([]);
  const [bundlesLoading, setBundlesLoading] = useState(true);
  const [bundlesError, setBundlesError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const bundlesPerPage = 9;
  const [currentRank, setCurrentRank] = useState<number | null>(null);
  const [solanaAddress, setSolanaAddress] = useState<string>('');
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressSaved, setAddressSaved] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  
  const twitterUsername = user?.twitter?.username;
  const userId = user?.id;
  
  // State to track if we're checking authentication
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Check authentication status
  useEffect(() => {
    // Set a timeout to simulate checking auth
    const timer = setTimeout(() => {
      setCheckingAuth(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Function to fetch user's bundles
  const fetchUserBundles = useCallback(async () => {
    if (!authenticated || !userId) return;
    
    try {
      setBundlesLoading(true);
      setBundlesError("");
      
      const response = await fetch("/api/bonks");
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Filter bundles by user ID or Twitter username
        let userBundles = data.data.filter((bundle: Bundle) => 
          bundle.userId === userId || 
          (twitterUsername && bundle.twitterUsername === twitterUsername)
        );
        
        // Fetch details for each bundle
        const bundlesWithDetails = await Promise.all(
          userBundles.map(async (bundle: Bundle) => {
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
  }, [authenticated, userId, twitterUsername]);
  
  // Function to fetch leaderboard data and find current rank
  const fetchCurrentRank = useCallback(async () => {
    if (!authenticated || !userId) return;
    
    try {
      // Fetch all bonks to simulate leaderboard
      const response = await fetch("/api/bonks");
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Filter out bundles with negative returns and inactive bundles
        const positiveBundles = data.data.filter(bundle => 
          bundle.priceChangePercent > 0 && bundle.isActive !== false
        );
        
        // Sort bundles by performance (highest priceChangePercent first)
        const sortedBundles = [...positiveBundles].sort((a, b) => 
          b.priceChangePercent - a.priceChangePercent
        );
        
        // Find the user's active bundles in the sorted list
        const userBundleIds = bundles
          .filter(bundle => bundle.isActive !== false)
          .map(bundle => bundle._id);
        
        // Find the current rank (lowest index + 1) of any user bundle with positive returns
        let lowestRank = null;
        
        for (let i = 0; i < sortedBundles.length; i++) {
          if (userBundleIds.includes(sortedBundles[i]._id)) {
            lowestRank = i + 1; // +1 because ranks start at 1, not 0
            break;
          }
        }
        
        setCurrentRank(lowestRank);
      }
    } catch (err) {
      console.error("Error fetching current rank:", err);
    }
  }, [authenticated, userId, bundles]);
  
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
  
  // Fetch bundles and user data on component mount and when user changes
  useEffect(() => {
    if (authenticated) {
      fetchUserBundles();
      fetchUserData();
    }
  }, [authenticated, fetchUserBundles, fetchUserData]);
  
  // Fetch current rank after bundles are loaded
  useEffect(() => {
    if (bundles.length > 0) {
      fetchCurrentRank();
    }
  }, [bundles, fetchCurrentRank]);
  
  // Show skeleton UI while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-white">
        <main className="container mx-auto py-10 px-4">
          <div className="max-w-6xl mx-auto">
            <ProfileHeaderSkeleton />
            
            {/* Title and Pagination Skeleton */}
            <div className="mb-8">
              <div className="flex justify-between items-center">
                <div className="flex space-x-2 bg-gray-50 p-1 rounded-lg inline-flex">
                  <div className="h-10 w-28 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* Content Skeleton */}
            <div className="min-h-[600px]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8 auto-rows-fr">
                {Array(9).fill(0).map((_, index) => (
                  <div key={index} className="bg-white shadow-sm rounded-lg overflow-hidden animate-pulse">
                    <div className="p-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 mr-3"></div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-center">
                            <div className="max-w-[150px]">
                              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded w-32"></div>
                            </div>
                            <div className="flex items-center ml-2">
                              <div className="flex flex-col items-end mr-4">
                                <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-12"></div>
                              </div>
                              <div className="h-8 bg-gray-200 rounded w-16"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  // Show login prompt if not authenticated
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Sign in to view your profile</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view your profile and manage your Bonks.</p>
          <button
            onClick={login}
            className="px-6 py-3 bg-[#ff5c01] text-white font-bold rounded-md hover:bg-[#e65400] transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }
  
  // Empty state for when no bundles are created
  const EmptyBundlesState = () => (
    <div className="bg-[#fff5eb] p-8 rounded-xl text-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#ff5c01] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h2 className="text-xl font-bold text-gray-800 mb-2">No Bonks Created Yet</h2>
      <p className="text-gray-600 mb-6">Create your first Bonk to track your favorite tokens in one place.</p>
      <button 
        onClick={() => {
          // Find the Create button in the navbar and click it
          const createButton = document.querySelector('button.create-button');
          if (createButton) {
            (createButton as HTMLButtonElement).click();
          }
        }}
        className="inline-flex items-center px-6 py-3 bg-[#ff5c01] text-white font-bold rounded-md hover:bg-[#e65400] transition-colors"
      >
        Create Your First Bonk
      </button>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <ProfileHeader 
            twitterUsername={twitterUsername}
            bundles={bundles}
            bestRank={currentRank}
            solanaAddress={solanaAddress}
            setSolanaAddress={setSolanaAddress}
            isSavingAddress={isSavingAddress}
            updateSolanaAddress={updateSolanaAddress}
            addressError={addressError}
            addressSaved={addressSaved}
          />
          
          {/* Title and Pagination */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <div className="px-5 py-2 text-sm font-bold text-[#ff5c01] border-b-2 border-[#ff5c01]">
                  YOUR BONKS
                </div>
              </div>
              
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
          
          {/* Content */}
          {bundlesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {Array(9).fill(0).map((_, index) => (
                <BundleCardSkeleton key={index} />
              ))}
            </div>
          ) : bundlesError ? (
            <div className="bg-red-50 p-4 rounded-md text-red-600">
              {bundlesError}
            </div>
          ) : bundles.length === 0 ? (
            <EmptyBundlesState />
          ) : (
            <div className="min-h-[600px]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8 auto-rows-fr">
                {bundles
                  .slice((currentPage - 1) * bundlesPerPage, currentPage * bundlesPerPage)
                  .map((bundle) => (
                    <BundleCard 
                      key={bundle._id} 
                      bundle={bundle} 
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
      </main>
    </div>
  );
}
