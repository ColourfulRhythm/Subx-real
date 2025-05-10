import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { apiCall } from '../../utils/api';

// Validation schema for developer profile
const developerSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  company: yup.string().required('Company name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  website: yup.string().url('Invalid website URL'),
  bio: yup.string().max(1000, 'Bio must be less than 1000 characters'),
  minUnits: yup.number().min(1, 'Minimum units must be at least 1'),
  maxUnits: yup.number().min(1, 'Maximum units must be at least 1'),
  unitPrice: yup.number().min(0, 'Unit price must be positive'),
  yearsOfExperience: yup.number().min(0, 'Years of experience must be positive'),
  investmentFocus: yup.array().min(1, 'Select at least one investment focus'),
  completedProjects: yup.array(),
  certifications: yup.array(),
  socialLinks: yup.object()
});

export default function DeveloperDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [projects, setProjects] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);

  // Form handling with react-hook-form
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: yupResolver(developerSchema)
  });

  // Initial profile data
  const [profile, setProfile] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    bio: '',
    minUnits: 1,
    maxUnits: 1000000,
    unitPrice: 0,
    investmentFocus: [],
    completedProjects: [],
    yearsOfExperience: 0,
    certifications: [],
    socialLinks: {},
    isSubscribed: false,
    imageUrl: null
  });

  // Check authentication on component mount
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userType = localStorage.getItem('userType');

    if (!isAuthenticated || userType !== 'developer') {
      navigate('/login');
      return;
    }

    fetchProfile();
  }, [navigate]);

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const developerId = localStorage.getItem('userId');
      const data = await apiCall(`/api/developers/${developerId}`);
      setProfile(data);
      reset(data);
      setPreviewImage(data.imageUrl);
    } catch (error) {
      setError('Failed to load profile');
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Handle profile save
  const handleProfileSave = async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const formData = new FormData();
      
      // Handle regular fields
      Object.keys(data).forEach(key => {
        if (key === 'investmentFocus') {
          formData.append(key, JSON.stringify(data[key]));
        } else if (key === 'minUnits' || key === 'maxUnits' || key === 'unitPrice' || key === 'yearsOfExperience') {
          formData.append(key, data[key].toString());
        } else if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });

      // Handle profile image
      if (profileImage) {
        formData.append('logo', profileImage);
      }

      const developerId = localStorage.getItem('userId');
      console.log('Saving profile for developer:', developerId);
      
      const updatedProfile = await apiCall(`/api/developers/${developerId}`, {
        method: 'PUT',
        body: formData,
        headers: {
          // Don't set Content-Type here, let the browser set it with the boundary for FormData
        },
      });

      console.log('Profile update response:', updatedProfile);

      if (updatedProfile.developer) {
        setProfile(updatedProfile.developer);
        setIsEditingProfile(false);
        setSuccess('Profile updated successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setError(error.message || 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');
    navigate('/');
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setIsLoadingProjects(true);
      const developerId = localStorage.getItem('userId');
      const data = await apiCall(`/api/projects/${developerId}`);
      setProjects(data);
    } catch (error) {
      setError('Failed to load projects');
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Fetch connection requests
  const fetchConnections = async () => {
    try {
      setIsLoadingConnections(true);
      const developerId = localStorage.getItem('userId');
      const data = await apiCall(`/api/connections/${developerId}`);
      setConnections(data);
    } catch (error) {
      setError('Failed to load connection requests');
      console.error('Error fetching connections:', error);
    } finally {
      setIsLoadingConnections(false);
    }
  };

  // Handle tab change
  useEffect(() => {
    if (activeTab === 'projects') {
      fetchProjects();
    } else if (activeTab === 'connections') {
      fetchConnections();
    }
  }, [activeTab]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Subx
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {isDarkMode ? (
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['profile', 'projects', 'connections', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <main>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Section */}
              {activeTab === 'profile' && (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Profile Information
                    </h3>
                    <button
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                    </button>
                  </div>

                  {isEditingProfile ? (
                    <form onSubmit={handleSubmit(handleProfileSave)} className="space-y-6">
                      {/* Profile Image */}
                      <div className="flex items-center space-x-6">
                        <div className="flex-shrink-0">
                          <img
                            className="h-24 w-24 rounded-full object-cover"
                            src={previewImage || 'https://via.placeholder.com/150'}
                            alt="Profile"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Profile Image
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0
                              file:text-sm file:font-semibold
                              file:bg-indigo-50 file:text-indigo-700
                              hover:file:bg-indigo-100
                              dark:file:bg-indigo-900 dark:file:text-indigo-300"
                          />
                        </div>
                      </div>

                      {/* Basic Information */}
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Name
                          </label>
                          <input
                            type="text"
                            {...register('name')}
                            defaultValue={profile.name}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                          />
                          {errors.name && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Company
                          </label>
                          <input
                            type="text"
                            {...register('company')}
                            defaultValue={profile.company}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                          />
                          {errors.company && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.company.message}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email
                          </label>
                          <input
                            type="email"
                            {...register('email')}
                            defaultValue={profile.email}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Phone
                          </label>
                          <input
                            type="tel"
                            {...register('phone')}
                            defaultValue={profile.phone}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                          />
                          {errors.phone && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone.message}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Website
                          </label>
                          <input
                            type="url"
                            {...register('website')}
                            defaultValue={profile.website}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                          />
                          {errors.website && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.website.message}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Years of Experience
                          </label>
                          <input
                            type="number"
                            {...register('yearsOfExperience')}
                            defaultValue={profile.yearsOfExperience}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                          />
                          {errors.yearsOfExperience && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.yearsOfExperience.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Bio */}
                      <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Bio
                        </label>
                        <textarea
                          {...register('bio')}
                          defaultValue={profile.bio}
                          rows={4}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                        />
                        {errors.bio && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bio.message}</p>
                        )}
                      </div>

                      {/* Investment Settings */}
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <div>
                          <label htmlFor="minUnits" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Minimum Units
                          </label>
                          <input
                            type="number"
                            {...register('minUnits')}
                            defaultValue={profile.minUnits}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                          />
                          {errors.minUnits && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.minUnits.message}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="maxUnits" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Maximum Units
                          </label>
                          <input
                            type="number"
                            {...register('maxUnits')}
                            defaultValue={profile.maxUnits}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                          />
                          {errors.maxUnits && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.maxUnits.message}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Unit Price (₦)
                          </label>
                          <input
                            type="number"
                            {...register('unitPrice')}
                            defaultValue={profile.unitPrice}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                          />
                          {errors.unitPrice && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.unitPrice.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Investment Focus */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Investment Focus
                        </label>
                        <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3">
                          {['Residential', 'Commercial', 'Industrial', 'Mixed-Use', 'Green Projects', 'Luxury'].map((focus) => (
                            <div key={focus} className="flex items-center">
                              <input
                                type="checkbox"
                                value={focus}
                                {...register('investmentFocus')}
                                defaultChecked={profile.investmentFocus?.includes(focus)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                {focus}
                              </label>
                            </div>
                          ))}
                        </div>
                        {errors.investmentFocus && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.investmentFocus.message}</p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      {/* Profile Header */}
                      <div className="flex items-center space-x-6">
                        <img
                          className="h-24 w-24 rounded-full object-cover"
                          src={profile.imageUrl || 'https://via.placeholder.com/150'}
                          alt="Profile"
                        />
                        <div>
                          <h4 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                            {profile.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {profile.company}
                          </p>
                        </div>
                      </div>

                      {/* Profile Details */}
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{profile.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{profile.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Website</p>
                          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
                              {profile.website}
                            </a>
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Years of Experience</p>
                          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{profile.yearsOfExperience}</p>
                        </div>
                      </div>

                      {/* Bio */}
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</p>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{profile.bio}</p>
                      </div>

                      {/* Investment Settings */}
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Minimum Units</p>
                          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{profile.minUnits.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Maximum Units</p>
                          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{profile.maxUnits.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unit Price</p>
                          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                            ₦{profile.unitPrice.toLocaleString('en-NG')}
                          </p>
                        </div>
                      </div>

                      {/* Investment Focus */}
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Investment Focus</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {profile.investmentFocus?.map((focus) => (
                            <span
                              key={focus}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                            >
                              {focus}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Projects Section */}
              {activeTab === 'projects' && (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Your Projects
                    </h3>
                    <button
                      onClick={() => {/* TODO: Add new project modal */}}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Add New Project
                    </button>
                  </div>

                  {isLoadingProjects ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : projects.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">No projects yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {projects.map((project) => (
                        <div
                          key={project.id}
                          className="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden"
                        >
                          <img
                            src={project.imageUrls[0] || 'https://via.placeholder.com/300x200'}
                            alt={project.title}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-4">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                              {project.title}
                            </h4>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              {project.description}
                            </p>
                            <div className="mt-4 flex items-center justify-between">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {project.location}
                              </span>
                              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                {project.type}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Connections Section */}
              {activeTab === 'connections' && (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Connection Requests
                    </h3>
                  </div>

                  {isLoadingConnections ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : connections.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">No connection requests</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {connections.map((connection) => (
                        <div
                          key={connection.id}
                          className="bg-white dark:bg-gray-700 rounded-lg shadow p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                {connection.investorName}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {connection.units} units • ₦{connection.investmentAmount.toLocaleString('en-NG')}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {/* TODO: Handle accept */}}
                                className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => {/* TODO: Handle reject */}}
                                className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                          {connection.notes && (
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                              {connection.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Analytics Section */}
              {activeTab === 'analytics' && (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-indigo-50 dark:bg-indigo-900 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        Total Projects
                      </h4>
                      <p className="mt-2 text-3xl font-semibold text-indigo-900 dark:text-indigo-100">
                        {projects.length}
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-green-600 dark:text-green-400">
                        Active Connections
                      </h4>
                      <p className="mt-2 text-3xl font-semibold text-green-900 dark:text-green-100">
                        {connections.filter(c => c.status === 'accepted').length}
                      </p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                        Pending Requests
                      </h4>
                      <p className="mt-2 text-3xl font-semibold text-yellow-900 dark:text-yellow-100">
                        {connections.filter(c => c.status === 'pending').length}
                      </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        Total Investment
                      </h4>
                      <p className="mt-2 text-3xl font-semibold text-purple-900 dark:text-purple-100">
                        ₦{connections
                          .filter(c => c.status === 'accepted')
                          .reduce((sum, c) => sum + c.investmentAmount, 0)
                          .toLocaleString('en-NG')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
} 