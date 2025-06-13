import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TokenModel from '@/models/Token';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const searchParams = request.nextUrl.searchParams;
    const searchTerm = searchParams.get('search');
    
    let query = {};
    
    // If search term is provided, search by name or symbol
    if (searchTerm && searchTerm.length >= 2) {
      // Create a case-insensitive regex search for name or symbol
      const searchRegex = new RegExp(searchTerm, 'i');
      query = {
        $or: [
          { name: searchRegex },
          { symbol: searchRegex }
        ]
      };
    }

    // Get tokens from the database, sorted by price (descending)
    const tokens = await TokenModel.find(query)
      .sort({ price: -1 })
      .limit(100); // Limit to 100 tokens for performance

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: searchTerm 
          ? `No tokens found matching "${searchTerm}"` 
          : 'No tokens found in the database'
      });
    }

    return NextResponse.json({
      success: true,
      data: tokens,
      count: tokens.length
    });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'An unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
