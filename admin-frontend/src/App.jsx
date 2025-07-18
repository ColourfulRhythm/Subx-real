import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Users from './pages/Users.jsx';
import Connections from './pages/Connections.jsx';
import Documents from './pages/Documents.jsx';
import Messaging from './pages/Messaging.jsx';
import Projects from './pages/Projects.jsx';
import Analytics from './pages/Analytics.jsx';
import PaystackVerification from './pages/PaystackVerification.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

const App = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Dashboard />} />
      <Route path="users" element={<Users />} />
      <Route path="connections" element={<Connections />} />
      <Route path="documents" element={<Documents />} />
      <Route path="messaging" element={<Messaging />} />
      <Route path="projects" element={<Projects />} />
      <Route path="analytics" element={<Analytics />} />
      <Route path="paystack-verification" element={<PaystackVerification />} />
    </Route>
  </Routes>
);

export default App; 