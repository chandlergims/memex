"use client";

import { PrivyProvider as PrivyAuthProvider, usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

interface PrivyProviderProps {
  children: React.ReactNode;
}

// Create a wrapper component to handle auth state
function AuthStateWrapper({ children }: { children: React.ReactNode }) {
  const { authenticated, user } = usePrivy();
  
  // You can use authenticated and user state here
  // For example, you could redirect unauthenticated users from protected routes
  
  return <>{children}</>;
}

export default function PrivyProvider({ children }: PrivyProviderProps) {
  return (
    <PrivyAuthProvider
      appId="cmblhg94p00gojl0mri44ttng"
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
