"use client";

import { useState } from "react";
import { RemoveIcon } from "./icons/RemoveIcon";

interface BundleDetailsStepProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  imagePreview: string;
  imageError: string;
  uploadingImage: boolean;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: () => void;
}

export default function BundleDetailsStep({
  title,
  setTitle,
  description,
  setDescription,
  imagePreview,
  imageError,
  uploadingImage,
  handleImageChange,
  handleRemoveImage
}: BundleDetailsStepProps) {
  return (
    <div className="space-y-4">
      {/* Image Upload Circle at Top */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative flex items-center justify-center w-24 h-24 mb-2 overflow-hidden bg-gray-100 rounded-full">
          <input
            type="file"
            id="image-upload"
            onChange={handleImageChange}
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            disabled={uploadingImage}
          />
          <label 
            htmlFor="image-upload"
            className="absolute inset-0 flex items-center justify-center transition-colors cursor-pointer hover:bg-gray-200"
          >
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt="Bundle Image (Max 5MB)" 
                className="object-cover w-full h-full"
              />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="text-gray-400" viewBox="0 0 16 16">
                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
              </svg>
            )}
            
            {uploadingImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                <svg className="w-8 h-8 text-[#ff5c01] animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </label>
          
          {/* Delete button removed as requested */}
        </div>
        <span className="text-sm text-center text-gray-500">Bonks Image (Max 5MB)</span>
        
        {imageError && (
          <p className="mt-1 text-sm text-red-600">{imageError}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-bold text-gray-700">
          Bonks Name *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter Bonks name (max 10 chars)"
          className="flex w-full h-10 px-3 py-2 text-sm border border-gray-100 bg-gray-50 rounded-md focus:outline-none"
          required
          maxLength={10}
        />
        {title.length > 0 && (
          <p className="text-xs text-gray-500">{10 - title.length} characters remaining</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-bold text-gray-700">
          Bonks Description *
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
              <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6zm0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
            </svg>
          </span>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="The greatest Bonks ever created (max 20 chars)"
            className="flex w-full h-10 pl-10 pr-3 py-2 text-sm border border-gray-100 bg-gray-50 rounded-md focus:outline-none"
            maxLength={20}
            required
          />
        </div>
        {description.length > 0 && (
          <p className="text-xs text-gray-500">{20 - description.length} characters remaining</p>
        )}
      </div>
    </div>
  );
}
