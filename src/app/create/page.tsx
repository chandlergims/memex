"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Token } from "@/types";
import { usePrivy } from '@privy-io/react-auth';
import { isValidSolanaAddress } from "@/types";
import BundleDetailsStep from "@/components/BundleDetailsStep";
import TokenSelectionStep from "@/components/TokenSelectionStep";

export default function CreatePage() {
  const router = useRouter();
  const [selectedTokens, setSelectedTokens] = useState<Token[]>([]);
  const [availableTokens, setAvailableTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [tokensLoading, setTokensLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { authenticated, user, login } = usePrivy();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Token search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Token[]>([]);
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenDetails, setTokenDetails] = useState<Token | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [dataSource, setDataSource] = useState<string>("");

  // Fetch all available tokens on component mount
  useEffect(() => {
    fetchTokens();
  }, []);

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

  // Filter available tokens based on search term
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = availableTokens.filter(token => 
      token.name.toLowerCase().includes(term) || 
      token.symbol.toLowerCase().includes(term)
    );
    
    setSearchResults(filtered);
  }, [searchTerm, availableTokens]);

  const handleAddToken = (token: Token) => {
    if (selectedTokens.length >= 20) {
      setError("You cannot add more than 20 tokens to an Index");
      return;
    }
    
    // Check if token is already in the bundle by address (case insensitive)
    if (selectedTokens.some(t => t.address.toLowerCase() === token.address.toLowerCase())) {
      setError("This token is already in your Index");
      return;
    }
    
    setSelectedTokens([...selectedTokens, token]);
    setError("");
  };

  const handleRemoveToken = (address: string) => {
    setSelectedTokens(selectedTokens.filter(token => token.address !== address));
  };

  // Fetch token details by address
  const fetchTokenDetails = async () => {
    if (!tokenAddress.trim()) {
      setTokenError("Please enter a Solana token address");
      return;
    }

    // Validate that the address is a valid Solana address
    if (!isValidSolanaAddress(tokenAddress.trim())) {
      setTokenError("Invalid Solana token address format");
      return;
    }

    setTokenLoading(true);
    setTokenError("");
    setTokenDetails(null);
    setDataSource("");

    try {
      // Use our API route which checks the database first
      const response = await fetch(`/api/tokens?address=${tokenAddress}`);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setTokenDetails(data.data);
        setDataSource(data.source || "unknown");
      } else {
        setTokenError(data.message || "Failed to fetch token details");
      }
    } catch (err) {
      setTokenError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setTokenLoading(false);
    }
  };

  // Check if a token is already selected
  const isTokenSelected = (address: string) => {
    return selectedTokens.some(t => t.address.toLowerCase() === address.toLowerCase());
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/i)) {
      setImageError("Please select a valid image file (JPEG, PNG, GIF, WEBP)");
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image size should be less than 5MB");
      return;
    }
    
    try {
      setUploadingImage(true);
      setImageError("");
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload the image
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        setImageUrl(result.data.url);
        setImageError("");
      } else {
        setImageError(result.message || "Error uploading image");
        setImagePreview("");
      }
    } catch (error) {
      setImageError("Error uploading image");
      setImagePreview("");
    } finally {
      setUploadingImage(false);
    }
  };
  
  const handleRemoveImage = () => {
    setImageUrl("");
    setImagePreview("");
    setImageError("");
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authenticated) {
      setError("Please login with Twitter to create an Index");
      login();
      return;
    }
    
    if (!title.trim()) {
      setError("Please enter a title for your Index");
      return;
    }
    
    if (!description.trim()) {
      setError("Please enter a description for your Index");
      return;
    }
    
    if (!imageUrl) {
      setError("Please upload an image for your Index");
      return;
    }
    
    if (selectedTokens.length < 5) {
      setError("Please select at least 5 tokens for your Index");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch("/api/bonks", {
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
        setSuccess("Index created successfully!");
        // Redirect to home page after successful creation
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setError(data.message || "Failed to create Index");
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          {success && (
            <div className="mb-6 text-green-600 bg-green-50 p-4 rounded-lg text-sm border border-green-200">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="mr-3" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                </svg>
                <div>
                  <div className="font-medium">{success}</div>
                  <div className="text-green-500 text-xs mt-1">Redirecting to homepage...</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 text-red-600 bg-red-50 p-4 rounded-lg text-sm border border-red-200">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="mr-3" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit}>
            {/* Bundle Details Section */}
            <div className="mb-8">
              <BundleDetailsStep
                title={title}
                setTitle={setTitle}
                description={description}
                setDescription={setDescription}
                imagePreview={imagePreview}
                imageError={imageError}
                uploadingImage={uploadingImage}
                handleImageChange={handleImageChange}
                handleRemoveImage={handleRemoveImage}
              />
            </div>

            {/* Token Selection Section */}
            <div className="border-t border-gray-200 pt-8">
              <TokenSelectionStep
                selectedTokens={selectedTokens}
                availableTokens={availableTokens}
                tokensLoading={tokensLoading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchResults={searchResults}
                tokenAddress={tokenAddress}
                setTokenAddress={setTokenAddress}
                tokenDetails={tokenDetails}
                tokenLoading={tokenLoading}
                tokenError={tokenError}
                handleAddToken={handleAddToken}
                handleRemoveToken={handleRemoveToken}
                fetchTokenDetails={fetchTokenDetails}
                isTokenSelected={isTokenSelected}
              />
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end pt-8 border-t border-gray-200 mt-8">
              <button
                type="submit"
                disabled={loading || selectedTokens.length < 5 || !title.trim() || !description.trim() || !imageUrl}
                className={`px-6 py-2 ${(selectedTokens.length < 5 || !title.trim() || !description.trim() || !imageUrl) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : loading ? 'bg-gray-800 text-white cursor-wait' : 'bg-black text-white hover:bg-gray-800 cursor-pointer'} rounded-lg transition-colors font-medium`}
              >
                {loading ? "Creating Index..." : "Create Index"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
