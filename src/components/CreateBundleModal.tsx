"use client";

import { useState, useEffect } from "react";
import { Token } from "@/types";
import { usePrivy } from '@privy-io/react-auth';
import { isValidSolanaAddress } from "@/types";
import { CloseIcon, NextIcon, BackIcon, SubmitIcon } from "./icons/NavigationIcons";
import BundleDetailsStep from "./BundleDetailsStep";
import TokenSelectionStep from "./TokenSelectionStep";

interface CreateBundleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateBundleModal({ isOpen, onClose }: CreateBundleModalProps) {
  const [step, setStep] = useState(1);
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

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setTitle("");
      setDescription("");
      setImageUrl("");
      setImagePreview("");
      setSelectedTokens([]);
      setError("");
      setSuccess("");
    }
  }, [isOpen]);

  // Fetch all available tokens on modal open
  useEffect(() => {
    if (isOpen && step === 2) {
      fetchTokens();
    }
  }, [isOpen, step]);

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
      setError("You cannot add more than 20 tokens to a Bonk");
      return;
    }
    
    // Check if token is already in the bundle by address (case insensitive)
    if (selectedTokens.some(t => t.address.toLowerCase() === token.address.toLowerCase())) {
      setError("This token is already in your Bonk");
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

  const handleNextStep = () => {
    if (step === 1) {
      if (!title.trim()) {
        setError("Please enter a title for your Bonk");
        return;
      }
      if (!description.trim()) {
        setError("Please enter a description for your Bonk");
        return;
      }
      if (!imageUrl) {
        setError("Please upload an image for your Bonk");
        return;
      }
      setError("");
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authenticated) {
      setError("Please login with Twitter to create a Bonk");
      login();
      return;
    }
    
    if (!title.trim()) {
      setError("Please enter a title for your Bonk");
      return;
    }
    
    if (selectedTokens.length < 5) {
      setError("Please select at least 5 tokens for your Bonk");
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
        setSuccess("Bonk created successfully!");
        // Close the modal immediately instead of waiting
        onClose();
      } else {
        // Show specific error message for bundle limit
        if (data.message && data.message.includes("maximum limit of 5 bundles")) {
          setError("You have reached the maximum limit of 5 Bonks per user for this leaderboard session.");
        } else {
          setError(data.message || "Failed to create Bonk");
        }
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex flex-col gap-y-1.5 p-4 border-b-2 border-green-600">
          <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            {step === 1 ? "Create a BIF" : "Select Tokens"}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
          >
            <CloseIcon />
          </button>
        </div>
        </div>

        {/* Progress indicator */}
        <div className="px-4 pt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: step === 1 ? '50%' : '100%' }}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span className={step === 1 ? 'font-medium text-green-600' : 'font-medium text-gray-700'}>BIF Details</span>
            <span className={step === 2 ? 'font-medium text-green-600' : 'font-medium text-gray-700'}>Select Tokens</span>
          </div>
        </div>

        {success && (
          <div className="mx-4 mt-4 text-green-600 bg-green-50 p-3 rounded-md text-sm border border-green-200">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-2" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
              </svg>
              {success}
            </div>
          </div>
        )}
        
        {error && (
          <div className="mx-4 mt-4 text-red-600 bg-red-50 p-3 rounded-md text-sm border border-red-200">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-2" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
              </svg>
              {error === "Please upload an image for your Bonk" ? (
                <span className="font-bold">{error}</span>
              ) : (
                error
              )}
            </div>
          </div>
        )}

        <div className="overflow-y-auto flex-grow">
          <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }}>
            <div className="p-4">
              {/* Step 1: Bundle Details */}
              {step === 1 && (
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
              )}

              {/* Step 2: Token Selection */}
              {step === 2 && (
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
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between">
              <div className="flex gap-2 w-full">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <span className="font-bold">Cancel</span>
                </button>
                
                {step === 1 ? (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-md transition-colors ml-auto cursor-pointer"
                  >
                    <span className="font-bold">Next</span>
                  </button>
                ) : (
                  <div className="flex gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      <span className="font-bold">Back</span>
                    </button>
                    <button
                      type="submit"
                      disabled={loading || selectedTokens.length < 5}
                      className={`px-4 py-2 ${selectedTokens.length < 5 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : loading ? 'bg-green-50 text-green-500 cursor-wait' : 'bg-green-50 text-green-600 hover:bg-green-100 cursor-pointer'} rounded-md transition-colors`}
                    >
                      {loading ? "Creating..." : <span className="font-bold">Create</span>}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
