import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { motion } from 'framer-motion'
import { auth } from '../../firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useAuth } from '../../contexts/AuthContext'
import { apiCall } from '../../config/api'

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
})

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [userType] = useState('investor') // Always investor (sub-owner)
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setError('')
    
    try {
      // Login with email and password
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password)
      const user = userCredential.user
      
      // Then, authenticate with backend API
      const endpoint = userType === 'investor' ? '/investors/login' : '/developers/login'
      const response = await apiCall(endpoint, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }
      
      // Store authentication data
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userType', userType)
      localStorage.setItem('userEmail', user.email)
      localStorage.setItem('userName', result[userType]?.name || user.displayName || user.email)
      localStorage.setItem('token', result.token)
      localStorage.setItem('userData', JSON.stringify(result[userType]))
      
      // Store Firebase UID for proper user data isolation
      localStorage.setItem('userId', user.uid)
      
      // Show success message
      alert(`Welcome back! You have been successfully logged in as a ${userType === 'investor' ? 'Sub-owner' : 'Developer'}.`)
      
      // Redirect to appropriate dashboard
      navigate(`/dashboard/${userType}`)
    } catch (error) {
      console.error('Login error:', error)
      let errorMessage = 'Login failed'
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up instead.'
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
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
            Login
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
          {/* Error Message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
            >
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}

          {/* Login for Sub-owners */}
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Login to your Sub-owner account
            </p>
          </div>

                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <motion.div whileHover={{ scale: 1.02 }} className="mt-1">
                <input
                  id="password"
                  {...register('password')}
                  type="password"
                  className="block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
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
            </motion.div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup/investor')}
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Sign up as Sub-owner
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
} 