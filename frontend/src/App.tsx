import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Regular imports for frequently accessed pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TrackDetailPage from './pages/TrackDetailPage';
import CourseDetailPage from './pages/CourseDetailPage'; // Import the CourseDetailPage

// Lazy loaded pages
const LogsPage = lazy(() => import('./pages/LogsPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const TrackListAdmin = lazy(() => import('./components/Admin/TrackListAdmin'));
const TrackForm = lazy(() => import('./components/Admin/TrackForm'));
const CourseListAdmin = lazy(() => import('./components/Admin/CourseListAdmin'));
const CourseForm = lazy(() => import('./components/Admin/CourseForm'));

// Loading component for Suspense
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
  </div>
);

function App() {
  return (
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
                <TrackListAdmin 
                  tracks={[]} 
                  onEdit={(trackId) => console.log(`Edit track ${trackId}`)} 
                  onDelete={(trackId) => console.log(`Delete track ${trackId}`)} 
                  isLoading={false} 
                />
              </AdminRoute>
            } />
            <Route path="/admin/tracks/new" element={
              <AdminRoute>
                <TrackForm 
                  onSubmit={(formData) => console.log('Form submitted', formData)} 
                  isLoading={false} 
                />
              </AdminRoute>
            } />
            <Route path="/admin/tracks/edit/:trackId" element={
              <AdminRoute>
                <TrackForm 
                  onSubmit={(formData) => console.log('Form submitted', formData)} 
                  isLoading={false} 
                />
              </AdminRoute>
            } />
            <Route path="/admin/courses" element={
              <AdminRoute>
                <CourseListAdmin 
                  courses={[]} 
                  tracks={[]} 
                  onEdit={(courseId) => console.log(`Edit course ${courseId}`)} 
                  onDelete={(courseId) => console.log(`Delete course ${courseId}`)} 
                  isLoading={false} 
                />
              </AdminRoute>
            } />
            <Route path="/admin/courses/new" element={
              <AdminRoute>
                <CourseForm 
                  tracks={[]} 
                  onSubmit={(formData) => console.log('Form submitted', formData)} 
                  isLoading={false} 
                />
              </AdminRoute>
            } />
            <Route path="/admin/courses/edit/:courseId" element={
              <AdminRoute>
                <CourseForm 
                  tracks={[]} 
                  onSubmit={(formData) => console.log('Form submitted', formData)} 
                  isLoading={false} 
                />
              </AdminRoute>
            } />
            
            {/* Fallback for unknown routes */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}

export default App;