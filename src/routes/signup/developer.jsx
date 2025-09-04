import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import Navbar from '../../components/Navbar';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().when('$signupMethod', {
    is: 'email',
    then: (schema) => schema.email('Invalid email').required('Email is required'),
    otherwise: (schema) => schema.optional(),
  }),
  phone: yup.string().required('Phone number is required'),
  password: yup.string().when('$signupMethod', {
    is: 'email',
    then: (schema) => schema
      .min(6, 'Password must be at least 6 characters')
      .matches(/[^a-zA-Z0-9]/, 'Password must contain at least one special character (!@#$%^&*)')
      .required('Password is required'),
    otherwise: (schema) => schema.optional(),
  }),
  confirmPassword: yup.string().when('$signupMethod', {
    is: 'email',
    then: (schema) => schema.oneOf([yup.ref('password'), null], 'Passwords must match').required('Confirm password is required'),
    otherwise: (schema) => schema.optional(),
  }),
  company: yup.string().required('Company name is required'),
  website: yup.string().url('Invalid website URL').required('Website is required'),
  bio: yup.string().required('Bio is required'),
  projectTypes: yup.string().required('Project types are required'),
  experience: yup.string().required('Experience is required'),
})

export default function DeveloperSignup() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedCountryCode, setSelectedCountryCode] = useState('+234')
  const [signupMethod, setSignupMethod] = useState('email') // Only email signup for now
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    context: { signupMethod }
  })

  // Google authentication removed for now

  const onSubmit = async (data) => {
    setIsLoading(true)
    setError('')
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Update user profile with display name
      await updateProfile(user, {
        displayName: data.name
      });

      // Send email verification using our custom function
      try {
        const verificationLink = `https://subxhq.com/verify-email?uid=${user.uid}&token=${user.uid}`;
        const response = await fetch('https://us-central1-subx-825e9.cloudfunctions.net/sendEmailVerification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: data.email,
            name: data.name,
            verificationLink: verificationLink
          })
        });
        
        if (response.ok) {
          console.log('✅ Custom email verification sent successfully');
        } else {
          console.warn('⚠️ Custom email verification failed, using Firebase default');
          // Fallback to Firebase default
          await sendEmailVerification(user);
        }
      } catch (emailError) {
        console.warn('⚠️ Custom email verification error:', emailError);
        // Fallback to Firebase default
        await sendEmailVerification(user);
      }

      if (user) {
        // Create user profile in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          full_name: data.name,
          email: data.email,
          user_type: 'developer',
          created_at: new Date(),
          updated_at: new Date()
        });

        // Create user_profiles record to trigger referral code generation
        try {
          await setDoc(doc(db, 'user_profiles', user.uid), {
            id: user.uid,
            full_name: data.name,
            email: data.email,
            phone: data.phone || null,
            created_at: new Date(),
            updated_at: new Date()
          });

          console.log('User profile created successfully, referral code should be generated')
        } catch (profileError) {
          console.warn('Failed to create user profile:', profileError)
        }

        // Store user info in localStorage (but not authenticated yet)
        localStorage.setItem('userType', 'developer')
        localStorage.setItem('userId', authData.user.id)
        localStorage.setItem('userEmail', authData.user.email)
        localStorage.setItem('userName', data.name)

        // Show verification message
        alert('Account created successfully! Please check your email and verify your account before logging in.')
        
        // Navigate to login page
        navigate('/login')
      }
    } catch (error) {
      setError('Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // const handleGoogleSignup = async () => {
  //   setIsLoading(true)
  //   setError('')
  //   try {
  //     const result = await signInWithPopup(auth, provider)
  //     const user = result.user
      
  //     // Store user data for verification
  //     setCurrentUser(user)
  //     setShowVerification(true)
      
  //     // Store form data for later use
  //     localStorage.setItem('tempUserName', user.displayName || user.email)
  //     localStorage.setItem('tempUserType', 'developer')
      
  //   } catch (error) {
  //     console.error('Google signup error:', error)
  //     setError(error.message)
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  // const handleVerificationComplete = () => {
  //   // Set authentication status after verification
  //   localStorage.setItem('isAuthenticated', 'true')
  //   localStorage.setItem('userType', 'developer')
  //   localStorage.setItem('userEmail', currentUser.email)
  //   localStorage.setItem('userName', localStorage.getItem('tempUserName'))
  //   localStorage.setItem('userPhone', localStorage.getItem('tempUserPhone'))
    
  //   // Increment user count
  //   if (window.incrementSubxUserCount) {
  //     window.incrementSubxUserCount();
  //   }
    
  //   // Clean up temp data
  //   localStorage.removeItem('tempUserName')
  //   localStorage.removeItem('tempUserPhone')
  //   localStorage.removeItem('tempUserType')
  //   localStorage.removeItem('tempUserEmail')
  //   localStorage.removeItem('tempUserPassword')
  //   localStorage.removeItem('tempUserCompany')
  //   localStorage.removeItem('tempUserWebsite')
  //   localStorage.removeItem('tempUserBio')
  //   localStorage.removeItem('tempUserProjectTypes')
  //   localStorage.removeItem('tempUserExperience')
    
  //   navigate('/dashboard')
  // }

  // const handleBackToSignup = () => {
  //   setShowVerification(false)
  //   setCurrentUser(null)
  //   // Clean up the created user if they go back
  //   if (currentUser) {
  //     currentUser.delete()
  //   }
  // }

  // if (showVerification) {
  //   return (
  //     <VerificationSystem
  //       user={currentUser}
  //       onVerificationComplete={handleVerificationComplete}
  //       onBack={handleBackToSignup}
  //     />
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            Create Developer Profile
          </motion.h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Cancel
          </motion.button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-2xl sm:px-10"
        >
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Signup Method Toggle */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Sign up with:
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setSignupMethod('email')}
                  className={`flex-1 py-2 px-4 rounded-lg border transition-all duration-200 ${
                    signupMethod === 'email'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Email</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSignupMethod('phone')}
                  className={`flex-1 py-2 px-4 rounded-lg border transition-all duration-200 ${
                    signupMethod === 'phone'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>Phone</span>
                  </div>
                </button>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <motion.div whileHover={{ scale: 1.02 }} className="mt-1">
                <input
                  id="name"
                  {...register('name')}
                  type="text"
                  className="block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </motion.div>
              {errors.name && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {errors.name.message}
                </motion.p>
              )}
            </motion.div>

            {/* Email field - only show for email signup */}
            {signupMethod === 'email' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <motion.div whileHover={{ scale: 1.02 }} className="mt-1">
                  <input
                    id="email"
                    {...register('email')}
                    type="email"
                    className="block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                </motion.div>
                {errors.email && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Company Name
              </label>
              <motion.div whileHover={{ scale: 1.02 }} className="mt-1">
                <input
                  id="company"
                  {...register('company')}
                  type="text"
                  className="block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </motion.div>
              {errors.company && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {errors.company.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <motion.div whileHover={{ scale: 1.02 }} className="mt-1">
                <div className="relative">
                  <input
                    id="password"
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 pr-10 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
              </motion.div>
              {errors.password && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {errors.password.message}
                </motion.p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters and contain at least one special character (!@#$%^&*)
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <motion.div whileHover={{ scale: 1.02 }} className="mt-1">
                <div className="relative">
                  <input
                    id="confirmPassword"
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 pr-10 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
              </motion.div>
              {errors.confirmPassword && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {errors.confirmPassword.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number
              </label>
              <motion.div whileHover={{ scale: 1.02 }} className="mt-1">
                <div className="flex">
                  <select
                    value={selectedCountryCode}
                    onChange={(e) => setSelectedCountryCode(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white bg-white dark:bg-gray-700"
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
                    id="phone"
                    {...register('phone')}
                    type="tel"
                    className="flex-1 px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    placeholder="Enter your phone number"
                  />
                </div>
              </motion.div>
              {errors.phone && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {errors.phone.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Website
              </label>
              <motion.div whileHover={{ scale: 1.02 }} className="mt-1">
                <input
                  id="website"
                  {...register('website')}
                  type="url"
                  className="block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </motion.div>
              {errors.website && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {errors.website.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bio
              </label>
              <motion.div whileHover={{ scale: 1.02 }} className="mt-1">
                <textarea
                  id="bio"
                  {...register('bio')}
                  rows={4}
                  className="block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </motion.div>
              {errors.bio && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {errors.bio.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
            >
              <label htmlFor="projectTypes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Project Types
              </label>
              <motion.div whileHover={{ scale: 1.02 }} className="mt-1">
                <select
                  id="projectTypes"
                  {...register('projectTypes')}
                  multiple
                  className="block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="mixed-use">Mixed-Use</option>
                  <option value="industrial">Industrial</option>
                </select>
              </motion.div>
              {errors.projectTypes && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {errors.projectTypes.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Experience Level
              </label>
              <motion.div whileHover={{ scale: 1.02 }} className="mt-1">
                <select
                  id="experience"
                  {...register('experience')}
                  className="block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  <option value="">Select your experience level</option>
                  <option value="beginner">Beginner (0-2 years)</option>
                  <option value="intermediate">Intermediate (2-5 years)</option>
                  <option value="experienced">Experienced (5-10 years)</option>
                  <option value="expert">Expert (10+ years)</option>
                </select>
              </motion.div>
              {errors.experience && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {errors.experience.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Profile...
                  </span>
                ) : (
                  'Create Profile'
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
      </div>
    </div>
  )
} 