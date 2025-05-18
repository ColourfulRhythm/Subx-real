import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

function Dashboard() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [newSubscription, setNewSubscription] = useState({
    name: '',
    amount: '',
    renewalDate: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchSubscriptions();
  }, [navigate]);

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get('/api/subscriptions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSubscriptions(response.data);
    } catch (error) {
      toast.error('Failed to fetch subscriptions');
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/subscriptions', newSubscription, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Subscription added successfully!');
      setNewSubscription({ name: '', amount: '', renewalDate: '' });
      fetchSubscriptions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add subscription');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/subscriptions/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Subscription deleted successfully!');
      fetchSubscriptions();
    } catch (error) {
      toast.error('Failed to delete subscription');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Subscription Manager</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Add New Subscription</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Subscription Name"
                  value={newSubscription.name}
                  onChange={(e) => setNewSubscription({ ...newSubscription, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Amount"
                  value={newSubscription.amount}
                  onChange={(e) => setNewSubscription({ ...newSubscription, amount: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <input
                  type="date"
                  value={newSubscription.renewalDate}
                  onChange={(e) => setNewSubscription({ ...newSubscription, renewalDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Subscription
              </button>
            </form>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium mb-4">Your Subscriptions</h2>
              <div className="space-y-4">
                {subscriptions.map((subscription) => (
                  <div
                    key={subscription._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h3 className="text-lg font-medium">{subscription.name}</h3>
                      <p className="text-sm text-gray-500">
                        Amount: ${subscription.amount}
                      </p>
                      <p className="text-sm text-gray-500">
                        Renewal Date: {new Date(subscription.renewalDate).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(subscription._id)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard; 