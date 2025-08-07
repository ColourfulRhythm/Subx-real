import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const FirebaseAuth = () => {
  const navigate = useNavigate();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [networkStatus, setNetworkStatus] = useState('checking');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState('+234');
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    nonAlphanumeric: false,
    number: false,
    uppercase: false
  });
  const [authMethod, setAuthMethod] = useState('email'); // 'email' or 'phone'



  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    console.log('Starting email auth...', { authMode, email: email.substring(0, 3) + '***' });
    
    // Validate form fields for signup
    if (authMode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name');
        setIsLoading(false);
        return;
      }
      if (authMethod === 'email' && !email.trim()) {
        setError('Please enter your email address');
        setIsLoading(false);
        return;
      }
      if (authMethod === 'phone' && !phone.trim()) {
        setError('Please enter your phone number');
        setIsLoading(false);
        return;
      }
      if (!validatePassword(password)) {
        setError('Password does not meet the requirements. Please check the requirements below.');
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }
    }
    
    try {
      let userCredential;
      const identifier = authMethod === 'email' ? email : phone;
      
      if (authMode === 'signup') {
        // For signup, we'll use email as the primary identifier but store phone if provided
        const signupEmail = authMethod === 'email' ? email : `${phone.replace(/\D/g, '')}@subx.local`;
        
        userCredential = await createUserWithEmailAndPassword(auth, signupEmail, password);
        
        // Update user profile with name (handle potential errors)
        try {
          // Note: updateProfile is deprecated, we'll store the name in localStorage instead
          console.log('User created successfully with name:', name);
        } catch (profileError) {
          console.warn('Could not update profile display name:', profileError);
          // Continue anyway - the account was created successfully
        }
        
        // Increment user count for new signups
        if (window.incrementSubxUserCount) {
          window.incrementSubxUserCount();
        }
        
        // Show success message for new signup
        alert(`Welcome ${name}! Your land sub-ownership account has been created successfully. You can now access your ${selectedProfile} dashboard.`);
      } else {
        // For signin, try both email and phone formats
        let signinEmail = identifier;
        if (authMethod === 'phone') {
          signinEmail = `${phone.replace(/\D/g, '')}@subx.local`;
        }
        
        userCredential = await signInWithEmailAndPassword(auth, signinEmail, password);
        
        // Show success message for login
        alert(`Welcome back! You have been successfully logged in as a ${selectedProfile}. You can now access your land sub-ownership dashboard.`);
      }
      
      const user = userCredential.user;
      
      // Set authentication status with actual user data
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userType', selectedProfile);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', name || user.displayName || user.email);
      if (authMethod === 'phone') {
        localStorage.setItem('userPhone', phone);
      }
      
      // Navigate to the new unified dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Email auth error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (error.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up instead.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (error.code === 'auth/password-does-not-meet-requirements') {
        setError('Password does not meet the requirements. Please check the requirements below.');
      } else {
        // Remove "Firebase:" prefix from error messages
        const cleanMessage = error.message.replace(/^Firebase:\s*/, '');
        setError(cleanMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSelect = (profileType) => {
    setSelectedProfile(profileType);
  };



  // Password validation function
  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      nonAlphanumeric: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      number: /\d/.test(password),
      uppercase: /[A-Z]/.test(password)
    };
    setPasswordRequirements(requirements);
    return Object.values(requirements).every(Boolean);
  };

  // Check network status on component mount
  useEffect(() => {
    const checkNetwork = async () => {
      try {
        await fetch('https://www.google.com/favicon.ico', { 
          method: 'HEAD',
          mode: 'no-cors'
        });
        setNetworkStatus('connected');
      } catch (error) {
        setNetworkStatus('disconnected');
        console.warn('Network connectivity issue detected');
      }
    };
    
    checkNetwork();
  }, []);



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
                  Continue as Sub-owner
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
                {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-600">
                {authMode === 'signin' ? 'Sign in to continue as' : 'Sign up as'} {selectedProfile === 'investor' ? 'Sub-owner' : 'Developer'}
              </p>
            </div>

            {/* Network Status */}
            {networkStatus === 'disconnected' && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-700">
                  ⚠️ Network connectivity issues detected. Some features may not work properly. 
                  If you're having trouble accessing the site, try using a VPN or check your internet connection.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}



            {/* Authentication Method Toggle */}
            <div className="mb-4">
              <div className="flex rounded-lg border border-gray-300 p-1">
                <button
                  type="button"
                  onClick={() => setAuthMethod('email')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    authMethod === 'email'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('phone')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    authMethod === 'phone'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Phone Number
                </button>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={authMode === 'signup'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your full name"
                  />
                </div>
              )}
              
              {authMethod === 'email' ? (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your email"
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="flex">
                    <select
                      value={selectedCountryCode}
                      onChange={(e) => setSelectedCountryCode(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    >
                      <option value="+234">🇳🇬 +234</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+86">🇨🇳 +86</option>
                      <option value="+81">🇯🇵 +81</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+27">🇿🇦 +27</option>
                      <option value="+254">🇰🇪 +254</option>
                      <option value="+233">🇬🇭 +233</option>
                    </select>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (authMode === 'signup') {
                        validatePassword(e.target.value);
                      }
                    }}
                    required
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {authMode === 'signup' && password && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-gray-600">Password requirements:</p>
                    <div className="space-y-1">
                      <div className={`flex items-center text-xs ${passwordRequirements.length ? 'text-green-600' : 'text-red-600'}`}>
                        <span className="mr-1">{passwordRequirements.length ? '✓' : '✗'}</span>
                        At least 8 characters
                      </div>
                      <div className={`flex items-center text-xs ${passwordRequirements.uppercase ? 'text-green-600' : 'text-red-600'}`}>
                        <span className="mr-1">{passwordRequirements.uppercase ? '✓' : '✗'}</span>
                        At least one uppercase letter
                      </div>
                      <div className={`flex items-center text-xs ${passwordRequirements.number ? 'text-green-600' : 'text-red-600'}`}>
                        <span className="mr-1">{passwordRequirements.number ? '✓' : '✗'}</span>
                        At least one number
                      </div>
                      <div className={`flex items-center text-xs ${passwordRequirements.nonAlphanumeric ? 'text-green-600' : 'text-red-600'}`}>
                        <span className="mr-1">{passwordRequirements.nonAlphanumeric ? '✓' : '✗'}</span>
                        At least one special character (!@#$%^&*)
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {authMode === 'signup' && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={authMode === 'signup'}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading...' : (authMode === 'signin' ? 'Sign In' : 'Sign Up')}
              </button>
            </form>

            {/* Toggle Auth Mode */}
            <div className="mt-4 text-center">
              <button
                onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                {authMode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>

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
              <p className="mt-2 text-xs text-gray-500">
                💡 After login, access your <strong>Land Sub-ownership</strong> dashboard with <strong>Connections</strong> and <strong>Analytics</strong>!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseAuth; 