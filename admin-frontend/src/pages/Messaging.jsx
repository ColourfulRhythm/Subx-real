import { useState, useEffect } from 'react';
import { getMessages, sendMessage } from '../api/admin';

const Messaging = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line
  }, [userId]);

  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getMessages(userId || undefined);
      setMessages(response.data);
    } catch (error) {
      setError('Error fetching messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!userId) {
      setError('Please enter a user ID to send a message.');
      return;
    }
    setSendLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await sendMessage(userId, messageInput);
      setMessageInput('');
      setSuccessMsg('Message sent successfully.');
      fetchMessages();
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setSendLoading(false);
      setReplyTo(null);
    }
  };

  const handleReply = (msg) => {
    setUserId(msg.senderId);
    setReplyTo(msg);
    setMessageInput('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Messaging</h1>
      <div className="flex space-x-2 items-center mb-4">
        <input
          type="text"
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Filter by user ID..."
          value={userId}
          onChange={e => setUserId(e.target.value)}
        />
        <button className="btn btn-secondary" onClick={fetchMessages} disabled={loading}>
          Filter
        </button>
      </div>
      <form onSubmit={handleSend} className="flex space-x-2 mb-4">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded px-3 py-2"
          placeholder={replyTo ? `Replying to ${replyTo.senderType} ${replyTo.senderId}` : 'Type a message...'}
          value={messageInput}
          onChange={e => setMessageInput(e.target.value)}
          required
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={sendLoading || !userId || !messageInput}
        >
          {sendLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
      {successMsg && <div className="text-green-600 text-center">{successMsg}</div>}
      {error && <div className="text-red-500 text-center mt-2">{error}</div>}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {messages.map((msg) => (
                <tr key={msg._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{msg.senderType} {msg.senderId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{msg.recipientType} {msg.recipientId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{msg.content}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(msg.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {msg.senderType === 'User' && (
                      <button
                        className="btn btn-xs btn-primary"
                        onClick={() => handleReply(msg)}
                      >
                        Reply
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Messaging; 