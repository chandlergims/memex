"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useWebSocket } from './WebSocketProvider';
import LiveTickerBarSkeleton from './LiveTickerBarSkeleton';

interface Bundle {
  _id: string;
  title: string;
  priceChangePercent: number;
  imageUrl?: string;
}

export default function LiveTickerBar() {
  const [topGainers, setTopGainers] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const tickerRef = useRef<HTMLDivElement>(null);
  const { lastEvent } = useWebSocket();

  // Fetch top gainers on component mount
  useEffect(() => {
    const fetchTopGainers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/bonks');
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          // Sort by price change percentage (highest first) and take top 14
          const sorted = [...data.data]
            .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
            .slice(0, 14);
          
          setTopGainers(sorted);
        }
      } catch (err) {
        console.error('Error fetching top gainers:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopGainers();
  }, []);
  
  // Update top gainers when prices are updated via WebSocket
  useEffect(() => {
    if (!lastEvent) return;
    
    if (lastEvent.type === 'prices:updated' && lastEvent.data?.updatedBundles) {
      setTopGainers(prev => {
        // Create a map of existing bundles for quick lookup
        const bundleMap = new Map(prev.map(bundle => [bundle._id, bundle]));
        
        // Update existing bundles with new data
        lastEvent.data.updatedBundles.forEach((updatedBundle: any) => {
          if (bundleMap.has(updatedBundle._id)) {
            bundleMap.set(updatedBundle._id, {
              ...bundleMap.get(updatedBundle._id)!,
              priceChangePercent: updatedBundle.priceChangePercent,
              imageUrl: updatedBundle.imageUrl || bundleMap.get(updatedBundle._id)!.imageUrl
            });
          }
        });
        
        // Convert map back to array, sort, and take top 14
        return Array.from(bundleMap.values())
          .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
          .slice(0, 14);
      });
    }
  }, [lastEvent]);

  // Add CSS animation style to the document
  useEffect(() => {
    if (loading || topGainers.length === 0) return;
    
    // Create a style element
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .scroll-container {
        display: flex;
        width: 100%;
        overflow: hidden;
      }
      
      .scroll-content {
        display: flex;
        animation: scroll 30s linear infinite;
        align-items: center;
        padding: 0.25rem 0;
        white-space: nowrap;
      }
      
      .ticker-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0;
      }
      
      .ticker-content {
        display: flex;
        align-items: center;
        padding: 0 1rem;
      }
      
      .ticker-divider {
        color: #e5e7eb;
        padding: 0 0.5rem;
      }
      
      @keyframes scroll {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-100%);
        }
      }
      
      /* When the first animation completes, the second copy will be in view,
         creating a seamless infinite scroll effect without visible restarts */
      
      .scroll-container:hover .scroll-content {
        animation-play-state: paused;
      }
    `;
    
    // Add the style to the document head
    document.head.appendChild(styleElement);
    
    // Clean up
    return () => {
      document.head.removeChild(styleElement);
    };
  }, [loading, topGainers]);

  if (loading) {
    return <LiveTickerBarSkeleton />;
  }
  
  if (topGainers.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-white to-[#fff8f3] border-b border-[#ffebdc] py-1.5 relative flex h-[40px] w-full items-center overflow-hidden" ref={tickerRef}>
      <div className="scroll-container">
        <div className="scroll-content">
          {topGainers.map((bundle, index) => (
            <div key={bundle._id} className="ticker-item">
              <div className="ticker-content">
                <Link 
                  href={`/bonks/${bundle._id}`}
                  className="inline-flex items-center"
                >
                  {bundle.imageUrl && (
                    <img 
                      src={bundle.imageUrl} 
                      alt={bundle.title}
                      className="w-5 h-5 rounded-full mr-1.5 object-cover"
                    />
                  )}
                  <span className="text-sm font-bold text-gray-700 mr-1.5">{bundle.title}</span>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                    bundle.priceChangePercent > 0 
                      ? 'text-green-600 bg-green-50' 
                      : 'text-red-600 bg-red-50'
                  }`}>
                    {bundle.priceChangePercent > 0 ? '+' : ''}{bundle.priceChangePercent.toFixed(2)}%
                  </span>
                </Link>
              </div>
              <span className="ticker-divider">|</span>
            </div>
          ))}
        </div>
        <div className="scroll-content">
          {topGainers.map((bundle, index) => (
            <div key={`dup-${bundle._id}`} className="ticker-item">
              <div className="ticker-content">
                <Link 
                  href={`/bonks/${bundle._id}`}
                  className="inline-flex items-center"
                >
                  {bundle.imageUrl && (
                    <img 
                      src={bundle.imageUrl} 
                      alt={bundle.title}
                      className="w-5 h-5 rounded-full mr-1.5 object-cover"
                    />
                  )}
                  <span className="text-sm font-bold text-gray-700 mr-1.5">{bundle.title}</span>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                    bundle.priceChangePercent > 0 
                      ? 'text-green-600 bg-green-50' 
                      : 'text-red-600 bg-red-50'
                  }`}>
                    {bundle.priceChangePercent > 0 ? '+' : ''}{bundle.priceChangePercent.toFixed(2)}%
                  </span>
                </Link>
              </div>
              <span className="ticker-divider">|</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
