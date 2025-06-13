import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TokenModel from '@/models/Token';

// Function to validate Solana addresses
function isValidSolanaAddress(address: string): boolean {
  // Solana addresses are base58-encoded strings
  // They are typically 32-44 characters long
  const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return solanaAddressRegex.test(address);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { success: false, message: 'Address parameter is required' },
      { status: 400 }
    );
  }

  // Validate that the address is a valid Solana address
  if (!isValidSolanaAddress(address)) {
    return NextResponse.json(
      { success: false, message: 'Invalid Solana token address format' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    // Try to find the token in our database first
    // Use case-insensitive search by converting both to lowercase
    const tokenFromDb = await TokenModel.findOne({ 
      address: { $regex: new RegExp('^' + address + '$', 'i') } 
    });

    // If found in DB and not too old (less than 24 hours), return it
    if (tokenFromDb) {
      const lastUpdated = new Date(tokenFromDb.lastUpdated);
      const now = new Date();
      const hoursSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

      if (hoursSinceUpdate < 24) {
        return NextResponse.json({
          success: true,
          data: tokenFromDb,
          source: 'database'
        });
      }
    }

    // If not found in DB or data is too old, fetch from Birdeye API
    const response = await fetch(
      `https://public-api.birdeye.so/defi/token_overview?address=${address}`,
      {
        headers: {
          'X-API-KEY': process.env.BIRDEYE_API_KEY || 'bc0762da61f540678ed2931870a1272c',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Birdeye API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch token details from Birdeye' },
        { status: 404 }
      );
    }

    // Save or update the token in our database
    const tokenData = data.data;
    
    const tokenToSave = {
      address: address, // Store the original case of the address
      name: tokenData.name || 'Unknown',
      symbol: tokenData.symbol || 'Unknown',
      decimals: tokenData.decimals || 0,
      price: tokenData.price || 0,
      previousPrice: tokenData.price || 0, // Set previous price equal to current price for new tokens
      priceChange5m: 0, // Set to 0 for new tokens since we just added it
      supply: tokenData.supply || 0,
      logoURI: tokenData.logoURI || tokenData.logo || '',
      lastUpdated: new Date()
    };

    // Use findOneAndUpdate with upsert to either update existing or create new
    // Use case-insensitive search with regex
    await TokenModel.findOneAndUpdate(
      { address: { $regex: new RegExp('^' + address + '$', 'i') } },
      tokenToSave,
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      data: tokenToSave,
      source: 'birdeye'
    });
  } catch (error) {
    console.error('Error fetching token details:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'An unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
