import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navigation from './components/Navigation';
import ChatBot from './components/ChatBot';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ImageAnalysisPage from './pages/ImageAnalysisPage';
import WeatherPage from './pages/WeatherPage';
import DroneMapPage from './pages/DroneMapPage';
import DroneDashboard from './pages/DroneDashboard';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <div className="min-h-screen">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <ChatBot />
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analysis"
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <ChatBot />
                    <ImageAnalysisPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/weather"
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <ChatBot />
                    <WeatherPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/map"
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <ChatBot />
                    <DroneMapPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <ChatBot />
                    <DroneDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;