import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

// Animated background component
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50" />
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle at 0% 0%, #818cf8 0%, transparent 50%)',
            'radial-gradient(circle at 100% 0%, #818cf8 0%, transparent 50%)',
            'radial-gradient(circle at 100% 100%, #818cf8 0%, transparent 50%)',
            'radial-gradient(circle at 0% 100%, #818cf8 0%, transparent 50%)',
            'radial-gradient(circle at 0% 0%, #818cf8 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            'radial-gradient(circle at 50% 50%, #c084fc 0%, transparent 50%)',
            'radial-gradient(circle at 30% 70%, #c084fc 0%, transparent 50%)',
            'radial-gradient(circle at 70% 30%, #c084fc 0%, transparent 50%)',
            'radial-gradient(circle at 50% 50%, #c084fc 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [spotsLeft, setSpotsLeft] = useState(10000);

  useEffect(() => {
    // Fetch user count from backend
    fetch('/api/users/count')
      .then(res => res.json())
      .then(data => {
        if (data.totalUsers !== undefined) {
          const totalUsers = data.totalUsers;
          setSpotsLeft(10000 - totalUsers);
        }
      })
      .catch(() => setSpotsLeft(10000));
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center"
            >
              <img src="/subx-logo/header-logo.png" alt="Subx Logo" className="h-20 w-auto" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center space-x-4"
            >
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Log in as Sub-owner
              </button>
              <button
                onClick={() => navigate('/signup/investor')}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:opacity-90 transition-opacity"
              >
                Sign Up
              </button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="pt-24 pb-16 relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6"
            >
              <span className="block">Real Estate Ownership</span>
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Made Simple</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Join Subx the official digital land ownership and Sub-ownership platform of Focal Point Property Development & Management Services Ltd.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8 flex flex-col items-center justify-center gap-4"
            >
              <div className="flex justify-center gap-4">
                <Link to="/signup/investor">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:opacity-90 transition-opacity"
                  >
                    Start Owning
                  </motion.button>
                </Link>
                <button
                  className="px-8 py-3 text-base font-medium text-white bg-gray-400 rounded-full cursor-not-allowed opacity-60"
                  disabled
                  title="Not available, coming soon"
                >
                  Developer (Coming Soon)
                </button>
              </div>
              <div className="mt-4 text-lg font-semibold text-indigo-700 bg-indigo-50 rounded-full px-6 py-2 shadow inline-block">
                Exclusive for 10,000 individuals — <span className="font-bold">{spotsLeft.toLocaleString()}</span> spots left!
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="py-20 relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
                title: "Group Co-Ownership",
                description: "Pool resources with others to access larger, more profitable real estate ownership opportunities with Focal Point Property Development and Management Services Ltd."
              },
              {
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                title: "Secure Platform",
                description: "Your ownership is protected with industry-leading security and transparent processes."
              },
              {
                icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
                title: "Growth Potential",
                description: "Access premium real estate opportunities and maximize your co-ownership benefits."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div 
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="py-20 relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl font-bold text-center mb-12"
          >
            How It Works
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: "1",
                title: "Create Your Profile",
                description: "Sign up and set your co-ownership preferences"
              },
              {
                number: "2",
                title: "Find Your Group",
                description: "Connect with like-minded co-owners"
              },
              {
                number: "3",
                title: "Start Co-Owning",
                description: "Pool resources and co-own premium properties with Focal Point Property Development and Management Services Ltd."
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-4"
                >
                  {step.number}
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-20 relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold mb-8"
          >
            Ready to Start Your Ownership Journey?
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 mb-8"
          >
            Join thousands of co-owners who are already growing their portfolios with Subx and Focal Point Property Development and Management Services Ltd.
          </motion.p>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="flex justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/signup/investor')}
              className="px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:opacity-90 transition-opacity"
            >
              Get Started Now
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-gray-50 py-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
              <ul className="mt-4 space-y-4">
                {[
                  { name: 'Features', href: '/features' },
                  { name: 'FAQ', href: '/faq' },
                  { name: 'Security', href: '#' }
                ].map((item) => (
                  <li key={item.name}>
                    <Link to={item.href} className="text-base text-gray-500 hover:text-gray-900">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
              <ul className="mt-4 space-y-4">
                {[
                  { name: 'About', href: '/about' },
                  { name: 'Blog', href: '#' },
                  { name: 'Careers', href: '#' }
                ].map((item) => (
                  <li key={item.name}>
                    <Link to={item.href} className="text-base text-gray-500 hover:text-gray-900">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                {[
                  { name: 'Privacy', href: '/privacy' },
                  { name: 'Terms', href: '/terms' },
                  { name: 'Cookie Policy', href: '/cookie-policy' }
                ].map((item) => (
                  <li key={item.name}>
                    <Link to={item.href} className="text-base text-gray-500 hover:text-gray-900">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 pt-8 border-t border-gray-200"
          >
            <p className="text-center text-gray-500">© 2025 Subx. All rights reserved.</p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  )
} 