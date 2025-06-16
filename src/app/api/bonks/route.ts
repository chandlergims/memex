import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BundleModel from '@/models/Bundle';
import TokenModel from '@/models/Token';
import { Server } from 'socket.io';

// Declare global io instance type
declare global {
  var io: Server | undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, imageUrl, tokenAddresses, userId, twitterUsername } = body;

    if (!title || !tokenAddresses || !Array.isArray(tokenAddresses)) {
      return NextResponse.json(
        { success: false, message: 'Title and token addresses array are required' },
        { status: 400 }
      );
    }

    // Validate number of tokens
    if (tokenAddresses.length < 5) {
      return NextResponse.json(
        { success: false, message: 'Bonk must contain at least 5 tokens' },
        { status: 400 }
      );
    }

    if (tokenAddresses.length > 20) {
      return NextResponse.json(
        { success: false, message: 'Bonk cannot contain more than 20 tokens' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    // Check if the user has already created 5 ACTIVE bonks
    if (userId) {
      const userBundleCount = await BundleModel.countDocuments({ userId, isActive: true });
      if (userBundleCount >= 5) {
        return NextResponse.json(
          { success: false, message: 'You have reached the maximum limit of 5 active Bonks per user for this leaderboard session' },
          { status: 400 }
        );
      }
    } else if (twitterUsername) {
      const userBundleCount = await BundleModel.countDocuments({ twitterUsername, isActive: true });
      if (userBundleCount >= 5) {
        return NextResponse.json(
          { success: false, message: 'You have reached the maximum limit of 5 active Bonks per user for this leaderboard session' },
          { status: 400 }
        );
      }
    }

    // Verify all token addresses exist in the database
    const tokens = await TokenModel.find({
      address: { $in: tokenAddresses }
    });

    if (tokens.length !== tokenAddresses.length) {
      return NextResponse.json(
        { success: false, message: 'One or more token addresses are invalid or not in the database' },
        { status: 400 }
      );
    }

    // Calculate the initial price of the bundle (sum of all token prices)
    const initialPrice = tokens.reduce((sum, token) => sum + token.price, 0);

    // Create the bundle
    const bundle = new BundleModel({
      title,
      description,
      imageUrl,
      tokenAddresses,
      initialPrice,
      currentPrice: initialPrice, // Initially, current price equals initial price
      priceChangePercent: 0, // Initially, price change is 0%
      createdAt: new Date(),
      lastUpdated: new Date(),
      userId,
      twitterUsername,
      isActive: true // Explicitly set isActive to true for new bundles
    });

    await bundle.save();

    // Get the complete bundle with populated tokens for the WebSocket event
    const completeBundle = await BundleModel.findById(bundle._id).lean();
    
    // Emit a WebSocket event for real-time updates
    try {
      // Access the global io instance
      if (global.io) {
        global.io.emit('bonk:created', {
          bundle: completeBundle
        });
        console.log('WebSocket event emitted: bonk:created');
      } else {
        console.log('Socket.io instance not available');
      }
    } catch (socketError) {
      console.error('Error emitting WebSocket event:', socketError);
      // Continue with the response even if WebSocket emission fails
    }

    return NextResponse.json({
      success: true,
      message: 'Bonk created successfully',
      data: bundle
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating bonk:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'An unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    // Build query - only return active bundles by default
    const query = userId 
      ? { userId, isActive: { $ne: false } } 
      : { isActive: { $ne: false } };

    const bundles = await BundleModel.find(query)
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .lean();

    return NextResponse.json({
      success: true,
      data: bundles
    });
  } catch (error) {
    console.error('Error fetching bonks:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'An unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
