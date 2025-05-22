import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './routes/LandingPage'
import Login from './routes/login'
import InvestorSignup from './routes/signup/investor'
import DeveloperSignup from './routes/signup/developer'
import InvestorDashboard from './routes/dashboard/investor'
import DeveloperDashboard from './routes/dashboard/developer'
import AdminDashboard from './routes/dashboard/admin'
import Messaging from './routes/messaging/Messaging'
import ForumTopic from './routes/ForumTopic'
import ToastProvider from './components/ToastProvider'

const ProtectedRoute = ({ children, requiredUserType }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated')
  const userType = localStorage.getItem('userType')

  if (!isAuthenticated || (requiredUserType && userType !== requiredUserType)) {
    return <Navigate to="/login" replace />
  }

  return children
}

const App = () => {
  return (
    <Router>
      <ToastProvider />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup/investor" element={<InvestorSignup />} />
        <Route path="/signup/developer" element={<DeveloperSignup />} />
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
      </Routes>
    </Router>
  )
}

export default App
