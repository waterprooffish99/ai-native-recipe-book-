import React from 'react';
import { SignedIn, SignedOut } from '@clerk/clerk-react';

interface AuthWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AuthWrapper component matches user authentication state using Clerk.
 * Conditionally displays protected children if SignedIn, or displays the fallback UI if SignedOut.
 */
export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children, fallback }) => {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      {fallback && (
        <SignedOut>
          {fallback}
        </SignedOut>
      )}
    </>
  );
};

export default AuthWrapper;
