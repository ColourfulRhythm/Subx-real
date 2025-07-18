import { useState, useEffect } from 'react';
import { getDocuments, uploadDocument, sendDocumentToUser, deleteDocument } from '../api/admin';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ file: null, type: 'other', userId: '' });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [sendLoading, setSendLoading] = useState('');
  const [deleteLoading, setDeleteLoading] = useState('');

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getDocuments();
      setDocuments(response.data);
    } catch (error) {
      setError('Error fetching documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadLoading(true);
    setUploadError('');
    setSuccessMsg('');
    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('type', uploadForm.type);
      if (uploadForm.userId) formData.append('userId', uploadForm.userId);
      await uploadDocument(formData);
      setShowUpload(false);
      setUploadForm({ file: null, type: 'other', userId: '' });
      setSuccessMsg('Document uploaded successfully.');
      fetchDocuments();
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Failed to upload document');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSend = async (docId) => {
    const userId = prompt('Enter user ID to send this document to:');
    if (!userId) return;
    setSendLoading(docId);
    setSuccessMsg('');
    try {
      await sendDocumentToUser(docId, userId);
      setSuccessMsg('Document sent to user.');
      fetchDocuments();
    } catch (err) {
      setError('Failed to send document');
    } finally {
      setSendLoading('');
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    setDeleteLoading(docId);
    setSuccessMsg('');
    try {
      await deleteDocument(docId);
      setSuccessMsg('Document deleted successfully.');
      fetchDocuments();
    } catch (err) {
      setError('Failed to delete document');
    } finally {
      setDeleteLoading('');
    }
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
        <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
          + Upload Document
        </button>
      </div>
      {successMsg && <div className="text-green-600 text-center">{successMsg}</div>}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filename</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.filename}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.uploadedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.userId || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.sentAt ? new Date(doc.sentAt).toLocaleString() : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(doc.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-xs btn-secondary"
                      download
                    >
                      Download
                    </a>
                    <button
                      className="btn btn-xs btn-primary"
                      onClick={() => handleSend(doc._id)}
                      disabled={sendLoading === doc._id}
                    >
                      {sendLoading === doc._id ? 'Sending...' : 'Send'}
                    </button>
                    <button
                      className="btn btn-xs btn-danger"
                      onClick={() => handleDelete(doc._id)}
                      disabled={deleteLoading === doc._id}
                    >
                      {deleteLoading === doc._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Upload Document Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowUpload(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Upload Document</h2>
            <form onSubmit={handleUpload} className="space-y-3">
              <input
                type="file"
                className="w-full border border-gray-300 rounded px-3 py-2"
                accept="application/pdf,image/*"
                onChange={e => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                required
              />
              <select
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={uploadForm.type}
                onChange={e => setUploadForm({ ...uploadForm, type: e.target.value })}
                required
              >
                <option value="deed">Deed</option>
                <option value="receipt">Receipt</option>
                <option value="agreement">Agreement</option>
                <option value="other">Other</option>
              </select>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="User ID (optional)"
                value={uploadForm.userId}
                onChange={e => setUploadForm({ ...uploadForm, userId: e.target.value })}
              />
              {uploadError && <div className="text-red-500 text-center">{uploadError}</div>}
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={uploadLoading}
              >
                {uploadLoading ? 'Uploading...' : 'Upload'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents; 