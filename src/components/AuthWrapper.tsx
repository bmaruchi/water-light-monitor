
import React from 'react';
import { SignIn, SignUp, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const location = useLocation();
  
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        {location.pathname.includes('/sign-up') ? (
          <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4">
            <div className="w-full max-w-md">
              <h1 className="text-3xl font-bold text-center mb-6">Monitor de Consumo</h1>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4">
            <div className="w-full max-w-md">
              <h1 className="text-3xl font-bold text-center mb-6">Monitor de Consumo</h1>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
              </div>
            </div>
          </div>
        )}
      </SignedOut>
    </>
  );
};

export default AuthWrapper;
