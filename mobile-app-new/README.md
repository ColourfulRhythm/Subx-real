# Subx Mobile App

## 📱 Overview

This is the mobile version of the Subx real estate investment platform, cloned from the webapp with all core functionality implemented.

## 🚀 Features Implemented

### ✅ Authentication System
- **Firebase Authentication**: Complete sign up/sign in functionality
- **AuthContext**: Global authentication state management
- **Auto-login**: Persistent authentication state
- **User Profile**: Automatic user data fetching from backend

### ✅ User Dashboard
- **Portfolio Overview**: Display total investment value, land owned, and investment count
- **Recent Activity**: Show latest investment activities
- **My Properties**: List all user investments with details
- **Quick Actions**: Easy access to key features
- **Pull-to-refresh**: Real-time data updates

### ✅ Investment System
- **Property Details**: Comprehensive property information display
- **Investment Calculator**: Dynamic amount calculation based on selected sqm
- **Paystack Integration**: Secure payment processing
- **Investment Records**: Automatic backend saving of investment data
- **Document Management**: Investment certificates and ownership deeds

### ✅ API Integration
- **Backend Connection**: Full integration with Railway backend
- **User Data**: Fetch and display real user investment data
- **Property Management**: View and manage user properties
- **Payment Verification**: Paystack payment verification
- **Error Handling**: Comprehensive error handling and user feedback

### ✅ Navigation
- **Tab Navigation**: Bottom tab navigation with Dashboard, Projects, Forum, Notifications, Profile
- **Stack Navigation**: Modal and card-based navigation for detailed views
- **Authentication Flow**: Proper auth state-based navigation
- **Deep Linking**: Support for deep linking to specific screens

## 🏗️ Architecture

### Services
- **`firebase.js`**: Firebase authentication and configuration
- **`api.js`**: Backend API integration with authentication headers
- **`AuthContext.js`**: Global authentication state management

### Screens
- **`LoginScreen.js`**: Firebase authentication with sign up/sign in
- **`UserDashboardScreen.js`**: Main dashboard with portfolio overview
- **`PropertyDetailsScreen.js`**: Property investment interface
- **`ProjectsScreen.js`**: Browse available projects
- **`NotificationsScreen.js`**: User notifications
- **`SettingsScreen.js`**: App settings and profile management

### Navigation
- **`AppNavigator.js`**: Main navigation with auth state management
- **Tab Navigation**: Dashboard, Projects, Forum, Notifications, Profile
- **Stack Navigation**: Modal and card-based navigation

## 🔧 Technical Implementation

### Authentication Flow
1. User opens app → Welcome screen
2. User signs up/signs in → Firebase authentication
3. AuthContext fetches user data from backend
4. User data loaded → Dashboard displayed
5. Real-time updates via pull-to-refresh

### Investment Flow
1. User selects property → Property details screen
2. User selects sqm → Amount calculated dynamically
3. User confirms investment → Paystack payment
4. Payment successful → Investment saved to backend
5. User redirected to dashboard with updated portfolio

### Data Flow
1. Firebase authentication → User token
2. Token sent to backend → User data fetched
3. User data displayed → Real-time updates
4. Investment made → Backend updated
5. Portfolio refreshed → New data displayed

## 📊 Real User Support

### Real Users Added
- **Christopher Onuoha**: chrixonuoha@gmail.com - 7 sqm in 2 Seasons - ₦35,000
- **Kingkwa Enang Oyama**: kingkwaoyama@gmail.com - 35 sqm in 2 Seasons - ₦175,000

### Login Instructions
1. Open app
2. Sign up with real user email addresses
3. Set any password during registration
4. Login and see actual investment data
5. View portfolio, properties, and documents

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- Expo CLI
- Firebase project configured
- Backend API running

### Installation
```bash
cd mobile-app-new
npm install
```

### Configuration
1. Update Firebase config in `src/services/firebase.js`
2. Update API URL in `src/services/api.js`
3. Configure Paystack keys for payment processing

### Running the App
```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## 🔗 Backend Integration

### API Endpoints Used
- `GET /api/users/:userId` - Fetch user data
- `GET /api/users/:userId/properties` - Fetch user properties
- `PUT /api/users/:userId` - Update user profile
- `POST /api/investments` - Create investment
- `GET /api/verify-paystack/:reference` - Verify payment
- `GET /api/health` - Health check

### Authentication
- Firebase ID tokens sent with API requests
- Automatic token refresh
- Error handling for expired tokens

## 📱 Mobile-Specific Features

### UI/UX
- **Native Design**: iOS and Android native components
- **Responsive Layout**: Adapts to different screen sizes
- **Touch Interactions**: Optimized for mobile touch
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages

### Performance
- **Lazy Loading**: Screens load on demand
- **Image Optimization**: Optimized for mobile networks
- **Caching**: Efficient data caching
- **Offline Support**: Basic offline functionality

### Security
- **Secure Storage**: Sensitive data stored securely
- **Token Management**: Automatic token refresh
- **Input Validation**: Client-side validation
- **Error Boundaries**: Graceful error handling

## 🎯 Key Features Cloned from Webapp

### ✅ Word-for-Word Implementation
- **Authentication**: Exact same Firebase auth flow
- **User Dashboard**: Identical portfolio display
- **Investment System**: Same Paystack integration
- **API Calls**: Identical backend integration
- **Error Handling**: Same error messages and flows
- **Data Persistence**: Same data saving logic
- **Real User Support**: Same real user data display

### ✅ Bar-for-Bar Implementation
- **UI Components**: Same visual design adapted for mobile
- **Navigation Flow**: Same user journey
- **Payment Flow**: Identical payment process
- **Document Management**: Same document handling
- **Profile Management**: Same profile editing
- **Settings**: Same settings functionality

### ✅ Dot-for-Dot Implementation
- **API Endpoints**: Exact same API calls
- **Data Structures**: Identical data models
- **State Management**: Same state management patterns
- **Error Messages**: Identical error handling
- **Success Messages**: Same success notifications
- **Loading States**: Same loading indicators

## 🚀 Deployment

### Expo Build
```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

### App Store Deployment
1. Configure app.json with proper app details
2. Build production version
3. Submit to App Store/Google Play

## 📞 Support

For technical support or questions about the mobile app implementation, please refer to the main project documentation or contact the development team.

---

**Note**: This mobile app is a complete clone of the webapp functionality, ensuring users have the same experience across all platforms while maintaining the native mobile feel and performance.
