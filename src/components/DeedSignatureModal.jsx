import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

export default function DeedSignatureModal({ open, onClose, onSubmit }) {
  const sigPad = useRef();

  if (!open) return null;

  const handleClear = () => {
    sigPad.current.clear();
  };

  const handleSubmit = () => {
    if (sigPad.current.isEmpty()) {
      alert('Please provide a signature.');
      return;
    }
    const signatureDataUrl = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
    onSubmit(signatureDataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">Sign Deed of Assignment</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-200">Please sign below to complete your ownership process.</p>
        <div className="border border-gray-300 rounded-lg bg-white mb-4">
          <SignatureCanvas ref={sigPad} penColor="black" canvasProps={{width: 400, height: 150, className: 'sigCanvas'}} />
        </div>
        <div className="flex gap-4">
          <button onClick={handleClear} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Clear</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Submit Signature</button>
        </div>
      </div>
    </div>
  );
} 