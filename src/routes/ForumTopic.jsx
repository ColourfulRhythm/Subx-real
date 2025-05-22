import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForumTopic() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch the topic data from the API
    // For now, we'll use mock data
    const mockTopic = {
      id: topicId,
      title: "Investment Strategies for Real Estate",
      content: "What are some effective investment strategies for real estate in the current market?",
      views: 156,
      replies: [
        {
          author: "John Doe",
          content: "I recommend focusing on emerging markets with strong growth potential.",
          date: "2024-03-20 14:30"
        },
        {
          author: "You",
          content: "Thanks for the insight! What specific markets are you looking at?",
          date: "2024-03-20 15:00"
        }
      ]
    };

    setTopic(mockTopic);
    setIsLoading(false);
  }, [topicId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const newReply = {
      author: 'You',
      content: newMessage.trim(),
      date: new Date().toLocaleString()
    };

    // In a real app, send the message to the API
    setTopic(prev => ({
      ...prev,
      replies: [...prev.replies, newReply]
    }));

    setNewMessage('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {topic.title}
              </h1>
              <div className="w-6"></div> {/* Spacer for alignment */}
            </div>
          </div>

          {/* Topic Content */}
          <div className="p-4 sm:p-6">
            <p className="text-gray-700 dark:text-gray-300 mb-6">{topic.content}</p>
            
            {/* Replies */}
            <div className="space-y-4">
              {topic.replies.map((reply, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${reply.author === 'You' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] sm:max-w-[70%] rounded-lg p-3 ${
                      reply.author === 'You'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <div className="text-sm font-semibold mb-1">{reply.author}</div>
                    <p className="text-sm sm:text-base">{reply.content}</p>
                    <div className="text-xs mt-1 opacity-75">{reply.date}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Reply Input */}
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 