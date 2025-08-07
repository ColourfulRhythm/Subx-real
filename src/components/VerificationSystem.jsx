import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../firebase';
import { 
  sendEmailVerification, 
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import toast from 'react-hot-toast';

const VerificationSystem = ({ user, onVerificationComplete, onBack }) => {
  const [verificationStep, setVerificationStep] = useState('email');
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [signupMethod, setSignupMethod] = useState('email'); // 'email' or 'phone'

  useEffect(() => {
    // Get stored credentials for email verification
    const storedEmail = localStorage.getItem('tempUserEmail');
    const storedPassword = localStorage.getItem('tempUserPassword');
    
    // Always use email verification
    setUserEmail(storedEmail);
    setUserPassword(storedPassword);
    setSignupMethod('email');
    setVerificationStep('email');
    

  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleEmailVerification = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      let currentUserObj = auth.currentUser;
      
      // Re-authenticate if needed
      if (!currentUserObj && userEmail && userPassword) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, userEmail, userPassword);
          currentUserObj = userCredential.user;
          console.log('Re-authenticated user:', currentUserObj.email);
        } catch (authError) {
          console.error('Re-authentication failed:', authError);
          throw new Error('Please login again to send verification email');
        }
      }
      
      if (!currentUserObj) {
        throw new Error('No authenticated user found. Please login again.');
      }
      
      // Check if email is already verified
      await currentUserObj.reload();
      if (currentUserObj.emailVerified) {
        toast.success('Email is already verified!');
        setEmailVerified(true);
        return;
      }
      
      // Send verification email
      await sendEmailVerification(currentUserObj);
              toast.success('📧 Verification email sent! Check your inbox and spam folder.');
      setResendDisabled(true);
      setCountdown(60);
      
    } catch (error) {
      console.error('Email verification error:', error);
      let errorMessage = 'Failed to send verification email. ';
      
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please wait before requesting another verification email.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'User not found. Please sign up again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Auto-send verification email for new users
  useEffect(() => {
    if (auth.currentUser && !auth.currentUser.emailVerified && userEmail) {
      console.log('Auto-sending verification email for new user');
      setTimeout(() => {
        handleEmailVerification();
      }, 1000); // Small delay to ensure component is mounted
    }
  }, [userEmail]); // Trigger when userEmail is set

  const checkEmailVerification = async () => {
    try {
      setLoading(true);
      
      // Re-authenticate user if needed
      if (!auth.currentUser) {
        const userCredential = await signInWithEmailAndPassword(auth, userEmail, userPassword);
        console.log('Re-authenticated for verification check');
      }
      
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        setEmailVerified(true);
        
        // Create user in backend database
        try {
          const storedName = localStorage.getItem('tempUserName');
          const storedUserType = localStorage.getItem('tempUserType');
          
          const userData = {
            name: storedName || auth.currentUser.displayName || auth.currentUser.email,
            email: auth.currentUser.email,
            password: userPassword, // This will be hashed on the backend
            phone: '', // Can be updated later
            bio: '', // Can be updated later
            investmentInterests: 'Real estate' // Default value
          };
          
          const response = await fetch('https://subxbackend-production.up.railway.app/api/investors', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
            },
            body: JSON.stringify(userData)
          });
          
          if (response.ok) {
            console.log('User created in backend successfully');
            toast.success('Email verified successfully! Account created. Redirecting to dashboard...');
          } else {
            const errorData = await response.json();
            if (errorData.error === 'Email already registered') {
              console.log('User already exists in backend');
              toast.success('Email verified successfully! Redirecting to dashboard...');
            } else {
              console.error('Backend user creation failed:', errorData);
              toast.error('Account verification complete, but backend setup failed. Please contact support.');
            }
          }
        } catch (backendError) {
          console.error('Backend user creation error:', backendError);
          toast.success('Email verified successfully! Redirecting to dashboard...');
        }
        
        // Complete verification
        setTimeout(() => {
          onVerificationComplete();
        }, 1500);
      } else {
        toast.error('Email not verified yet. Please check your inbox and click the verification link.');
      }
    } catch (error) {
      console.error('Email verification check error:', error);
      toast.error('Failed to check email verification status.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerification = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    // Validate phone number format
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(formattedPhone)) {
      toast.error('Please enter a valid international phone number format (+234...)');
      return;
    }

    try {
      setLoading(true);
      
      // For phone-only signup, we don't need to re-authenticate
      if (signupMethod === 'email' && !auth.currentUser && userEmail && userPassword) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, userEmail, userPassword);
          console.log('Re-authenticated for phone verification');
        } catch (authError) {
          console.log('Re-authentication failed:', authError.code);
          throw new Error('Please login first before verifying phone number');
        }
      }
      
      console.log('Proceeding with phone verification, signup method:', signupMethod);
      
      // Clear any existing reCAPTCHA
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      // Create new reCAPTCHA verifier
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal',
        'callback': (response) => {
          console.log('reCAPTCHA solved:', response);
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          toast.error('reCAPTCHA expired. Please try again.');
        }
      });

      console.log('reCAPTCHA verifier created');

      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      window.confirmationResult = confirmationResult;
      
      setShowPhoneInput(true);
      toast.success('Verification code sent to your phone!');
      setResendDisabled(true);
      setCountdown(60);
    } catch (error) {
      console.error('Phone verification error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to send verification code. ';
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format. Please use international format (+234...).';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please upgrade Firebase plan or try later.';
      } else if (error.code === 'auth/captcha-check-failed') {
        errorMessage = 'reCAPTCHA verification failed. Please refresh and try again.';
      } else if (error.code === 'auth/missing-phone-number') {
        errorMessage = 'Please enter a valid phone number.';
      } else if (error.message.includes('reCAPTCHA')) {
        errorMessage = 'reCAPTCHA setup issue. Please refresh the page and try again.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    try {
      setLoading(true);
      
      const result = await window.confirmationResult.confirm(verificationCode);
      if (result.user) {
        setPhoneVerified(true);
        toast.success('Phone number verified successfully!');
        
        // For phone-only signup, create proper Firebase user account now
        if (signupMethod === 'phone') {
          const userName = localStorage.getItem('tempUserName');
          const userPhone = localStorage.getItem('tempUserPhone');
          const userPassword = localStorage.getItem('tempUserPassword');
          
          // Create a unique email using timestamp to avoid conflicts
          const uniqueEmail = `${userPhone.replace(/\D/g, '')}.${Date.now()}@subx-phone.local`;
          
          try {
            // Sign out the current phone user first
            await auth.signOut();
            
            // Create new user with email/password
            const userCredential = await createUserWithEmailAndPassword(auth, uniqueEmail, userPassword);
            console.log('Firebase user created for phone signup:', userCredential.user.uid);
            
            // Store the email for backend registration
            localStorage.setItem('tempUserEmail', uniqueEmail);
          } catch (error) {
            console.error('Error creating Firebase user:', error);
            toast.error('Error creating account. Please try again.');
            return;
          }
        }
        
        // Complete verification process
        console.log('Phone verification successful, completing...');
        setTimeout(() => {
          onVerificationComplete();
        }, 1500);
      }
    } catch (error) {
      console.error('Phone code verification error:', error);
      
      if (error.code === 'auth/network-request-failed') {
        // Network error but verification might have succeeded
        console.log('Network error detected, checking auth state...');
        
        // Check if user is actually authenticated despite the error
        setTimeout(() => {
          if (auth.currentUser) {
            console.log('User is authenticated despite network error, completing verification...');
            toast.success('Phone verified successfully!');
            onVerificationComplete();
          } else {
            toast.error('Network error. Please check your connection and try again.');
          }
        }, 2000);
      } else if (error.code === 'auth/invalid-verification-code') {
        toast.error('Invalid verification code. Please try again.');
      } else {
        toast.error('Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
      >
        <button
          onClick={onBack}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-900 mb-2"
          >
            Verify Your Account
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600"
          >
            Please verify your email to complete your account setup
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {verificationStep === 'email' && signupMethod === 'email' && (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", damping: 25 }}
              className="space-y-6"
            >
              <div className="text-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Verification</h3>
                <p className="text-gray-600 mb-4">
                  We've sent a verification email to <strong>{userEmail}</strong>
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    📧 <strong>Don't see the email?</strong> Please check your <strong>spam/junk folder</strong>. 
                    Verification emails sometimes end up there.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEmailVerification}
                  disabled={loading || resendDisabled}
                  className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? 'Sending...' : resendDisabled ? `Resend in ${countdown}s` : 'Send Verification Email'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={checkEmailVerification}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all duration-200"
                >
                  {loading ? 'Checking...' : 'I\'ve Verified My Email'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {false && verificationStep === 'phone' && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", damping: 25 }}
              className="space-y-6"
            >
              <div className="text-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Verification</h3>
                <p className="text-gray-600 mb-4">
                  Please verify your phone number to complete registration
                </p>
              </div>

              {!showPhoneInput ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePhoneVerification}
                    disabled={loading || !phoneNumber}
                    className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200"
                  >
                    {loading ? 'Sending...' : 'Send Verification Code'}
                  </motion.button>

                  <div id="recaptcha-container"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center text-lg tracking-widest transition-all duration-200"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={verifyPhoneCode}
                    disabled={loading || verificationCode.length !== 6}
                    className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all duration-200"
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowPhoneInput(false)}
                    className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                  >
                    Change Phone Number
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {verificationStep === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 25 }}
              className="text-center space-y-6"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto"
              >
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-900">Verification Complete!</h3>
              <p className="text-gray-600">
                Your account has been successfully verified. You can now access your dashboard.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default VerificationSystem; 