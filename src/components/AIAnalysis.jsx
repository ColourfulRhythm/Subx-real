import React, { useState } from 'react';
import axios from 'axios';

const AIAnalysis = ({ developmentId }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeDevelopment = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/developments/analyze', {
        developmentId
      });
      setAnalysis(response.data);
    } catch (err) {
      setError('Failed to analyze development. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">AI Development Analysis</h2>
      
      <button
        onClick={analyzeDevelopment}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
      >
        {loading ? 'Analyzing...' : 'Analyze Development'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {analysis && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">Analysis Results</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium mb-2">Market Analysis</h4>
              <p>{analysis.marketAnalysis}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium mb-2">Risk Assessment</h4>
              <p>{analysis.riskAssessment}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium mb-2">Investment Potential</h4>
              <p>{analysis.investmentPotential}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium mb-2">Recommendations</h4>
              <p>{analysis.recommendations}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis; 