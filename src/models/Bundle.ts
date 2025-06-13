import mongoose, { Schema, Document } from 'mongoose';

export interface IBundle extends Document {
  title: string;
  description?: string;
  imageUrl?: string;
  tokenAddresses: string[];
  initialPrice: number;
  currentPrice: number;
  priceChangePercent: number;
  createdAt: Date;
  lastUpdated: Date;
  userId?: string;
  twitterUsername?: string;
}

const BundleSchema: Schema = new Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  tokenAddresses: { 
    type: [String], 
    required: true,
    validate: [
      {
        validator: function(addresses: string[]) {
          return addresses.length >= 5; // Minimum 5 tokens
        },
        message: 'Bundle must contain at least 5 tokens'
      },
      {
        validator: function(addresses: string[]) {
          return addresses.length <= 20; // Maximum 20 tokens
        },
        message: 'Bundle cannot contain more than 20 tokens'
      }
    ]
  },
  initialPrice: {
    type: Number,
    default: 0
  },
  currentPrice: {
    type: Number,
    default: 0
  },
  priceChangePercent: {
    type: Number,
    default: 0
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  },
  userId: {
    type: String,
    index: true
  },
  twitterUsername: {
    type: String,
    trim: true
  }
});

// Check if the model already exists to prevent overwriting during hot reloads
export default mongoose.models.Bundle || mongoose.model<IBundle>('Bundle', BundleSchema);
