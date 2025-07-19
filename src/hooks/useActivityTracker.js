import { useCallback } from 'react';
import axios from 'axios';

export const useActivityTracker = () => {
  const trackActivity = useCallback(async (activityType, description, metadata = {}) => {
    try {
      await axios.post('/api/activities/track', {
        activityType,
        description,
        metadata
      });
    } catch (error) {
      console.error('Error tracking activity:', error);
      // Don't throw error to avoid breaking user experience
    }
  }, []);

  const trackLogin = useCallback((userId, userType) => {
    return trackActivity('login', 'User logged in', { userId, userType });
  }, [trackActivity]);

  const trackLogout = useCallback((userId, userType) => {
    return trackActivity('logout', 'User logged out', { userId, userType });
  }, [trackActivity]);

  const trackProfileUpdate = useCallback((userId, userType, changes) => {
    return trackActivity('profile_update', 'Profile updated', { userId, userType, changes });
  }, [trackActivity]);

  const trackInvestment = useCallback((userId, userType, investmentData) => {
    return trackActivity('investment_made', 'Investment made', { userId, userType, ...investmentData });
  }, [trackActivity]);

  const trackProjectView = useCallback((userId, userType, projectId, projectName) => {
    return trackActivity('project_viewed', `Viewed project: ${projectName}`, { userId, userType, projectId, projectName });
  }, [trackActivity]);

  const trackDocumentDownload = useCallback((userId, userType, documentType, documentId) => {
    return trackActivity('document_downloaded', `Downloaded ${documentType}`, { userId, userType, documentType, documentId });
  }, [trackActivity]);

  const trackConnectionRequest = useCallback((userId, userType, targetUserId, targetUserType) => {
    return trackActivity('connection_request', 'Connection request sent', { userId, userType, targetUserId, targetUserType });
  }, [trackActivity]);

  const trackPayment = useCallback((userId, userType, amount, currency, paymentMethod) => {
    return trackActivity('payment_made', `Payment of ${amount} ${currency} made`, { userId, userType, amount, currency, paymentMethod });
  }, [trackActivity]);

  const trackVerification = useCallback((userId, userType, verificationType) => {
    return trackActivity('verification_submitted', `${verificationType} verification submitted`, { userId, userType, verificationType });
  }, [trackActivity]);

  const trackForumPost = useCallback((userId, userType, postType, postId) => {
    return trackActivity('forum_post', `${postType} posted in forum`, { userId, userType, postType, postId });
  }, [trackActivity]);

  const trackMessage = useCallback((userId, userType, recipientId, messageType) => {
    return trackActivity('message_sent', `${messageType} message sent`, { userId, userType, recipientId, messageType });
  }, [trackActivity]);

  return {
    trackActivity,
    trackLogin,
    trackLogout,
    trackProfileUpdate,
    trackInvestment,
    trackProjectView,
    trackDocumentDownload,
    trackConnectionRequest,
    trackPayment,
    trackVerification,
    trackForumPost,
    trackMessage
  };
}; 