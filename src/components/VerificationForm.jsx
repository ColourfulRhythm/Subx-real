import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const schema = yup.object().shape({
  dateOfBirth: yup.date().required('Date of birth is required'),
  nationality: yup.string().required('Nationality is required'),
  address: yup.object().shape({
    street: yup.string().required('Street address is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    country: yup.string().required('Country is required'),
    postalCode: yup.string().required('Postal code is required')
  }),
  occupation: yup.string().required('Occupation is required'),
  employer: yup.string().required('Employer is required'),
  annualIncome: yup.number()
    .typeError('Annual income must be a number')
    .required('Annual income is required')
    .min(0, 'Annual income cannot be negative')
});

const VerificationForm = ({ userType, onComplete }) => {
  const [verificationId, setVerificationId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('not_started');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    startVerification();
  }, []);

  const startVerification = async () => {
    try {
      const response = await fetch('/api/verification/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userType })
      });

      const data = await response.json();
      if (response.ok) {
        setVerificationId(data.verificationId);
        setVerificationStatus('in_progress');
      } else {
        if (data.verificationId) {
          setVerificationId(data.verificationId);
          checkVerificationStatus(data.verificationId);
        } else {
          toast.error(data.error || 'Failed to start verification');
        }
      }
    } catch (error) {
      console.error('Error starting verification:', error);
      toast.error('Failed to start verification process');
    }
  };

  const checkVerificationStatus = async (id) => {
    try {
      const response = await fetch(`/api/verification/status/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setVerificationStatus(data.status);
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  const handleDocumentUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', 'id'); // You might want to make this dynamic based on the document type

    try {
      const response = await fetch(`/api/verification/upload/${verificationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        setDocuments(prev => [...prev, data.document]);
        toast.success('Document uploaded successfully');
      } else {
        toast.error(data.error || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`/api/verification/personal-info/${verificationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success('Personal information submitted successfully');
        if (onComplete) {
          onComplete();
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit personal information');
      }
    } catch (error) {
      console.error('Error submitting personal information:', error);
      toast.error('Failed to submit personal information');
    }
  };

  if (verificationStatus === 'approved') {
    return (
      <div className="text-center p-6 bg-green-50 rounded-lg">
        <h3 className="text-xl font-semibold text-green-800 mb-2">Verification Approved</h3>
        <p className="text-green-600">Your account has been verified successfully.</p>
      </div>
    );
  }

  if (verificationStatus === 'rejected') {
    return (
      <div className="text-center p-6 bg-red-50 rounded-lg">
        <h3 className="text-xl font-semibold text-red-800 mb-2">Verification Rejected</h3>
        <p className="text-red-600">Your verification has been rejected. Please contact support for more information.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">KYC/AML Verification</h2>
      
      {/* Document Upload Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Required Documents</h3>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              onChange={handleDocumentUpload}
              disabled={isUploading}
              className="hidden"
              id="document-upload"
              accept=".jpg,.jpeg,.png,.pdf"
            />
            <label
              htmlFor="document-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {isUploading ? 'Uploading...' : 'Upload ID Document'}
            </label>
            <p className="mt-2 text-sm text-gray-500">
              Supported formats: JPG, PNG, PDF (max 5MB)
            </p>
          </div>

          {/* Document List */}
          {documents.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents</h4>
              <ul className="space-y-2">
                {documents.map((doc, index) => (
                  <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">{doc.type}</span>
                    <span className={`text-sm ${
                      doc.status === 'approved' ? 'text-green-600' :
                      doc.status === 'rejected' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Personal Information Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            type="date"
            {...register('dateOfBirth')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nationality</label>
          <input
            type="text"
            {...register('nationality')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.nationality && (
            <p className="mt-1 text-sm text-red-600">{errors.nationality.message}</p>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Address</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Street Address</label>
            <input
              type="text"
              {...register('address.street')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.address?.street && (
              <p className="mt-1 text-sm text-red-600">{errors.address.street.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                {...register('address.city')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.address?.city && (
                <p className="mt-1 text-sm text-red-600">{errors.address.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <input
                type="text"
                {...register('address.state')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.address?.state && (
                <p className="mt-1 text-sm text-red-600">{errors.address.state.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input
                type="text"
                {...register('address.country')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.address?.country && (
                <p className="mt-1 text-sm text-red-600">{errors.address.country.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Postal Code</label>
              <input
                type="text"
                {...register('address.postalCode')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.address?.postalCode && (
                <p className="mt-1 text-sm text-red-600">{errors.address.postalCode.message}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Occupation</label>
          <input
            type="text"
            {...register('occupation')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.occupation && (
            <p className="mt-1 text-sm text-red-600">{errors.occupation.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Employer</label>
          <input
            type="text"
            {...register('employer')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.employer && (
            <p className="mt-1 text-sm text-red-600">{errors.employer.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Annual Income</label>
          <input
            type="number"
            {...register('annualIncome')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.annualIncome && (
            <p className="mt-1 text-sm text-red-600">{errors.annualIncome.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Submit Verification
          </button>
        </div>
      </form>
    </div>
  );
};

export default VerificationForm; 