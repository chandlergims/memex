import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  userId: string;
  twitterUsername?: string;
  twitterProfileImageUrl?: string;
  email?: string;
  displayName?: string;
  solanaAddress?: string;
  totalRewards: number;
  createdAt: Date;
  lastLoginAt: Date;
}

const UserSchema = new Schema<IUser>({
  userId: { type: String, required: true, unique: true },
  twitterUsername: { type: String },
  twitterProfileImageUrl: { type: String },
  email: { type: String },
  displayName: { type: String },
  solanaAddress: { type: String },
  totalRewards: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date, default: Date.now }
});

// Check if the model already exists to prevent OverwriteModelError
const UserModel: Model<IUser> = mongoose.models.User as Model<IUser> || mongoose.model<IUser>('User', UserSchema);

export default UserModel;
