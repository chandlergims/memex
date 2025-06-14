import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const userData = await req.json();
    
    if (!userData.userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'User ID is required' 
      }, { status: 400 });
    }
    
    // Prepare user data
    const userToSave = {
      userId: userData.userId,
      lastLoginAt: new Date()
    };
    
    // Add optional fields if they exist
    if (userData.twitterUsername) {
      userToSave['twitterUsername'] = userData.twitterUsername;
    }
    
    if (userData.twitterProfileImageUrl) {
      userToSave['twitterProfileImageUrl'] = userData.twitterProfileImageUrl;
    }
    
    if (userData.email) {
      userToSave['email'] = userData.email;
    }
    
    if (userData.displayName) {
      userToSave['displayName'] = userData.displayName;
    }
    
    if (userData.solanaAddress) {
      userToSave['solanaAddress'] = userData.solanaAddress;
    }
    
    // Use findOneAndUpdate with upsert to either update existing or create new
    const user = await UserModel.findOneAndUpdate(
      { userId: userData.userId },
      { 
        $set: userToSave,
        $setOnInsert: { 
          createdAt: new Date(),
          totalRewards: 0
        }
      },
      { upsert: true, new: true }
    );
    
    return NextResponse.json({ 
      success: true, 
      data: user 
    });
    
  } catch (error) {
    console.error('Error in user API:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An unknown error occurred' 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const twitterUsername = url.searchParams.get('twitterUsername');
    
    if (!userId && !twitterUsername) {
      return NextResponse.json({ 
        success: false, 
        message: 'Either userId or twitterUsername is required' 
      }, { status: 400 });
    }
    
    // Build query
    const query = userId 
      ? { userId } 
      : { twitterUsername };
    
    // Use findOneAndUpdate to just get the document without updating
    const user = await UserModel.findOne(query).lean();
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: user 
    });
    
  } catch (error) {
    console.error('Error in user API:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An unknown error occurred' 
    }, { status: 500 });
  }
}
