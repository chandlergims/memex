import mongoose, { Schema, Document } from 'mongoose';

export interface IToken extends Document {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  price: number;
  logoURI?: string;
  lastUpdated: Date;
}

const TokenSchema: Schema = new Schema({
  address: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  symbol: { 
    type: String, 
    required: true 
  },
  decimals: { 
    type: Number, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  logoURI: { 
    type: String 
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
});

// Check if the model already exists to prevent overwriting during hot reloads
export default mongoose.models.Token || mongoose.model<IToken>('Token', TokenSchema);
