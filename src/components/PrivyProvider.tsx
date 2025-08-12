"use client";

import { PrivyProvider as PrivyAuthProvider, usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useCallback } from 'react';

interface PrivyProviderProps {
  children: React.ReactNode;
}

// Create a wrapper component to handle auth state
function AuthStateWrapper({ children }: { children: React.ReactNode }) {
  const { authenticated, user } = usePrivy();
  
  // Function to create or update user in database
  const createOrUpdateUser = useCallback(async () => {
    if (!authenticated || !user?.id) return;
    
    try {
      console.log("Creating/updating user in database:", user.id);
      
      // Create or update user in database
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          twitterUsername: user?.twitter?.username,
          email: user?.email?.address
        }),
      });
      
      if (!response.ok) {
        console.error("Failed to create/update user:", response.status);
      } else {
        console.log("User created/updated successfully");
      }
    } catch (err) {
      console.error("Error creating/updating user:", err);
    }
  }, [authenticated, user]);
  
  // Create or update user when authenticated
  useEffect(() => {
    if (authenticated && user?.id) {
      createOrUpdateUser();
    }
  }, [authenticated, user, createOrUpdateUser]);
  
  return <>{children}</>;
}

export default function PrivyProvider({ children }: PrivyProviderProps) {
  return (
    <PrivyAuthProvider
      appId="cme82l2c104cxjl0co9w1l8hp"
      config={{
        loginMethods: ['twitter'],
        appearance: {
          theme: 'light',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <AuthStateWrapper>
        {children}
      </AuthStateWrapper>
    </PrivyAuthProvider>
  );
}
