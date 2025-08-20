import React from 'react';
import { motion } from 'framer-motion';

export default function ForumComingSoon() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto text-center"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Icon */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🚧 Forum Coming Soon! 🚧
          </h1>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We're building an amazing community forum where you can connect with other investors, 
            share insights, and discuss real estate opportunities.
          </p>

          {/* Features Preview */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              What's Coming:
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Community discussions
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Investment tips & strategies
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Real estate market insights
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Networking opportunities
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              ← Go Back
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              We'll notify you when the forum is ready!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
