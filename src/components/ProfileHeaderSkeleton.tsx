import React from 'react';

const ProfileHeaderSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl p-8 mb-8 shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Left Column - Profile Image Skeleton */}
        <div className="flex flex-col items-center">
          <div className="w-28 h-28 bg-gray-200 rounded-full animate-pulse"></div>
          
          <div className="mt-4 text-center">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        
        {/* Stats and Actions Skeleton */}
        <div className="flex-1 flex flex-col justify-center w-full">
          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
                <div className="h-8 w-12 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mx-auto"></div>
              </div>
            ))}
          </div>
          
          <div className="h-6"></div>
        </div>
      </div>
      
      {/* Solana Address Input Skeleton */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-grow">
            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-28 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeaderSkeleton;
