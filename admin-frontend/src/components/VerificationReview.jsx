import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const VerificationReview = () => {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState([]);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState({
    status: 'approved',
    riskLevel: 'low',
    amlChecks: {
      pep: { isPEP: false, details: '' },
      sanctions: { isSanctioned: false, details: '' },
      adverseMedia: { hasAdverseMedia: false, details: '' }
    },
    notes: '',
    rejectionReason: ''
  });

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      const response = await fetch('/api/verification/admin/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVerifications(data);
      } else {
        toast.error('Failed to fetch pending verifications');
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast.error('Failed to fetch pending verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSelect = (verification) => {
    setSelectedVerification(verification);
    setReviewData({
      status: 'approved',
      riskLevel: 'low',
      amlChecks: {
        pep: { isPEP: false, details: '' },
        sanctions: { isSanctioned: false, details: '' },
        adverseMedia: { hasAdverseMedia: false, details: '' }
      },
      notes: '',
      rejectionReason: ''
    });
  };

  const handleDocumentReview = async (documentId, status, rejectionReason = '') => {
    try {
      const response = await fetch(`/api/verification/admin/review-document/${selectedVerification._id}/${documentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, rejectionReason })
      });

      if (response.ok) {
        const updatedVerification = await response.json();
        setSelectedVerification(prev => ({
          ...prev,
          documents: prev.documents.map(doc =>
            doc._id === documentId ? updatedVerification.document : doc
          )
        }));
        toast.success('Document reviewed successfully');
      } else {
        toast.error('Failed to review document');
      }
    } catch (error) {
      console.error('Error reviewing document:', error);
      toast.error('Failed to review document');
    }
  };

  const handleReviewSubmit = async () => {
    try {
      const response = await fetch(`/api/verification/admin/complete-review/${selectedVerification._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(reviewData)
      });

      if (response.ok) {
        toast.success('Verification review completed');
        setSelectedVerification(null);
        fetchPendingVerifications();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to complete verification review');
      }
    } catch (error) {
      console.error('Error completing verification review:', error);
      toast.error('Failed to complete verification review');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Verification Review</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Verifications List */}
        <div className="md:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Pending Verifications</h2>
          <div className="space-y-4">
            {verifications.map(verification => (
              <div
                key={verification._id}
                onClick={() => handleVerificationSelect(verification)}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  selectedVerification?._id === verification._id
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                } border`}
              >
                <h3 className="font-medium">{verification.userId.name}</h3>
                <p className="text-sm text-gray-600">{verification.userId.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Submitted: {new Date(verification.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Review Panel */}
        {selectedVerification && (
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Review Verification</h2>

              {/* Personal Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium">{new Date(selectedVerification.personalInfo.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nationality</p>
                    <p className="font-medium">{selectedVerification.personalInfo.nationality}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">
                      {selectedVerification.personalInfo.address.street}<br />
                      {selectedVerification.personalInfo.address.city}, {selectedVerification.personalInfo.address.state}<br />
                      {selectedVerification.personalInfo.address.country} {selectedVerification.personalInfo.address.postalCode}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Occupation</p>
                    <p className="font-medium">{selectedVerification.personalInfo.occupation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Employer</p>
                    <p className="font-medium">{selectedVerification.personalInfo.employer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Annual Income</p>
                    <p className="font-medium">${selectedVerification.personalInfo.annualIncome.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Documents</h3>
                <div className="space-y-4">
                  {selectedVerification.documents.map(doc => (
                    <div key={doc._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{doc.type}</span>
                        <span className={`text-sm ${
                          doc.status === 'approved' ? 'text-green-600' :
                          doc.status === 'rejected' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDocumentReview(doc._id, 'approved')}
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDocumentReview(doc._id, 'rejected', 'Document quality insufficient')}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Verification Status</label>
                  <select
                    value={reviewData.status}
                    onChange={(e) => setReviewData(prev => ({ ...prev, status: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Risk Level</label>
                  <select
                    value={reviewData.riskLevel}
                    onChange={(e) => setReviewData(prev => ({ ...prev, riskLevel: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">AML Checks</h4>
                  
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={reviewData.amlChecks.pep.isPEP}
                        onChange={(e) => setReviewData(prev => ({
                          ...prev,
                          amlChecks: {
                            ...prev.amlChecks,
                            pep: { ...prev.amlChecks.pep, isPEP: e.target.checked }
                          }
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2">Politically Exposed Person (PEP)</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={reviewData.amlChecks.sanctions.isSanctioned}
                        onChange={(e) => setReviewData(prev => ({
                          ...prev,
                          amlChecks: {
                            ...prev.amlChecks,
                            sanctions: { ...prev.amlChecks.sanctions, isSanctioned: e.target.checked }
                          }
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2">Sanctions List Match</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={reviewData.amlChecks.adverseMedia.hasAdverseMedia}
                        onChange={(e) => setReviewData(prev => ({
                          ...prev,
                          amlChecks: {
                            ...prev.amlChecks,
                            adverseMedia: { ...prev.amlChecks.adverseMedia, hasAdverseMedia: e.target.checked }
                          }
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2">Adverse Media Found</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={reviewData.notes}
                    onChange={(e) => setReviewData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {reviewData.status === 'rejected' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                    <textarea
                      value={reviewData.rejectionReason}
                      onChange={(e) => setReviewData(prev => ({ ...prev, rejectionReason: e.target.value }))}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handleReviewSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Complete Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationReview; 