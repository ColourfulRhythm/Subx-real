import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const PricingCard = ({ title, price, features, isPro, userType }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -5 }}
    className={`p-8 rounded-2xl ${
      isPro 
        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white' 
        : 'bg-white text-gray-900'
    } shadow-lg hover:shadow-xl transition-shadow`}
  >
    <div className="text-center">
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold">{price}</span>
        {price !== 'Free' && <span className="text-lg">/month</span>}
      </div>
    </div>
    <ul className="space-y-4 mb-8">
      {features.map((feature, index) => (
        <motion.li
          key={index}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="flex items-start"
        >
          <svg
            className={`w-6 h-6 mr-2 flex-shrink-0 ${
              isPro ? 'text-white' : 'text-indigo-600'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>{feature}</span>
        </motion.li>
      ))}
    </ul>
    <Link to={`/signup/${userType}`}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-full py-3 px-6 rounded-full font-medium transition-colors ${
          isPro
            ? 'bg-white text-indigo-600 hover:bg-gray-100'
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90'
        }`}
      >
        Get Started
      </motion.button>
    </Link>
  </motion.div>
)

export default function Pricing() {
  const developerFeatures = {
    free: [
      "Basic profile listing",
      "Connect with up to 5 investors",
      "List up to 3 properties",
      "Basic analytics",
      "Community forum access",
      "Email support"
    ],
    pro: [
      "Everything in Free, plus:",
      "Unlimited investor connections",
      "Unlimited property listings",
      "Advanced analytics & insights",
      "Priority investor matching",
      "Featured property listings",
      "Property performance tracking",
      "Market trend analysis",
      "Investment opportunity alerts",
      "Priority listing in search results"
    ]
  }

  const investorFeatures = {
    free: [
      "Basic investor profile",
      "Browse all properties",
      "Connect with developers",
      "Join investment groups",
      "Basic market insights",
      "Community forum access",
      "Email support"
    ],
    pro: [
      "Everything in Free, plus:",
      "Priority property access",
      "Advanced investment analytics",
      "AI-powered investment recommendations",
      "Exclusive investment opportunities",
      "Early access to new listings",
      "Portfolio tracking tools",
      "Tax optimization insights",
      "Investment performance reports",
      "Priority support"
    ]
  }

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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Subx</h1>
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
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that best fits your needs. All plans include our core features.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Developer Pricing */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            For Developers
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <PricingCard
              title="Free"
              price="Free"
              features={developerFeatures.free}
              isPro={false}
              userType="developer"
            />
            <PricingCard
              title="Pro"
              price="₦2,000"
              features={developerFeatures.pro}
              isPro={true}
              userType="developer"
            />
          </div>
        </div>
      </div>

      {/* Investor Pricing */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            For Investors
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <PricingCard
              title="Free"
              price="Free"
              features={investorFeatures.free}
              isPro={false}
              userType="investor"
            />
            <PricingCard
              title="Pro"
              price="₦1,000"
              features={investorFeatures.pro}
              isPro={true}
              userType="investor"
            />
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  question: "Can I switch between plans?",
                  answer: "Yes, you can upgrade or downgrade your plan at any time. You can also cancel your plan whenever you want."
                },
                {
                  question: "What payment methods do you accept?",
                  answer: "We accept payments through Paystack, which supports all major credit cards, debit cards, and bank transfers for Pro subscriptions."
                },
                {
                  question: "Is there a long-term commitment?",
                  answer: "We offer both monthly and annual payment options. The annual plan provides better value with a discount compared to monthly payments."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-gray-50 rounded-xl"
                >
                  <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 