import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BundleModel from '@/models/Bundle';
import TokenModel from '@/models/Token';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Await the params object before accessing its properties
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Bonk ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the bundle
    const bundle = await BundleModel.findById(id);

    if (!bundle) {
      return NextResponse.json(
        { success: false, message: 'Bonk not found' },
        { status: 404 }
      );
    }

    // Get all tokens in the bundle
    const tokens = await TokenModel.find({
      address: { $in: bundle.tokenAddresses }
    });

    // Bundle metrics are now stored in the bundle document
    // We just need to calculate the total current price of all tokens
    const totalPrice = tokens.reduce((sum, token) => sum + (token.price || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        bundle,
        tokens,
        metrics: {
          initialPrice: bundle.initialPrice,
          currentPrice: bundle.currentPrice,
          priceChangePercent: bundle.priceChangePercent,
          totalPrice, // This is the sum of current token prices
          tokenCount: tokens.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching bonk:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'An unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Await the params object before accessing its properties
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Bonk ID is required' },
        { status: 400 }
      );
    }

    // Get the user ID from the request body
    const { userId } = await request.json().catch(() => ({}));

    await dbConnect();

    // Find the bundle first
    const bundle = await BundleModel.findById(id);

    if (!bundle) {
      return NextResponse.json(
        { success: false, message: 'Bonk not found' },
        { status: 404 }
      );
    }

    // Check if the user is the creator of the bundle
    if (userId && bundle.userId && bundle.userId !== userId) {
      return NextResponse.json(
        { success: false, message: 'You are not authorized to delete this bonk' },
        { status: 403 }
      );
    }

    // Delete the bundle
    await BundleModel.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Bonk deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bonk:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'An unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
