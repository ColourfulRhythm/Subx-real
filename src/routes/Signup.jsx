import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Signup = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose Your Account Type
          </h2>
          <p className="mt-3 text-xl text-gray-500">
            Select the type of account that best suits your needs
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="px-6 py-8">
              <h3 className="text-2xl font-bold text-gray-900">Investor</h3>
              <p className="mt-4 text-gray-500">
                Access investment opportunities and manage your portfolio
              </p>
              <div className="mt-6">
                <Link
                  to="/signup/investor"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign up as Investor
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="px-6 py-8">
              <h3 className="text-2xl font-bold text-gray-900">Developer</h3>
              <p className="mt-4 text-gray-500">
                List your properties and connect with potential investors
              </p>
              <div className="mt-6">
                <Link
                  to="/signup/developer"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign up as Developer
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Signup; 