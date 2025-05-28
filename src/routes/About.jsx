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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Subx</h1>
            </Link>
          </div>
        </div>
      </motion.nav>

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h1 className="text-4xl font-bold text-center mb-8">About Subx</h1>
            
            <div className="prose prose-lg max-w-none">
              <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                <p className="text-gray-600 mb-4">
                  Subx was born from a simple yet powerful idea: to revolutionize how real estate developers raise capital and how investors discover opportunities. We recognized the challenges in the traditional real estate investment landscape and set out to create a platform that would make the process more efficient, transparent, and accessible.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">The Problem We're Solving</h2>
                <p className="text-gray-600 mb-4">
                  Real estate developers often struggle to raise capital efficiently, while investors face difficulties in finding and evaluating promising opportunities. The traditional process is fragmented, time-consuming, and lacks transparency. This creates a significant barrier to entry for both developers and investors.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Our Solution</h2>
                <p className="text-gray-600 mb-4">
                  Subx brings together developers, investors, and real estate enthusiasts in a unified platform that:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Enables developers to showcase their projects and raise capital faster</li>
                  <li>Provides investors with a curated selection of investment opportunities</li>
                  <li>Facilitates direct communication between developers and investors</li>
                  <li>Creates a community where real estate enthusiasts can discuss trends and developments</li>
                  <li>Offers transparent project tracking and performance metrics</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
                <p className="text-gray-600 mb-4">
                  We envision a future where real estate development and investment are more accessible, efficient, and transparent. By connecting developers with investors and creating a vibrant community of real estate enthusiasts, we're building the foundation for a more dynamic and inclusive real estate ecosystem.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Join Our Community</h2>
                <p className="text-gray-600 mb-4">
                  Whether you're a developer looking to raise capital, an investor seeking opportunities, or a real estate enthusiast interested in the industry, Subx provides the tools and community you need to succeed. Join us in transforming the future of real estate development and investment.
                </p>
                <div className="flex justify-center gap-4 mt-8">
                  <Link to="/signup/developer">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:opacity-90 transition-opacity"
                    >
                      Join as Developer
                    </motion.button>
                  </Link>
                  <Link to="/signup/investor">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 text-base font-medium text-indigo-600 border-2 border-indigo-600 rounded-full hover:bg-indigo-50 transition-colors"
                    >
                      Join as Investor
                    </motion.button>
                  </Link>
                </div>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 