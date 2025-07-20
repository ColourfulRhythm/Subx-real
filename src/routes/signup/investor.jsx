import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { motion } from 'framer-motion'
import { createInvestor } from '../../services/api'
import { auth, provider } from '../../firebase'
import { signInWithPopup } from 'firebase/auth'

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  terms: yup.bool().oneOf([true], 'You must agree to the terms'),
})

export default function InvestorSignup() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await createInvestor({
        name: data.name,
        email: data.email,
        phone: data.phone,
      });
      navigate('/dashboard/investor')
    } catch (error) {
      alert('Signup failed: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      await createInvestor({
        name: user.displayName,
        email: user.email,
        googleId: user.uid
      })
      navigate('/dashboard/investor')
    } catch (error) {
      alert('Google signup failed: ' + error.message)
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
            Create Sub-owner Profile
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
          <button
            onClick={handleGoogleSignup}
            className="w-full flex justify-center items-center py-3 px-4 mb-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            disabled={isLoading}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
            Sign up with Google
          </button>
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-2 text-gray-400">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                id="name"
                {...register('name')}
                type="text"
                className="block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                id="email"
                {...register('email')}
                type="email"
                className="block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
              <input
                id="phone"
                {...register('phone')}
                type="tel"
                className="block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone.message}</p>
              )}
            </div>
            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                {...register('terms')}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                I agree to the <a href="/terms" className="underline">terms and conditions</a>
              </label>
            </div>
            {errors.terms && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.terms.message}</p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing up...' : 'Sign up with Email'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  )
} 