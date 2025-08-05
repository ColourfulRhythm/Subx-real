import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getDocument } from '../firebase';

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const propertyData = await getDocument('properties', id);
        if (propertyData) {
          setProperty(propertyData);
        } else {
          setError('Property not found');
        }
      } catch (err) {
        setError('Error loading property details');
        console.error('Error fetching property:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">{error}</h2>
          <p className="mt-2 text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Property Not Found</h2>
          <p className="mt-2 text-gray-600">The property you're looking for doesn't exist</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative h-96">
            <img
              src={property.imageUrl}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
            <p className="mt-4 text-gray-600">{property.description}</p>
            
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Property Details</h3>
                <dl className="mt-4 space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="mt-1 text-sm text-gray-900">{property.location}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">{property.type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Size</dt>
                    <dd className="mt-1 text-sm text-gray-900">{property.size} sq ft</dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">Ownership Details</h3>
                <dl className="mt-4 space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Ownership Cost</dt>
                    <dd className="mt-1 text-sm text-gray-900">${property.totalInvestment}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Minimum Ownership</dt>
                    <dd className="mt-1 text-sm text-gray-900">${property.minInvestment}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Expected Return</dt>
                    <dd className="mt-1 text-sm text-gray-900">{property.expectedReturn}%</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-8 flex space-x-4">
              <button
                type="button"
                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Own Now
              </button>
              <button
                type="button"
                className="flex-1 bg-white text-indigo-600 border border-indigo-600 px-6 py-3 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Contact Developer
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyDetails; 