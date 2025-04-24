import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Regular imports for frequently accessed pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TrackDetailPage from './pages/TrackDetailPage';
import CourseDetailPage from './pages/CourseDetailPage';

// Lazy loaded pages
const LogsPage = lazy(() => import('./pages/LogsPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const TrackListAdmin = lazy(() => import('./pages/admin/TrackListAdmin'));
const CourseListAdmin = lazy(() => import('./pages/admin/CourseListAdmin'));
const TrackForm = lazy(() => import('./pages/admin/TrackForm'));
const CourseForm = lazy(() => import('./pages/admin/CourseForm'));
const ConceptManagerAdmin = lazy(() => import('./pages/admin/ConceptManagerAdmin'));

// Loading component for Suspense
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              } />
              <Route path="/logs" element={
                <PrivateRoute>
                  <LogsPage />
                </PrivateRoute>
              } />
              <Route path="/goals" element={
                <PrivateRoute>
                  <GoalsPage />
                </PrivateRoute>
              } />
              <Route path="/community" element={
                <PrivateRoute>
                  <CommunityPage />
                </PrivateRoute>
              } />
              <Route path="/courses" element={
                <PrivateRoute>
                  <CoursesPage />
                </PrivateRoute>
              } />
              <Route path="/tracks/:trackId" element={
                <PrivateRoute>
                  <TrackDetailPage />
                </PrivateRoute>
              } />
              <Route path="/courses/:courseId" element={
                <PrivateRoute>
                  <CourseDetailPage />
                </PrivateRoute>
              } />
              
              {/* Admin routes */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="/admin/tracks" element={
                <AdminRoute>
                  <TrackListAdmin />
                </AdminRoute>
              } />
              <Route path="/admin/tracks/new" element={
                <AdminRoute>
                  <TrackForm />
                </AdminRoute>
              } />
              <Route path="/admin/tracks/edit/:trackId" element={
                <AdminRoute>
                  <TrackForm />
                </AdminRoute>
              } />
              <Route path="/admin/courses" element={
                <AdminRoute>
                  <CourseListAdmin />
                </AdminRoute>
              } />
              <Route path="/admin/courses/new" element={
                <AdminRoute>
                  <CourseForm />
                </AdminRoute>
              } />
              <Route path="/admin/courses/edit/:courseId" element={
                <AdminRoute>
                  <CourseForm />
                </AdminRoute>
              } />
              <Route path="/admin/concepts" element={
                <AdminRoute>
                  <ConceptManagerAdmin />
                </AdminRoute>
              } />
              
              {/* Fallback for unknown routes */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </Suspense>
        </Layout>
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;