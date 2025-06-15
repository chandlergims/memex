import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TokenModel from '@/models/Token';
import BundleModel from '@/models/Bundle';
// We'll use a different approach to access the WebSocket server

// Helper function to chunk an array into smaller arrays
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// Helper function to calculate percentage change
function calculatePercentChange(currentPrice: number, initialPrice: number): number {
  if (initialPrice === 0) return 0;
  return ((currentPrice - initialPrice) / initialPrice) * 100;
}

// This function will be called by a cron job every minute
export async function GET(request: NextRequest) {
  // Log when this endpoint is called
  console.log('=== CRON JOB API ENDPOINT CALLED ===');
  console.log('Time:', new Date().toISOString());
  console.log('Request URL:', request.url);
  console.log('Request headers:', JSON.stringify(Object.fromEntries(request.headers)));

  try {
    await dbConnect();

    // Get all tokens from the database
    const tokens = await TokenModel.find({});
    
    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No tokens found to update' 
      });
    }

    const updatedTokens = [];
    const errors = [];

    // Chunk token addresses into groups of 100 (Birdeye API limit)
    const tokenAddressChunks = chunkArray(
      tokens.map(token => token.address),
      100
    );

    // Process each chunk of token addresses
    for (const addressChunk of tokenAddressChunks) {
      try {
        console.log(`Processing chunk of ${addressChunk.length} tokens`);
        
        // Fetch the latest prices from Birdeye multi_price API
        const apiUrl = `https://public-api.birdeye.so/defi/multi_price`;
        console.log(`Fetching from Birdeye API: ${apiUrl}`);
        
        const response = await fetch(
          apiUrl,
          {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'x-chain': 'solana',
              'content-type': 'application/json',
              'X-API-KEY': process.env.BIRDEYE_API_KEY || 'bc0762da61f540678ed2931870a1272c'
            },
            body: JSON.stringify({
              list_address: addressChunk.join(',')
            })
          }
        );

        if (!response.ok) {
          console.log(`API request failed for chunk: Status ${response.status}`);
          throw new Error(`Birdeye API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log(`API response for chunk:`, JSON.stringify(data).substring(0, 200) + '...');
        
        if (data.success && data.data) {
          // Process each token in the response
          for (const address of Object.keys(data.data)) {
            try {
              const tokenData = data.data[address];
              const token = tokens.find(t => t.address === address);
              
              if (!token) {
                console.log(`Token not found in database: ${address}`);
                continue;
              }
              
              console.log(`Processing token: ${token.symbol} (${address})`);
              
              const currentPrice = tokenData.value || 0;
              
              console.log(`Token data for ${token.symbol}:`, {
                currentPrice
              });
              
              // Update the token in the database
              await TokenModel.findByIdAndUpdate(token._id, {
                price: currentPrice,
                lastUpdated: new Date()
              });
              
              updatedTokens.push({
                address: token.address,
                symbol: token.symbol,
                price: currentPrice
              });
            } catch (error) {
              console.error(`Error processing token ${address}:`, error);
              errors.push({
                address: address,
                error: error instanceof Error ? error.message : String(error)
              });
            }
          }
        } else {
          throw new Error(data.message || 'Failed to fetch token details from Birdeye');
        }
      } catch (error) {
        console.error(`Error processing chunk:`, error);
        errors.push({
          error: error instanceof Error ? error.message : String(error)
        });
      }
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // We're only tracking 5m price changes now

      // Update bundle metrics based on new token prices
      const updatedBundles = await updateBundleMetrics();
      
      // Emit WebSocket event for updated tokens and bundles if global.io is available
      console.log('Checking WebSocket availability...');
      console.log('global defined:', typeof global !== 'undefined');
      if (typeof global !== 'undefined') {
        console.log('global.io exists:', !!global.io);
      }
      
      if (typeof global !== 'undefined' && global.io) {
        console.log('Emitting prices:updated event via WebSocket');
        global.io.emit('prices:updated', {
          updatedTokens,
          updatedBundles
        });
      } else {
        console.warn('WebSocket server not available, could not emit prices:updated event');
      }

    return NextResponse.json({
      success: true,
      updated: updatedTokens.length,
      errors: errors.length,
      updatedTokens,
      errorDetails: errors
    });
  } catch (error) {
    console.error('Error updating token prices:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'An unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

// Helper function to update bundle metrics
async function updateBundleMetrics() {
  try {
    // Get all bundles
    const bundles = await BundleModel.find({});
    const updatedBundles = [];
    
    for (const bundle of bundles) {
      // Get all tokens in the bundle
      const tokens = await TokenModel.find({
        address: { $in: bundle.tokenAddresses }
      });
      
      if (tokens.length === 0) continue;
      
      // Calculate current total price of the bundle
      const currentPrice = tokens.reduce((sum, token) => sum + token.price, 0);
      
      // Calculate price change percentage from initial price
      const priceChangePercent = bundle.initialPrice > 0 
        ? ((currentPrice - bundle.initialPrice) / bundle.initialPrice) * 100 
        : 0;
      
      // Update bundle metrics in the database
      await BundleModel.findByIdAndUpdate(bundle._id, {
        currentPrice,
        priceChangePercent,
        lastUpdated: new Date()
      });
      
      console.log(`Updated metrics for bundle ${bundle.title}:`, {
        initialPrice: bundle.initialPrice,
        currentPrice,
        priceChangePercent: priceChangePercent.toFixed(2) + '%'
      });
      
      // Add to the list of updated bundles
      updatedBundles.push({
        _id: bundle._id,
        title: bundle.title,
        currentPrice,
        priceChangePercent,
        lastUpdated: new Date()
      });
    }
    
    return updatedBundles;
  } catch (error) {
    console.error('Error updating bundle metrics:', error);
    return [];
  }
}
