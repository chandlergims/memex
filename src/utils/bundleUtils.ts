import { Token } from "@/types";

export interface BundleMetricsResult {
  totalPrice: number;
}

// Calculate bundle metrics based on selected tokens
export function calculateBundleMetrics(tokens: Token[]): BundleMetricsResult {
  if (tokens.length === 0) {
    return { 
      totalPrice: 0
    };
  }
  
  let totalPrice = 0;
  
  // Calculate total price
  tokens.forEach(token => {
    totalPrice += token.price || 0;
  });
  
  return { 
    totalPrice
  };
}
