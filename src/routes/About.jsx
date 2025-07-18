import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
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

      <div className="pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h1 className="text-4xl font-bold text-center mb-8">About Focal Point Property Development and Management Services Ltd.</h1>
          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                To deliver exceptional property development and management solutions, maximizing value for our clients and partners.
              </p>
            </section>
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
              <p className="text-gray-600 mb-4">
                To be the leading property development and management company in Nigeria, known for integrity, innovation, and results.
              </p>
            </section>
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Founded by industry experts, Focal Point has delivered successful projects and managed properties for a diverse clientele, combining local expertise with global best practices.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 