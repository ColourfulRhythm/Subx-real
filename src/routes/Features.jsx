import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const FeatureCard = ({ icon, title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -5 }}
    className="p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow"
  >
    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center mb-4">
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
      </svg>
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
)

export default function Features() {
  const features = [
    {
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      title: "End-to-End Property Development",
      description: "From concept to completion, we manage every stage of your property project."
    },
    {
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      title: "Professional Property Management",
      description: "Comprehensive management services for residential, commercial, and mixed-use properties."
    },
    {
      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
      title: "Ownership Advisory",
      description: "Expert guidance to maximize your real estate ownership returns."
    },
    {
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      title: "Transparent Reporting",
      description: "Real-time updates and detailed reports for all your projects and properties."
    },
    {
      icon: "M7 10a2 2 0 11-4 0 2 2 0 014 0zM17 20h5v-2a3 3 0 00-5.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z",
      title: "Tenant & Lease Management",
      description: "Efficient tenant screening, onboarding, and lease administration."
    },
    {
      icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
      title: "Maintenance & Facility Services",
      description: "Proactive maintenance and 24/7 support for all managed properties."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Focal Point</h1>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Discover Our Services
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore the professional solutions that make Focal Point Property Development and Management Services Ltd. your trusted partner in real estate.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Contact us today to discuss your property needs and discover how we can help you succeed.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/about">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:opacity-90 transition-opacity"
                >
                  Learn More
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 