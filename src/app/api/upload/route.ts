import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Function to get the file extension from a mime type
function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg'
  };
  
  return mimeToExt[mimeType] || 'jpg';
}

// Function to upload a file to Firebase Storage
async function uploadToFirebase(file: File, filename: string): Promise<string> {
  try {
    // Create a storage reference
    const storageRef = ref(storage, `uploads/${filename}`);
    
    // Convert the file to a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload the file to Firebase Storage
    await uploadBytes(storageRef, buffer);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading to Firebase:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    // Validate file type
    const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size exceeds the 5MB limit.' },
        { status: 400 }
      );
    }
    
    // Generate a unique filename
    const ext = getExtensionFromMimeType(file.type);
    const filename = `${uuidv4()}.${ext}`;
    
    try {
      // Upload the file to Firebase Storage
      const fileUrl = await uploadToFirebase(file, filename);
      
      return NextResponse.json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          url: fileUrl
        }
      });
    } catch (error) {
      console.error('Error saving file:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Error saving file'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing upload:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'An unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
