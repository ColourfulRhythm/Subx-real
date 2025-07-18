import React from 'react';

export default function PaymentSuccessModal({ open, onClose, onDownloadReceipt, onSignDeed }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-green-600 dark:text-green-400">Payment Successful!</h2>
        <p className="mb-6 text-gray-700 dark:text-gray-200">Your payment was successful. You can now download your receipt and sign your Deed of Assignment.</p>
        <div className="flex flex-col gap-4">
          <button onClick={onDownloadReceipt} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Download Receipt</button>
          <button onClick={onSignDeed} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Sign Deed of Assignment</button>
        </div>
      </div>
    </div>
  );
} 