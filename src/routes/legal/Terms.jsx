import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Terms() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
            
            <div className="prose prose-lg">
              <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-600 mb-4">
                  By accessing and using Subx, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. User Accounts</h2>
                <p className="text-gray-600 mb-4">When creating an account, you must:</p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                  <li>Be at least 18 years old</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Investment Risks</h2>
                <p className="text-gray-600 mb-4">
                  Real estate investments carry inherent risks. You acknowledge that:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Past performance is not indicative of future results</li>
                  <li>Property values can fluctuate</li>
                  <li>Returns are not guaranteed</li>
                  <li>You should consult with financial advisors before investing</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Prohibited Activities</h2>
                <p className="text-gray-600 mb-4">Users are prohibited from:</p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Violating any applicable laws</li>
                  <li>Impersonating others</li>
                  <li>Engaging in fraudulent activities</li>
                  <li>Interfering with the platform's operation</li>
                  <li>Sharing account credentials</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
                <p className="text-gray-600 mb-4">
                  All content on Subx, including text, graphics, logos, and software, is the property of Subx or its content suppliers and is protected by intellectual property laws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
                <p className="text-gray-600 mb-4">
                  Subx shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Contact Information</h2>
                <p className="text-gray-600 mb-4">
                  For questions about these Terms, please contact us at:
                  <br />
                  Email: legal@subx.com
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