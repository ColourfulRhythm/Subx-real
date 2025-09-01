// Plot Naming Consistency Utility
// This ensures Plot 77 displays consistently everywhere without interface changes

/**
 * Plot naming mapping to ensure consistency across all sections
 * Backend ID 1 = Frontend Display "Plot 77"
 */
const PLOT_NAMING_MAP = {
  1: 'Plot 77',
  2: 'Plot 78', 
  3: 'Plot 79',
  77: 'Plot 77',
  78: 'Plot 78',
  79: 'Plot 79'
};

/**
 * Get consistent plot display name
 * @param {number|string} plotId - The plot ID from backend
 * @returns {string} - Consistent display name for frontend
 */
export const getPlotDisplayName = (plotId) => {
  if (!plotId) return 'Unknown Plot';
  
  // Convert to number if string
  const numericId = typeof plotId === 'string' ? parseInt(plotId) : plotId;
  
  // Return mapped name or fallback
  return PLOT_NAMING_MAP[numericId] || `Plot ${numericId}`;
};

/**
 * Get consistent plot location
 * @param {number|string} plotId - The plot ID from backend
 * @returns {string} - Consistent location display
 */
export const getPlotLocation = (plotId) => {
  if (!plotId) return 'Location Unknown';
  
  const numericId = typeof plotId === 'string' ? parseInt(plotId) : plotId;
  
  // Special handling for Plot 77 (ID 1)
  if (numericId === 1 || numericId === 77) {
    return '2 Seasons Estate, Gbako Village, Ogun State';
  }
  
  return '2 Seasons Estate, Ogun State';
};

/**
 * Get plot branding text
 * @param {number|string} plotId - The plot ID from backend
 * @returns {string} - Consistent branding text
 */
export const getPlotBranding = (plotId) => {
  const displayName = getPlotDisplayName(plotId);
  return `${displayName} - 2 Seasons Development`;
};

/**
 * Transform property data to ensure consistent naming
 * @param {Object} property - Property object from backend
 * @returns {Object} - Property with consistent naming
 */
export const transformPropertyForDisplay = (property) => {
  if (!property) return property;
  
  const plotId = property.plot_id || property.id;
  
  return {
    ...property,
    // Ensure consistent naming
    displayName: getPlotDisplayName(plotId),
    consistentTitle: getPlotDisplayName(plotId),
    location: getPlotLocation(plotId),
    branding: getPlotBranding(plotId),
    
    // Keep original fields for compatibility
    title: getPlotDisplayName(plotId),
    projectTitle: getPlotDisplayName(plotId)
  };
};

/**
 * Transform plot ownership data for consistent display
 * @param {Object} ownership - Plot ownership object
 * @returns {Object} - Ownership with consistent naming
 */
export const transformOwnershipForDisplay = (ownership) => {
  if (!ownership) return ownership;
  
  const plotId = ownership.plot_id || ownership.id;
  
  return {
    ...ownership,
    plotName: getPlotDisplayName(plotId),
    location: getPlotLocation(plotId),
    branding: getPlotBranding(plotId)
  };
};

/**
 * Transform co-owners data for consistent display
 * @param {Array} coOwners - Array of co-owner objects
 * @param {number|string} plotId - The plot ID
 * @returns {Array} - Co-owners with consistent naming
 */
export const transformCoOwnersForDisplay = (coOwners, plotId) => {
  if (!Array.isArray(coOwners)) return coOwners;
  
  const plotName = getPlotDisplayName(plotId);
  
  return coOwners.map(coOwner => ({
    ...coOwner,
    plotName: plotName,
    plotReference: plotName,
    // Ensure co-owner display is consistent
    ownershipDisplay: `${coOwner.sqmOwned || coOwner.sqm || 0} sqm in ${plotName}`
  }));
};

/**
 * Transform documents data for consistent display
 * @param {Array} documents - Array of document objects
 * @param {number|string} plotId - The plot ID
 * @returns {Array} - Documents with consistent naming
 */
export const transformDocumentsForDisplay = (documents, plotId) => {
  if (!Array.isArray(documents)) return documents;
  
  const plotName = getPlotDisplayName(plotId);
  
  return documents.map(doc => ({
    ...doc,
    plotName: plotName,
    plotReference: plotName,
    // Ensure document titles are consistent
    title: doc.title?.replace(/Plot \d+/, plotName) || doc.title
  }));
};

/**
 * Get plot information for display
 * @param {number|string} plotId - The plot ID
 * @returns {Object} - Complete plot information for display
 */
export const getPlotInfo = (plotId) => {
  const numericId = typeof plotId === 'string' ? parseInt(plotId) : plotId;
  
  return {
    id: numericId,
    displayName: getPlotDisplayName(numericId),
    location: getPlotLocation(numericId),
    branding: getPlotBranding(numericId),
    totalSqm: numericId === 1 ? 500 : 500, // Plot 77 is 500 sqm
    pricePerSqm: 5000, // ₦5,000 per sqm
    development: '2 Seasons Estate'
  };
};

/**
 * Generate document content with correct plot information
 * @param {Object} document - Document object
 * @param {Object} property - Property object
 * @param {Object} user - User object
 * @returns {Object} - Document with correct content
 */
export const generateDocumentContent = (document, property, user) => {
  const plotId = property.plot_id || property.id;
  const plotInfo = getPlotInfo(plotId);
  const sqmOwned = property.sqm || property.sqmOwned || 0;
  const ownershipPercentage = plotInfo.totalSqm > 0 ? ((sqmOwned / plotInfo.totalSqm) * 100).toFixed(2) : 0;
  
  const documentTemplates = {
    'receipt': {
      title: `Payment Receipt - ${plotInfo.displayName}`,
      content: `Payment Receipt for ${plotInfo.displayName} - ${sqmOwned} sqm at ₦${plotInfo.pricePerSqm.toLocaleString()} per sqm. Total Amount: ₦${(sqmOwned * plotInfo.pricePerSqm).toLocaleString()}`,
      status: 'generated'
    },
    'certificate': {
      title: `Certificate of Ownership - ${plotInfo.displayName}`,
      content: `Certificate of Ownership for ${plotInfo.displayName} - ${sqmOwned} sqm (${ownershipPercentage}% ownership)`,
      status: 'generated'
    },
    'deed': {
      title: `Deed of Assignment - ${plotInfo.displayName}`,
      content: `Deed of Assignment for ${plotInfo.displayName} - ${sqmOwned} sqm`,
      status: 'pending_signature'
    },
    'survey': {
      title: `Land Survey Report - ${plotInfo.displayName}`,
      content: `Land Survey Report for ${plotInfo.displayName} - ${plotInfo.location}`,
      status: 'generated'
    }
  };
  
  const template = documentTemplates[document.type] || documentTemplates['receipt'];
  
  return {
    ...document,
    ...template,
    plotName: plotInfo.displayName,
    sqmOwned: sqmOwned,
    ownershipPercentage: ownershipPercentage,
    plotLocation: plotInfo.location
  };
};

/**
 * Check if a plot ID should display as Plot 77
 * @param {number|string} plotId - The plot ID to check
 * @returns {boolean} - True if this should display as Plot 77
 */
export const isPlot77 = (plotId) => {
  const numericId = typeof plotId === 'string' ? parseInt(plotId) : plotId;
  return numericId === 1 || numericId === 77;
};

/**
 * Get plot display configuration
 * @param {number|string} plotId - The plot ID
 * @returns {Object} - Display configuration for the plot
 */
export const getPlotDisplayConfig = (plotId) => {
  const isPlot77Display = isPlot77(plotId);
  
  return {
    displayName: getPlotDisplayName(plotId),
    location: getPlotLocation(plotId),
    branding: getPlotBranding(plotId),
    isPlot77: isPlot77Display,
    // Special styling or behavior for Plot 77
    specialFeatures: isPlot77Display ? ['Premium Location', '2 Seasons Estate'] : [],
    // Color scheme or theme
    theme: isPlot77Display ? 'premium' : 'standard'
  };
};

export default {
  getPlotDisplayName,
  getPlotLocation,
  getPlotBranding,
  transformPropertyForDisplay,
  transformOwnershipForDisplay,
  transformCoOwnersForDisplay,
  transformDocumentsForDisplay,
  getPlotInfo,
  isPlot77,
  getPlotDisplayConfig
};
