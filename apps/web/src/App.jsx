import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, ProtectedRoute } from './context/AppContext'
import Login from './pages/Login'
import Home from './pages/Home'
import Canteen from './pages/Canteen'
import Library from './pages/Library'
import LoggingRecords from './pages/LoggingRecords'
import FinancialServices from './pages/FinancialServices'
import AuditLogs from './pages/AuditLogs'
import Announcements from './pages/Announcements'
import PasswordReset from './pages/PasswordReset'
import Settings from './pages/Settings'
import Profile from './pages/Profile'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/canteen" element={
            <ProtectedRoute allowedRoles={['student', 'canteen_personnel', 'admin']}>
              <Canteen />
            </ProtectedRoute>
          } />
          <Route path="/library" element={
            <ProtectedRoute allowedRoles={['student', 'library_personnel', 'admin']}>
              <Library />
            </ProtectedRoute>
          } />
          <Route path="/logging-records" element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <LoggingRecords />
            </ProtectedRoute>
          } />
          <Route path="/financial-services" element={
            <ProtectedRoute allowedRoles={['registrar', 'admin']}>
              <FinancialServices />
            </ProtectedRoute>
          } />
          <Route path="/audit-logs" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AuditLogs />
            </ProtectedRoute>
          } />
          <Route path="/announcements" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Announcements />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={<Profile />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
