import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { auth, db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const [userProfile, setUserProfile] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  
  // Don't show navbar on landing page to avoid duplication
  if (location.pathname === '/') {
    return null
  }

  // Fetch user profile when authenticated
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid)
          const userDoc = await getDoc(userDocRef)
          
          if (userDoc.exists()) {
            setUserProfile(userDoc.data())
          } else {
            // Fallback to basic user info
            setUserProfile({
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
              email: currentUser.email
            })
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
          // Fallback to basic user info
          setUserProfile({
            name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
            email: currentUser.email
          })
        }
      } else {
        setUserProfile(null)
      }
    }

    fetchUserProfile()
  }, [currentUser])

  const handleSignOut = async () => {
    try {
      await logout()
      navigate('/')
      setShowDropdown(false)
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  const handleDashboardClick = () => {
    if (userProfile?.user_type === 'developer') {
      navigate('/dashboard/developer')
    } else {
      navigate('/dashboard/investor')
    }
    setShowDropdown(false)
  }

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              Subx
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {currentUser && userProfile ? (
              // Authenticated user - show profile dropdown
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {userProfile.name || userProfile.email?.split('@')[0] || 'User'}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {userProfile.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {userProfile.email}
                      </p>
                    </div>
                    
                    <button
                      onClick={handleDashboardClick}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </button>
                    
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              // Not authenticated - show login/signup buttons
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900">
                  Login
                </Link>
                <Link to="/signup/investor" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </motion.nav>
  )
}
