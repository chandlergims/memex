export interface Token {
  _id?: string;
  address: string;
  name: string;
  symbol: string;
  price: number;
  logoURI?: string;
  lastUpdated?: Date;
}

export interface Bundle {
  _id: string;
  title: string;
  description?: string;
  tokenAddresses: string[];
  initialPrice: number;
  currentPrice: number;
  priceChangePercent: number;
  createdAt: string;
  lastUpdated: string;
}

export interface BundleMetrics {
  initialPrice: number;
  currentPrice: number;
  priceChangePercent: number;
  totalPrice: number;
  tokenCount: number;
}

// Function to validate Solana addresses
export function isValidSolanaAddress(address: string): boolean {
  // Solana addresses are base58-encoded strings
  // They are typically 32-44 characters long
  const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return solanaAddressRegex.test(address);
}
