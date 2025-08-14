import React from 'react';

export default function PaymentSuccessModal({ open, onClose, onDownloadReceipt, onDownloadCertificate, onSignDeed }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 max-w-md w-full relative mx-4">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">&times;</button>
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-green-600 dark:text-green-400">Payment Successful!</h2>
        <p className="mb-6 text-sm sm:text-base text-gray-700 dark:text-gray-200">Your payment was successful. You can now download your documents and sign your Deed of Assignment.</p>
        <div className="flex flex-col gap-3 sm:gap-4">
          <button onClick={onDownloadReceipt} className="px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Download Receipt</button>
          <button onClick={onDownloadCertificate} className="px-4 py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Download Certificate</button>
          <button onClick={onSignDeed} className="px-4 py-2 text-sm sm:text-base bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Sign Deed of Assignment</button>
        </div>
      </div>
    </div>
  );
} 