import React from 'react';

function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <img src="/subx-logo/header-logo.png" alt="Subx Logo" className="h-12 w-auto mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
            <p className="mt-2 text-lg text-gray-600">
              Get in touch with our team for support and inquiries
            </p>
          </div>
        </div>
      </div>

      {/* Help & Contact Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700">subx@focalpointdev.com</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <span className="text-gray-700">/contact</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">How can we help?</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Project investment inquiries</li>
                  <li>• Platform usage support</li>
                  <li>• Account management</li>
                  <li>• Technical assistance</li>
                  <li>• Partnership opportunities</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Response Time</h3>
                <p className="text-gray-600">
                  We typically respond to all inquiries within 24 hours during business days. 
                  For urgent matters, please include "URGENT" in your subject line.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Send us a message</h3>
              
              {/* Primary: AdParlay iframe */}
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> We're experiencing issues with our external form service. 
                    Please use the form below or contact us directly via email.
                  </p>
                </div>
                <div className="relative">
                  <iframe 
                    src="https://www.adparlay.com/form/XxEXScEskuJJGDK9n1fi" 
                    width="100%" 
                    height="600" 
                    frameBorder="0" 
                    allow="camera; microphone; geolocation"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                    style={{ border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    title="Contact Form"
                    onError={(e) => console.error('Iframe failed to load:', e)}
                  />
                  {/* Loading overlay */}
                  <div className="absolute inset-0 bg-gray-50 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <p className="text-gray-500 text-sm">Loading contact form...</p>
                  </div>
                </div>
              </div>



              {/* Direct contact information */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Need immediate assistance?</strong> Contact us directly:
                </p>
                <div className="space-y-1 text-sm text-blue-700">
                  <p>📧 Email: <a href="mailto:subx@focalpointdev.com" className="underline hover:text-blue-900">subx@focalpointdev.com</a></p>
                  <p>🌐 Website: <a href="/contact" className="underline hover:text-blue-900">/contact</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
