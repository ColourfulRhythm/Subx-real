import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function CookiePolicy() {
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
            
            <div className="prose prose-lg">
              <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies</h2>
                <p className="text-gray-600 mb-4">
                  Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience and enable certain features to function properly.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Types of Cookies We Use</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Essential Cookies</h3>
                    <p className="text-gray-600">
                      Required for the website to function properly. They enable basic functions like page navigation and access to secure areas.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Functional Cookies</h3>
                    <p className="text-gray-600">
                      Remember your preferences and settings to provide enhanced functionality.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Analytics Cookies</h3>
                    <p className="text-gray-600">
                      Help us understand how visitors interact with our website by collecting and reporting information anonymously.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. How We Use Cookies</h2>
                <p className="text-gray-600 mb-4">We use cookies to:</p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Keep you signed in</li>
                  <li>Remember your preferences</li>
                  <li>Understand how you use our website</li>
                  <li>Improve our services</li>
                  <li>Provide personalized content</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Managing Cookies</h2>
                <p className="text-gray-600 mb-4">
                  You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed. However, if you do this, you may have to manually adjust some preferences every time you visit our site and some services and functionalities may not work.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Third-Party Cookies</h2>
                <p className="text-gray-600 mb-4">
                  Some cookies are placed by third-party services that appear on our pages. We use trusted third-party services that track this information on our behalf.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions about our Cookie Policy, please contact us at:
                  <br />
                  Email: privacy@subx.com
                  <br />
                  Address: 123 Real Estate Street, Lagos, Nigeria
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 