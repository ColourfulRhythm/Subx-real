// Fix for Developer Dashboard Form Issues
// This file contains the fixes for the form problems mentioned

// 1. FIX: Add Save Button to Forms
const addSaveButtonToForms = () => {
  // Add save button functionality to all forms
  const saveButton = `
    <button
      type="submit"
      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleFormSave}
    >
      {isLoading ? 'Saving...' : 'Save Changes'}
    </button>
  `;
  
  return saveButton;
};

// 2. FIX: Add Form Removal Functionality
const addFormRemoval = () => {
  const [showForm, setShowForm] = useState(true);
  
  const removeForm = () => {
    setShowForm(false);
    // Optionally save the preference to localStorage
    localStorage.setItem('hideForm', 'true');
  };
  
  const showFormToggle = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Form Title</h3>
        <button
          onClick={removeForm}
          className="text-gray-400 hover:text-gray-600"
          title="Remove form"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  };
  
  return { showForm, removeForm, showFormToggle };
};

// 3. FIX: Media Upload with 400kb Limit
const handleMediaUpload = (file) => {
  const MAX_FILE_SIZE = 400 * 1024; // 400kb in bytes
  
  if (file.size > MAX_FILE_SIZE) {
    // Show dialog asking for link instead
    const useLink = confirm(
      `File size (${(file.size / 1024).toFixed(1)}kb) exceeds 400kb limit. Would you like to provide a link instead?`
    );
    
    if (useLink) {
      const link = prompt('Please provide a link to your file:');
      if (link) {
        return {
          type: 'link',
          url: link,
          name: file.name,
          size: file.size
        };
      }
    }
    return null; // File rejected
  }
  
  // File is within size limit, proceed with upload
  return {
    type: 'file',
    file: file,
    name: file.name,
    size: file.size
  };
};

// 4. FIX: Enhanced Form Save Functionality
const handleFormSave = async (formData) => {
  try {
    setIsLoading(true);
    setError(null);
    
    // Validate form data
    if (!formData.title || !formData.description) {
      throw new Error('Please fill in all required fields');
    }
    
    // Handle media files
    const processedMedia = [];
    if (formData.media && formData.media.length > 0) {
      for (const media of formData.media) {
        const processed = handleMediaUpload(media);
        if (processed) {
          processedMedia.push(processed);
        }
      }
    }
    
    // Create FormData for upload
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'media') {
        processedMedia.forEach(media => {
          if (media.type === 'file') {
            submitData.append('media', media.file);
          } else {
            submitData.append('media_links', media.url);
          }
        });
      } else {
        submitData.append(key, formData[key]);
      }
    });
    
    // Submit to backend
    const response = await fetch('/api/forms/save', {
      method: 'POST',
      body: submitData
    });
    
    if (!response.ok) {
      throw new Error('Failed to save form');
    }
    
    const result = await response.json();
    setSuccess('Form saved successfully!');
    
    // Clear form after successful save
    resetForm();
    
  } catch (error) {
    console.error('Error saving form:', error);
    setError(error.message || 'Failed to save form');
  } finally {
    setIsLoading(false);
  }
};

// 5. FIX: Form State Management
const useFormState = () => {
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const resetForm = () => {
    setFormData({});
    setError(null);
    setSuccess(null);
  };
  
  return {
    formData,
    isLoading,
    error,
    success,
    updateFormData,
    resetForm,
    setIsLoading,
    setError,
    setSuccess
  };
};

// 6. FIX: Media Upload Component
const MediaUploadComponent = ({ onMediaSelect, maxSize = 400 * 1024 }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  const handleFileSelect = (files) => {
    Array.from(files).forEach(file => {
      const processed = handleMediaUpload(file);
      if (processed) {
        setUploadedFiles(prev => [...prev, processed]);
        onMediaSelect(processed);
      }
    });
  };
  
  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFileSelect(e.dataTransfer.files);
        }}
      >
        <input
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          id="media-upload"
        />
        <label htmlFor="media-upload" className="cursor-pointer">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="mt-1 text-sm text-gray-600">
            <span className="font-medium text-indigo-600 hover:text-indigo-500">
              Upload files
            </span>{' '}
            or drag and drop
          </p>
          <p className="mt-1 text-xs text-gray-500">
            PNG, JPG, PDF up to 400KB
          </p>
        </label>
      </div>
      
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">
                {file.name} ({file.type === 'link' ? 'Link' : (file.size / 1024).toFixed(1) + 'kb'})
              </span>
              <button
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 7. FIX: Complete Form Component
const FixedFormComponent = () => {
  const { showForm, removeForm, showFormToggle } = addFormRemoval();
  const { formData, isLoading, error, success, updateFormData, resetForm, setIsLoading, setError, setSuccess } = useFormState();
  
  if (!showForm) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Form has been removed</p>
        <button
          onClick={() => setShowForm(true)}
          className="mt-2 text-indigo-600 hover:text-indigo-500"
        >
          Show form again
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      {showFormToggle()}
      
      <form onSubmit={(e) => {
        e.preventDefault();
        handleFormSave(formData);
      }}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title || ''}
              onChange={(e) => updateFormData('title', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description || ''}
              onChange={(e) => updateFormData('description', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Media Files
            </label>
            <MediaUploadComponent
              onMediaSelect={(media) => {
                const currentMedia = formData.media || [];
                updateFormData('media', [...currentMedia, media]);
              }}
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          
          {success && (
            <div className="text-green-600 text-sm">{success}</div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FixedFormComponent;
