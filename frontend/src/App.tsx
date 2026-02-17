import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Pages
import { HomePage } from './pages/home/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { RuralPropertiesPage } from './pages/properties/RuralPropertiesPage';
import { UrbanPropertiesPage } from './pages/properties/UrbanPropertiesPage';
import { DiagnosticsPage } from './pages/diagnostics/DiagnosticsPage';
import { IRTRPage } from './pages/irtr/IRTRPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { AIPage } from './pages/ai/AIPage';
import { NotFoundPage } from './pages/common/NotFoundPage';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <LoadingSpinner size={60} />
      </Box>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Routes>
          {/* Página inicial - sempre mostra MedidaGeo */}
          <Route path="/" element={<HomePage />} />
          
          {/* Rotas públicas */}
          <Route 
            path="/login" 
            element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="/register" 
            element={!user ? <RegisterPage /> : <Navigate to="/dashboard" replace />} 
          />
          
          {/* Rotas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/rural-properties" element={<RuralPropertiesPage />} />
              <Route path="/urban-properties" element={<UrbanPropertiesPage />} />
              <Route path="/diagnostics" element={<DiagnosticsPage />} />
              <Route path="/irtr" element={<IRTRPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/ai-assistant" element={<AIPage />} />
            </Route>
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default App;