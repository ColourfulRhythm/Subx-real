import { useState, useEffect } from 'react';
import { getUsers, updateUserStatus, createUser } from '../api/admin';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'investor', phone: '', bio: '' });
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch (error) {
      setError('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (user) => {
    try {
      await updateUserStatus(user._id, !user.isActive);
      setSuccessMsg(`User ${user.isActive ? 'suspended' : 'activated'} successfully.`);
      fetchUsers();
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');
    setSuccessMsg('');
    try {
      await createUser(createForm);
      setShowCreate(false);
      setCreateForm({ name: '', email: '', password: '', role: 'investor', phone: '', bio: '' });
      setSuccessMsg('User created successfully.');
      fetchUsers();
    } catch (err) {
      setCreateError(err.response?.data?.error || 'Failed to create user');
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <div className="flex space-x-2">
          <input
            type="text"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={() => setShowCreate(true)}
          >
            + New User
          </button>
        </div>
      </div>
      {successMsg && <div className="text-green-600 text-center">{successMsg}</div>}
      {error && <div className="text-red-500 text-center mt-2">{error}</div>}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedUser(user)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className={`btn btn-xs ${user.isActive ? 'btn-danger' : 'btn-success'}`}
                      onClick={e => { e.stopPropagation(); handleStatusToggle(user); }}
                    >
                      {user.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setSelectedUser(null)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">User Details</h2>
            <div className="mb-2"><span className="font-semibold">Name:</span> {selectedUser.name}</div>
            <div className="mb-2"><span className="font-semibold">Email:</span> {selectedUser.email}</div>
            <div className="mb-2"><span className="font-semibold">Role:</span> {selectedUser.role}</div>
            <div className="mb-2"><span className="font-semibold">Status:</span> {selectedUser.isActive ? 'Active' : 'Suspended'}</div>
            <div className="mb-2"><span className="font-semibold">Phone:</span> {selectedUser.phone || '-'}</div>
            <div className="mb-2"><span className="font-semibold">Bio:</span> {selectedUser.bio || '-'}</div>
            <div className="mb-2"><span className="font-semibold">Created:</span> {new Date(selectedUser.createdAt).toLocaleString()}</div>
          </div>
        </div>
      )}
      {/* Create User Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowCreate(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Name"
                value={createForm.name}
                onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                required
              />
              <input
                type="email"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Email"
                value={createForm.email}
                onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                required
              />
              <input
                type="password"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Password"
                value={createForm.password}
                onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                required
              />
              <select
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={createForm.role}
                onChange={e => setCreateForm({ ...createForm, role: e.target.value })}
                required
              >
                <option value="investor">Investor</option>
                <option value="developer">Developer</option>
              </select>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Phone (optional)"
                value={createForm.phone}
                onChange={e => setCreateForm({ ...createForm, phone: e.target.value })}
              />
              <textarea
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Bio (optional)"
                value={createForm.bio}
                onChange={e => setCreateForm({ ...createForm, bio: e.target.value })}
              />
              {createError && <div className="text-red-500 text-center">{createError}</div>}
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={createLoading}
              >
                {createLoading ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 