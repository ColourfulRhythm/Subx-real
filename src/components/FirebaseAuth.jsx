import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import * as firebaseui from 'firebaseui';
import { GoogleAuthProvider, EmailAuthProvider } from 'firebase/auth';
import 'firebaseui/dist/firebaseui.css';

const FirebaseAuth = () => {
  const elementRef = useRef(null);
  const navigate = useNavigate();
  const uiRef = useRef(null);
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    if (!selectedProfile) return;

    // Check if FirebaseUI is already initialized
    if (firebaseui.auth.AuthUI.getInstance()) {
      // If it exists, get the instance
      uiRef.current = firebaseui.auth.AuthUI.getInstance();
    } else {
      // If it doesn't exist, create a new instance
      uiRef.current = new firebaseui.auth.AuthUI(auth);
    }

    const uiConfig = {
      signInOptions: [
        {
          provider: GoogleAuthProvider.PROVIDER_ID,
          requireDisplayName: false
        },
        {
          provider: EmailAuthProvider.PROVIDER_ID,
          requireDisplayName: false
        }
      ],
      signInFlow: 'popup',
      callbacks: {
        signInSuccessWithAuthResult: (authResult) => {
          // Set authentication status
          localStorage.setItem('isAuthenticated', 'true');
          
          // Set the selected user type
          localStorage.setItem('userType', selectedProfile);
          
          // Navigate to the appropriate dashboard
          navigate(`/dashboard/${selectedProfile}`);
          return false;
        }
      }
    };

    // Start the UI
    uiRef.current.start(elementRef.current, uiConfig);

    // Cleanup function
    return () => {
      if (uiRef.current) {
        uiRef.current.reset();
      }
    };
  }, [navigate, selectedProfile]);

  const handleProfileSelect = (profileType) => {
    setSelectedProfile(profileType);
  };

  if (!selectedProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Decorative top bar */}
            <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            
            {/* Content */}
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </h2>
                <p className="text-gray-600">
                  Select your profile type to continue
                </p>
              </div>

              {/* Profile Selection */}
              <div className="space-y-4">
                <button
                  onClick={() => handleProfileSelect('investor')}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Continue as Investor
                </button>
                <button
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-400 cursor-not-allowed opacity-60"
                  disabled
                  title="Not available, coming soon"
                >
                  Continue as Developer (Coming Soon)
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-8 text-center text-sm text-gray-600">
                <p>
                  By signing in, you agree to our{' '}
                  <a href="/terms" className="text-indigo-600 hover:text-indigo-500">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-indigo-600 hover:text-indigo-500">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Decorative top bar */}
          <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          
          {/* Content */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">
                Sign in to continue as {selectedProfile === 'investor' ? 'Investor' : 'Developer'}
              </p>
            </div>

            {/* Auth UI Container */}
            <div 
              ref={elementRef} 
              className="space-y-4"
              style={{
                '--firebaseui-primary-color': '#4F46E5',
                '--firebaseui-primary-color-dark': '#4338CA',
                '--firebaseui-primary-color-light': '#818CF8',
                '--firebaseui-accent-color': '#4F46E5',
                '--firebaseui-background-color': '#ffffff',
                '--firebaseui-text-color': '#374151',
                '--firebaseui-error-color': '#EF4444',
                '--firebaseui-font-family': 'Inter, system-ui, -apple-system, sans-serif',
              }}
            ></div>

            {/* Back button */}
            <div className="mt-4 text-center space-y-4">
              <button
                onClick={() => setSelectedProfile(null)}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                ← Back to profile selection
              </button>
              <div>
                <button
                  onClick={() => navigate('/')}
                  className="text-sm text-gray-600 hover:text-gray-500"
                >
                  Cancel and return to home
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 text-center text-sm text-gray-600">
              <p>
                By signing in, you agree to our{' '}
                <a href="/terms" className="text-indigo-600 hover:text-indigo-500">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-indigo-600 hover:text-indigo-500">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseAuth; 