"use client";

import { useState, useEffect } from "react";
import { Token } from "@/types";
import TokenSearch from "@/components/TokenSearch";
import SelectedTokens from "@/components/SelectedTokens";
import BundleForm from "@/components/BundleForm";
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

export default function CreateBundlePage() {
  const [selectedTokens, setSelectedTokens] = useState<Token[]>([]);
  const [availableTokens, setAvailableTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [tokensLoading, setTokensLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { authenticated, user, login } = usePrivy();
  const router = useRouter();

  // Fetch all available tokens on page load
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setTokensLoading(true);
        const response = await fetch("/api/tokens/all");
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setAvailableTokens(data.data);
        } else {
          setError(data.message || "Failed to fetch tokens");
        }
      } catch (err) {
        setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setTokensLoading(false);
      }
    };
    
    fetchTokens();
  }, []);

  const handleAddToken = (token: Token) => {
    if (selectedTokens.length >= 20) {
      setError("You cannot add more than 20 tokens to a bundle");
      return;
    }
    
    // Check if token is already in the bundle by address (case insensitive)
    if (selectedTokens.some(t => t.address.toLowerCase() === token.address.toLowerCase())) {
      setError("This token is already in your bundle");
      return;
    }
    
    setSelectedTokens([...selectedTokens, token]);
    setError("");
  };

  const handleRemoveToken = (address: string) => {
    setSelectedTokens(selectedTokens.filter(token => token.address !== address));
  };

  const handleSubmit = async (title: string, description: string, imageUrl: string) => {
    if (!authenticated) {
      setError("Please login with Twitter to create a bundle");
      login();
      return;
    }
    
    if (!title.trim()) {
      setError("Please enter a title for your bundle");
      return;
    }
    
    if (selectedTokens.length < 5) {
      setError("Please select at least 5 tokens for your bundle");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch("/api/bundles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          imageUrl,
          tokenAddresses: selectedTokens.map(token => token.address),
          userId: user?.id,
          twitterUsername: user?.twitter?.username
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess("Bundle created successfully!");
        setSelectedTokens([]);
      } else {
        setError(data.message || "Failed to create bundle");
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Create Memecoin Index</h1>
          
          {!authenticated && (
            <div className="mb-6 bg-blue-50 p-4 rounded-md">
              <p className="text-blue-700 mb-2">Please login with Twitter to create an index</p>
              <button
                onClick={login}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Login with Twitter
              </button>
            </div>
          )}
          
          {success && (
            <div className="mb-6 text-green-600 bg-green-50 p-4 rounded-md">
              {success}
            </div>
          )}
          
          {error && (
            <div className="mb-6 text-red-600 bg-red-50 p-4 rounded-md">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Bundle Form and Selected Tokens */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6 self-start">
              {/* Bundle Form */}
              <BundleForm 
                onSubmit={handleSubmit}
                isValid={selectedTokens.length >= 5}
                isLoading={loading}
              />
              
              {/* Selected Tokens */}
              <SelectedTokens 
                tokens={selectedTokens}
                onRemoveToken={handleRemoveToken}
              />
            </div>
            
            {/* Right Column - Token Search */}
            <div className="lg:col-span-7">
              <TokenSearch 
                onAddToken={handleAddToken}
                selectedTokens={selectedTokens}
                availableTokens={availableTokens}
                isLoading={tokensLoading}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
