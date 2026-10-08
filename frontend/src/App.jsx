import { Routes, Route } from 'react-router-dom'
import { MainLayout, AuthLayout, DashboardLayout } from './components/layout/Layout'
import { ProtectedRoute, PublicRoute } from './components/common/ProtectedRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AnalyzeNews from './pages/AnalyzeNews'
import FactVerification from './pages/FactVerification'
import Summarizer from './pages/Summarizer'
import PredictionHistory from './pages/PredictionHistory'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="analyze" element={
          <ProtectedRoute><AnalyzeNews /></ProtectedRoute>
        } />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="register" element={<PublicRoute><Register /></PublicRoute>} />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="verify" element={<ProtectedRoute><FactVerification /></ProtectedRoute>} />
        <Route path="summarize" element={<ProtectedRoute><Summarizer /></ProtectedRoute>} />
        <Route path="history" element={<ProtectedRoute><PredictionHistory /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      </Route>
    </Routes>
  )
}
