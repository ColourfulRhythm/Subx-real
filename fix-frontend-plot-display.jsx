// Frontend Fix for Plot 77 Display Consistency
// This component ensures Plot 77 displays the same everywhere

import React, { useState, useEffect } from 'react';

// Plot naming consistency helper
const usePlotNaming = () => {
  const [plotNames, setPlotNames] = useState({});
  
  useEffect(() => {
    // Initialize plot naming mapping
    const plotMapping = {
      1: 'Plot 77',
      2: 'Plot 78', 
      3: 'Plot 79',
      77: 'Plot 77',
      78: 'Plot 78',
      79: 'Plot 79'
    };
    
    setPlotNames(plotMapping);
  }, []);
  
  const getPlotDisplayName = (plotId) => {
    if (typeof plotId === 'string') {
      plotId = parseInt(plotId);
    }
    return plotNames[plotId] || `Plot ${plotId}`;
  };
  
  const getPlotLocation = (plotId) => {
    if (plotId === 1 || plotId === 77) {
      return '2 Seasons Estate, Gbako Village, Ogun State';
    }
    return '2 Seasons Estate, Ogun State';
  };
  
  return { getPlotDisplayName, getPlotLocation };
};

// Enhanced property display component
const ConsistentPropertyDisplay = ({ property, children }) => {
  const { getPlotDisplayName, getPlotLocation } = usePlotNaming();
  
  // Ensure consistent naming
  const displayName = getPlotDisplayName(property.plot_id || property.id);
  const location = getPlotLocation(property.plot_id || property.id);
  
  return (
    <div className="property-display">
      <div className="property-header">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">
          {displayName}
        </h3>
        <p className="text-gray-600 text-sm">{location}</p>
      </div>
      
      <div className="property-details">
        <p className="text-gray-600 mb-4">
          {displayName} - 2 Seasons Development
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Land Area</p>
            <p className="font-medium text-gray-900">
              {property.sqmOwned || property.sqm_owned} sq.m
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Amount Paid</p>
            <p className="font-medium text-gray-900">
              ₦{(property.amountInvested || property.amount_paid)?.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Purchase Date</p>
            <p className="font-medium text-gray-900">
              {new Date(property.dateInvested || property.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium text-gray-900">
              {property.status || 'completed'}
            </p>
          </div>
        </div>
        
        {children}
      </div>
    </div>
  );
};

// Enhanced document display component
const ConsistentDocumentDisplay = ({ documents, plotId }) => {
  const { getPlotDisplayName } = usePlotNaming();
  const plotName = getPlotDisplayName(plotId);
  
  return (
    <div className="documents-section">
      <h4 className="text-lg font-semibold mb-4">
        Documents for {plotName}
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents?.map((document, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="font-medium text-gray-900">{document.name}</span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                document.signed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {document.signed ? 'Signed' : 'Pending'}
              </span>
            </div>
            
            <div className="text-sm text-gray-600 mb-3">
              {document.document_content || document.description}
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => handleViewDocument(document)}
                className="flex-1 px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                View
              </button>
              {!document.signed && (
                <button 
                  onClick={() => handleSignDocument(document)}
                  className="flex-1 px-3 py-1 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded hover:bg-indigo-700"
                >
                  Sign
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced co-owners display component
const ConsistentCoOwnersDisplay = ({ plotId, coOwners }) => {
  const { getPlotDisplayName } = usePlotNaming();
  const plotName = getPlotDisplayName(plotId);
  
  return (
    <div className="co-owners-section">
      <h4 className="text-lg font-semibold mb-4">
        Co-owners of {plotName}
      </h4>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coOwners?.map((owner, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-indigo-600 font-semibold">
                  {owner.full_name?.charAt(0) || owner.email?.charAt(0) || 'U'}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {owner.full_name || owner.email}
              </p>
              <p className="text-xs text-gray-500">
                {owner.sqm_owned || owner.sqmOwned} sqm
              </p>
              <p className="text-xs text-gray-500">
                {((owner.sqm_owned || owner.sqmOwned) / 500 * 100).toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main property wrapper component
const PropertyWrapper = ({ property, children }) => {
  const { getPlotDisplayName } = usePlotNaming();
  
  // Ensure the property always displays with consistent naming
  const enhancedProperty = {
    ...property,
    displayName: getPlotDisplayName(property.plot_id || property.id),
    consistentTitle: getPlotDisplayName(property.plot_id || property.id)
  };
  
  return (
    <ConsistentPropertyDisplay property={enhancedProperty}>
      {children}
    </ConsistentPropertyDisplay>
  );
};

// Export all components
export {
  usePlotNaming,
  ConsistentPropertyDisplay,
  ConsistentDocumentDisplay,
  ConsistentCoOwnersDisplay,
  PropertyWrapper
};

// Usage example:
/*
import { PropertyWrapper, ConsistentDocumentDisplay, ConsistentCoOwnersDisplay } from './fix-frontend-plot-display';

// In your component:
<PropertyWrapper property={property}>
  <ConsistentDocumentDisplay documents={property.documents} plotId={property.plot_id} />
  <ConsistentCoOwnersDisplay plotId={property.plot_id} coOwners={property.coOwners} />
</PropertyWrapper>
*/
