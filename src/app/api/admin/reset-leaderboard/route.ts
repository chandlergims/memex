import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BundleModel from '@/models/Bundle';

export async function POST(request: NextRequest) {
  try {
    // Simple admin authentication - in a real app, use a more secure method
    const authorization = request.headers.get('authorization');
    const adminKey = process.env.ADMIN_API_KEY || 'test-admin-key';
    
    if (authorization !== adminKey) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    // Mark all existing bundles as inactive
    const result = await BundleModel.updateMany({}, { isActive: false });
    
    return NextResponse.json({
      success: true,
      message: 'Leaderboard reset successfully. All existing bundles marked as inactive.',
      updatedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error resetting leaderboard:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'An unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
