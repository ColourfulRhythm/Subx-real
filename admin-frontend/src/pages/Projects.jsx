import { useState, useEffect } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../api/admin';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    location: '', 
    type: '', 
    developerId: '', 
    status: 'planning', 
    unitsTotal: '', 
    unitsAvailable: '', 
    unitsPrice: '', 
    images: [],
    amenities: [],
    propertyType: 'residential',
    priceRange: '',
    targetMarket: '',
    completionDate: '',
    roi: '',
    riskLevel: 'low',
    minInvestment: '',
    maxInvestment: ''
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getProjects();
      setProjects(response.data.projects || []);
    } catch (error) {
      setError('Error fetching projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    setSuccessMsg('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'images') {
          for (let file of value) formData.append('images', file);
        } else {
          formData.append(key, value);
        }
      });
      await createProject(formData);
      setShowCreate(false);
      setForm({ title: '', description: '', location: '', type: '', developerId: '', status: 'planning', unitsTotal: '', unitsAvailable: '', unitsPrice: '', images: [] });
      setSuccessMsg('Project created successfully.');
      fetchProjects();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    setSuccessMsg('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'images') {
          for (let file of value) formData.append('images', file);
        } else {
          formData.append(key, value);
        }
      });
      await updateProject(editProject.id, formData);
      setShowEdit(false);
      setEditProject(null);
      setForm({ title: '', description: '', location: '', type: '', developerId: '', status: 'planning', unitsTotal: '', unitsAvailable: '', unitsPrice: '', images: [] });
      setSuccessMsg('Project updated successfully.');
      fetchProjects();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to update project');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject(id);
      setSuccessMsg('Project deleted successfully.');
      fetchProjects();
    } catch (err) {
      setError('Failed to delete project');
    }
  };

  const openEditModal = (project) => {
    setEditProject(project);
    setForm({
      title: project.title || '',
      description: project.description || '',
      location: project.location || '',
      type: project.type || '',
      developerId: project.developerId?._id || project.developerId || '',
      status: project.status || 'planning',
      unitsTotal: project.units?.total || '',
      unitsAvailable: project.units?.available || '',
      unitsPrice: project.units?.price || '',
      images: [],
      amenities: project.amenities || [],
      propertyType: project.propertyType || 'residential',
      priceRange: project.priceRange || '',
      targetMarket: project.targetMarket || '',
      completionDate: project.completionDate || '',
      roi: project.roi || '',
      riskLevel: project.riskLevel || 'low',
      minInvestment: project.minInvestment || '',
      maxInvestment: project.maxInvestment || ''
    });
    setShowEdit(true);
  };

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

  // Ensure projects is an array before filtering
  if (!Array.isArray(projects)) {
    return <div className="text-gray-500 text-center mt-8">No projects available</div>;
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(search.toLowerCase()) ||
                         project.location.toLowerCase().includes(search.toLowerCase()) ||
                         (project.developerId?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Projects Management</h1>
          <p className="text-gray-600 mt-1">Manage all property projects and listings</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <input
          type="text"
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="planning">Planning</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {successMsg && <div className="text-green-600 text-center p-3 bg-green-50 rounded">{successMsg}</div>}
      {error && <div className="text-red-500 text-center mt-2 p-3 bg-red-50 rounded">{error}</div>}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Developer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.map((project) => (
                <tr
                  key={project.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => openEditModal(project)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{project.title}</div>
                      <div className="text-sm text-gray-500">{project.propertyType}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project.developerId?.name || project.developer?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      project.status === 'completed' ? 'bg-green-100 text-green-800' :
                      project.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                      project.status === 'suspended' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project.units?.available || 0}/{project.units?.total || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className="btn btn-xs btn-danger"
                      onClick={e => { e.stopPropagation(); handleDelete(project.id); }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Create Project Modal */}
      {showCreate && (
        <ProjectModal
          title="Create New Project"
          form={form}
          setForm={setForm}
          onSubmit={handleCreate}
          loading={formLoading}
          error={formError}
          onClose={() => setShowCreate(false)}
        />
      )}
      {/* Edit Project Modal */}
      {showEdit && (
        <ProjectModal
          title="Edit Project"
          form={form}
          setForm={setForm}
          onSubmit={handleEdit}
          loading={formLoading}
          error={formError}
          onClose={() => { setShowEdit(false); setEditProject(null); }}
          editMode
        />
      )}
    </div>
  );
}

function ProjectModal({ title, form, setForm, onSubmit, loading, error, onClose, editMode }) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            required
          />
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Location"
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
            required
          />
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Type (e.g. Residential, Commercial)"
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
            required
          />
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Developer ID"
            value={form.developerId}
            onChange={e => setForm({ ...form, developerId: e.target.value })}
            required
          />
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
            required
          >
            <option value="planning">Planning</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <input
            type="number"
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Total Units"
            value={form.unitsTotal}
            onChange={e => setForm({ ...form, unitsTotal: e.target.value })}
            required
          />
          <input
            type="number"
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Available Units"
            value={form.unitsAvailable}
            onChange={e => setForm({ ...form, unitsAvailable: e.target.value })}
            required
          />
          <input
            type="number"
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Unit Price"
            value={form.unitsPrice}
            onChange={e => setForm({ ...form, unitsPrice: e.target.value })}
            required
          />
          <input
            type="file"
            className="w-full border border-gray-300 rounded px-3 py-2"
            multiple
            accept="image/*"
            onChange={e => setForm({ ...form, images: Array.from(e.target.files) })}
          />
          {error && <div className="text-red-500 text-center">{error}</div>}
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? (editMode ? 'Saving...' : 'Creating...') : (editMode ? 'Save Changes' : 'Create Project')}
          </button>
        </form>
      </div>
    </div>
  );
} 