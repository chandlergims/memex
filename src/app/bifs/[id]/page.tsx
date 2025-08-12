"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { usePrivy } from '@privy-io/react-auth';
import { useWebSocket } from "@/components/WebSocketProvider";
import BundleHeader from "@/components/BundleHeader";
import BundleStats from "@/components/BundleStats";
import BundleTokensSection from "@/components/BundleTokensSection";
import BundleDetailsLoading from "@/components/BundleDetailsLoading";

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

export default function BifDetailsPage() {
  const params = useParams();
  const bundleId = params.id as string;
  
  const [bundleDetails, setBundleDetails] = useState<BundleDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const { user } = usePrivy();
  const { lastEvent } = useWebSocket();

  useEffect(() => {
    const fetchBundleDetails = async () => {
      if (!bundleId) return;
      
      try {
        setLoading(true);
        setError("");
        
        const response = await fetch(`/api/bonks/${bundleId}`);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setBundleDetails(data.data);
        } else {
          setError(data.message || "Failed to fetch BIF details");
        }
      } catch (err) {
        setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBundleDetails();
  }, [bundleId]);
  
  // Handle WebSocket events for price updates
  useEffect(() => {
    if (!lastEvent || !bundleDetails) return;
    
    // Handle prices:updated events
    if (lastEvent.type === 'prices:updated' && lastEvent.data?.updatedBundles) {
      console.log('Prices updated via WebSocket:', lastEvent.data);
      
      // Find if this bundle was updated
      const updatedBundle = lastEvent.data.updatedBundles.find(
        (b: any) => b._id === bundleId
      );
      
      // If this bundle was updated, update the details
      if (updatedBundle) {
        console.log('Updating BIF details with WebSocket data:', updatedBundle);
        
        // Store the updated values to avoid dependency issues
        const newCurrentPrice = updatedBundle.currentPrice;
        const newPriceChangePercent = updatedBundle.priceChangePercent;
        const newLastUpdated = updatedBundle.lastUpdated;
        
        setBundleDetails(prevDetails => {
          if (!prevDetails) return null;
          
          return {
            ...prevDetails,
            bundle: {
              ...prevDetails.bundle,
              currentPrice: newCurrentPrice,
              priceChangePercent: newPriceChangePercent,
              lastUpdated: newLastUpdated
            },
            metrics: {
              ...prevDetails.metrics,
              currentPrice: newCurrentPrice,
              priceChangePercent: newPriceChangePercent
            }
          };
        });
      }
    }
  // Only depend on lastEvent and bundleId, not bundleDetails which changes when we update it
  }, [lastEvent, bundleId]);

  const handleDelete = async () => {
    if (!bundleId || !confirm("Are you sure you want to delete this BIF?")) {
      return;
    }
    
    try {
      setDeleteLoading(true);
      setDeleteError("");
      
      const response = await fetch(`/api/bonks/${bundleId}`, {
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
        setDeleteError(data.message || "Failed to delete BIF");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <main className="container mx-auto py-10 px-4">
          <div className="max-w-6xl mx-auto">
            <BundleDetailsLoading />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <main className="container mx-auto py-10 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-50 p-6 rounded-md text-red-600">
              {error}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!bundleDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Bundle Header */}
            <BundleHeader 
              bundle={bundleDetails.bundle} 
              tokenCount={bundleDetails.metrics.tokenCount}
              onDelete={handleDelete}
              deleteLoading={deleteLoading}
            />
            
            {/* Bundle Stats */}
            <div className="border-t border-gray-100">
              <BundleStats metrics={bundleDetails.metrics} />
            </div>
            
            {/* Bundle Tokens */}
            <div className="border-t border-gray-100">
              <BundleTokensSection 
                tokens={sortedTokens} 
                totalPrice={bundleDetails.metrics.totalPrice} 
              />
            </div>
            
            {deleteError && (
              <div className="p-6 bg-red-50 text-red-600 border-t border-red-100">
                {deleteError}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
