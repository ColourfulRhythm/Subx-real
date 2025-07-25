import React, { Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import LandingPage from './routes/LandingPage'
import Login from './routes/login'
import InvestorSignup from './routes/signup/investor'
import DeveloperSignup from './routes/signup/developer'
import InvestorDashboard from './routes/dashboard/investor'
import DeveloperDashboard from './routes/dashboard/developer'
import AdminDashboard from './routes/dashboard/admin'
import Messaging from './routes/messaging/Messaging'
import ForumTopic from './routes/ForumTopic'
import Features from './routes/Features'
import FAQ from './routes/FAQ'
import Privacy from './routes/legal/Privacy'
import Terms from './routes/legal/Terms'
import CookiePolicy from './routes/legal/CookiePolicy'
import About from './routes/About'
import ToastProvider from './components/ToastProvider'

const ProtectedRoute = ({ children, requiredUserType }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated')
  const userType = localStorage.getItem('userType')

  if (!isAuthenticated || (requiredUserType && userType !== requiredUserType)) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Lazy load components
const Signup = React.lazy(() => import('./routes/Signup'))
const PropertyDetails = React.lazy(() => import('./routes/PropertyDetails'))

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Loading Component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
)

// Page Transition Component
const PageTransition = ({ children }) => {
  const location = useLocation()
  
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

const App = () => {
  useEffect(() => {
    console.log('App component mounted')
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user')
    })

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [])

  return (
    <ErrorBoundary>
      <Router>
        <Toaster position="top-right" />
        <ToastProvider />
        <Routes>
          <Route path="/" element={
            <PageTransition>
              <LandingPage />
            </PageTransition>
          } />
          <Route path="/login" element={
            <PageTransition>
              <Login />
            </PageTransition>
          } />
          <Route path="/signup" element={
            <PageTransition>
              <Signup />
            </PageTransition>
          } />
          <Route path="/signup/investor" element={<InvestorSignup />} />
          <Route path="/signup/developer" element={<DeveloperSignup />} />
          <Route path="/features" element={<Features />} />
          <Route path="/faq" element={
            <PageTransition>
              <FAQ />
            </PageTransition>
          } />
          <Route path="/about" element={
            <PageTransition>
              <About />
            </PageTransition>
          } />
          <Route path="/privacy" element={
            <PageTransition>
              <Privacy />
            </PageTransition>
          } />
          <Route path="/terms" element={
            <PageTransition>
              <Terms />
            </PageTransition>
          } />
          <Route path="/cookie-policy" element={
            <PageTransition>
              <CookiePolicy />
            </PageTransition>
          } />
          <Route
            path="/dashboard/investor"
            element={
              <ProtectedRoute requiredUserType="investor">
                <InvestorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/developer"
            element={
              <ProtectedRoute requiredUserType="developer">
                <DeveloperDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute requiredUserType="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/messaging" element={<Messaging />} />
          <Route
            path="/forum/:topicId"
            element={
              <ProtectedRoute>
                <ForumTopic />
              </ProtectedRoute>
            }
          />
          <Route path="/property/:id" element={
            <PageTransition>
              <PropertyDetails />
            </PageTransition>
          } />
        </Routes>
      </Router>
    </ErrorBoundary>
  )
}

export default App
