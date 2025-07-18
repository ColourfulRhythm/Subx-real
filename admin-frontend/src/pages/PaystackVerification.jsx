import { useState } from 'react';
import { verifyPaystack } from '../api/admin';

const PaystackVerification = () => {
  const [reference, setReference] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await verifyPaystack(reference);
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Paystack Payment Verification</h1>
      <form onSubmit={handleVerify} className="flex space-x-2 mb-6">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter Paystack reference..."
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          required
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !reference}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {result && (
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Payment Details</h2>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default PaystackVerification; 