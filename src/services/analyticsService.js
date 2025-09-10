import { analytics, logEvent } from '../firebase';

// Analytics service for tracking user interactions and business metrics
export class AnalyticsService {
  // Track user signup
  static trackSignup(method = 'email') {
    if (analytics) {
      logEvent(analytics, 'sign_up', {
        method: method
      });
    }
  }

  // Track user login
  static trackLogin(method = 'email') {
    if (analytics) {
      logEvent(analytics, 'login', {
        method: method
      });
    }
  }

  // Track investment purchase
  static trackPurchase(amount, sqm, projectId) {
    if (analytics) {
      logEvent(analytics, 'purchase', {
        currency: 'NGN',
        value: amount,
        items: [{
          item_id: projectId,
          item_name: 'Land Investment',
          item_category: 'Real Estate',
          quantity: sqm,
          price: amount / sqm
        }]
      });
    }
  }

  // Track page views
  static trackPageView(pageName) {
    if (analytics) {
      logEvent(analytics, 'page_view', {
        page_title: pageName,
        page_location: window.location.href
      });
    }
  }

  // Track referral code usage
  static trackReferralUsed(referralCode) {
    if (analytics) {
      logEvent(analytics, 'referral_used', {
        referral_code: referralCode
      });
    }
  }

  // Track referral earnings
  static trackReferralEarning(amount, referredUserId) {
    if (analytics) {
      logEvent(analytics, 'referral_earning', {
        currency: 'NGN',
        value: amount,
        referred_user_id: referredUserId
      });
    }
  }

  // Track property view
  static trackPropertyView(propertyId, propertyName) {
    if (analytics) {
      logEvent(analytics, 'view_item', {
        item_id: propertyId,
        item_name: propertyName,
        item_category: 'Real Estate'
      });
    }
  }

  // Track search
  static trackSearch(searchTerm) {
    if (analytics) {
      logEvent(analytics, 'search', {
        search_term: searchTerm
      });
    }
  }

  // Track custom events
  static trackCustomEvent(eventName, parameters = {}) {
    if (analytics) {
      logEvent(analytics, eventName, parameters);
    }
  }

  // Track user engagement
  static trackEngagement(action, details = {}) {
    if (analytics) {
      logEvent(analytics, 'user_engagement', {
        action: action,
        ...details
      });
    }
  }
}

export default AnalyticsService;
