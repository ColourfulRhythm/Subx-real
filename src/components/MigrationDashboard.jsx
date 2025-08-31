import React, { useState, useEffect } from 'react';
import { migrationService } from '../firebase/migrationService';
import { migrationUtils } from '../firebase';
import { 
  FaPlay, 
  FaStop, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaSpinner,
  FaUsers,
  FaMap,
  FaHome,
  FaMoneyBillWave,
  FaGift,
  FaDatabase,
  FaRocket
} from 'react-icons/fa';

const MigrationDashboard = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({});
  const [status, setStatus] = useState('idle');
  const [errors, setErrors] = useState([]);
  const [stats, setStats] = useState({});

  // Update progress every second during migration
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setProgress(migrationService.getProgress());
        setErrors(migrationService.getErrors());
        setStats(migrationUtils.getStats());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Start migration
  const handleStartMigration = async () => {
    try {
      setIsRunning(true);
      setStatus('starting');
      setErrors([]);
      
      console.log('🚀 Starting migration...');
      const result = await migrationService.startMigration();
      
      if (result.success) {
        setStatus('completed');
        console.log('✅ Migration completed successfully!');
      } else {
        setStatus('failed');
        console.error('❌ Migration failed');
      }
    } catch (error) {
      setStatus('failed');
      setErrors([error.message]);
      console.error('❌ Migration error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  // Stop migration
  const handleStopMigration = () => {
    migrationService.stopMigration();
    setIsRunning(false);
    setStatus('stopped');
    console.log('🛑 Migration stopped');
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-500 text-2xl" />;
      case 'failed':
        return <FaExclamationTriangle className="text-red-500 text-2xl" />;
      case 'running':
        return <FaSpinner className="text-blue-500 text-2xl animate-spin" />;
      default:
        return <FaDatabase className="text-gray-500 text-2xl" />;
    }
  };

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'running':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get status text
  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Migration Completed';
      case 'failed':
        return 'Migration Failed';
      case 'running':
        return 'Migration Running';
      case 'starting':
        return 'Starting Migration';
      case 'stopped':
        return 'Migration Stopped';
      default:
        return 'Ready to Start';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Firebase Migration Dashboard
              </h1>
              <p className="text-gray-600">
                Migrate your Supabase data to Firebase with zero downtime
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {getStatusIcon()}
              <div>
                <p className={`font-semibold ${getStatusColor()}`}>
                  {getStatusText()}
                </p>
                <p className="text-sm text-gray-500">
                  Phase: {stats.phase || 'setup'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            {!isRunning ? (
              <button
                onClick={handleStartMigration}
                disabled={status === 'completed'}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <FaRocket className="mr-2" />
                Start Migration
              </button>
            ) : (
              <button
                onClick={handleStopMigration}
                className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                <FaStop className="mr-2" />
                Stop Migration
              </button>
            )}
          </div>
        </div>

        {/* Progress Overview */}
        {isRunning && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Migration Progress</h2>
            
            {/* Overall Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm font-medium text-gray-700">
                  {progress.percentage || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Detailed Progress */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Users */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FaUsers className="text-blue-500 mr-2" />
                  <span className="font-semibold text-blue-700">Users</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {progress.users || 0}
                </div>
                <div className="text-sm text-blue-600">
                  of {progress.total || 0} total
                </div>
              </div>

              {/* Plots */}
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FaMap className="text-green-500 mr-2" />
                  <span className="font-semibold text-green-700">Plots</span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {progress.plots || 0}
                </div>
                <div className="text-sm text-green-600">
                  of {progress.total || 0} total
                </div>
              </div>

              {/* Plot Ownership */}
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FaHome className="text-purple-500 mr-2" />
                  <span className="font-semibold text-purple-700">Ownership</span>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {progress.plotOwnership || 0}
                </div>
                <div className="text-sm text-purple-600">
                  of {progress.total || 0} total
                </div>
              </div>

              {/* Investments */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FaMoneyBillWave className="text-yellow-500 mr-2" />
                  <span className="font-semibold text-yellow-700">Investments</span>
                </div>
                <div className="text-2xl font-bold text-yellow-900">
                  {progress.investments || 0}
                </div>
                <div className="text-sm text-yellow-600">
                  of {progress.total || 0} total
                </div>
              </div>

              {/* Referral Earnings */}
              <div className="bg-pink-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FaGift className="text-pink-500 mr-2" />
                  <span className="font-semibold text-pink-700">Referrals</span>
                </div>
                <div className="text-2xl font-bold text-pink-900">
                  {progress.referralEarnings || 0}
                </div>
                <div className="text-sm text-pink-600">
                  of {progress.total || 0} total
                </div>
              </div>

              {/* Completed */}
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FaCheckCircle className="text-indigo-500 mr-2" />
                  <span className="font-semibold text-indigo-700">Completed</span>
                </div>
                <div className="text-2xl font-bold text-indigo-900">
                  {progress.completed || 0}
                </div>
                <div className="text-sm text-indigo-600">
                  of {progress.total || 0} total
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Migration Statistics */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Migration Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.userCount || 0}
              </div>
              <div className="text-sm text-gray-600">Users Migrated</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.dataCount || 0}
              </div>
              <div className="text-sm text-gray-600">Records Migrated</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stats.lastSync ? new Date(stats.lastSync).toLocaleTimeString() : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Last Sync</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {stats.complete ? 'Yes' : 'No'}
              </div>
              <div className="text-sm text-gray-600">Migration Complete</div>
            </div>
          </div>
        </div>

        {/* Error Log */}
        {errors.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-red-900 mb-6">Migration Errors</h2>
            
            <div className="space-y-4">
              {errors.map((error, index) => (
                <div key={index} className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <FaExclamationTriangle className="text-red-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Migration Info */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Migration Information</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Current Phase:</span>
              <span className="text-gray-900">{stats.phase || 'setup'}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Migration Status:</span>
              <span className={`font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Last Update:</span>
              <span className="text-gray-900">
                {stats.lastSync ? new Date(stats.lastSync).toLocaleString() : 'Never'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Total Records:</span>
              <span className="text-gray-900">{progress.total || 0}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Completed Records:</span>
              <span className="text-gray-900">{progress.completed || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MigrationDashboard;
