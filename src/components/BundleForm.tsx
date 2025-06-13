"use client";

import { useState, useRef } from "react";

interface BundleFormProps {
  onSubmit: (title: string, description: string, imageUrl: string) => Promise<void>;
  isValid: boolean;
  isLoading: boolean;
}

export default function BundleForm({ onSubmit, isValid, isLoading }: BundleFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && !isLoading) {
      await onSubmit(title, description, imageUrl);
      // Reset form after successful submission
      setTitle("");
      setDescription("");
      setImageUrl("");
      setImagePreview("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Bundle Details</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter bundle title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            maxLength={10}
          />
          <p className="mt-1 text-xs text-gray-500">Max 10 characters ({10 - title.length} remaining)</p>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter bundle description"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
            maxLength={20}
          />
          <p className="mt-1 text-xs text-gray-500">Max 20 characters ({20 - description.length} remaining)</p>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Index Image (Optional)
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              id="image-upload"
              disabled={uploadingImage}
            />
            <label 
              htmlFor="image-upload"
              className={`px-3 py-2 bg-gray-100 text-gray-700 rounded-md cursor-pointer hover:bg-gray-200 ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {uploadingImage ? 'Uploading...' : 'Choose Image'}
            </label>
            {imagePreview && !uploadingImage && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            )}
          </div>
          
          {imageError && (
            <p className="mt-1 text-sm text-red-600">{imageError}</p>
          )}
          
          {imagePreview && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1">Preview:</p>
              <div className="relative w-32 h-32 border border-gray-200 rounded-md overflow-hidden">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? "Creating..." : "Create Bundle"}
        </button>
      </form>
    </div>
  );
}
