import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import { DashboardPage } from './pages/DashboardPage';
import { ProblemPage } from './pages/ProblemPage';
import { ProblemsListPage } from './pages/ProblemsListPage';
import { SubmissionsHistoryPage } from './pages/SubmissionsHistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { GoogleCallbackPage } from './pages/GoogleCallbackPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PersistLogin } from './components/auth/PersistLogin';
import './index.css';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PersistLogin />}>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/problems" element={<ProblemsListPage />} />
          <Route path="/problems/:id" element={<ProblemPage />} />
          <Route path="/submissions" element={<SubmissionsHistoryPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          {/* Add more protected routes here in the future */}
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#2d2d2d',
              color: '#e0e0e0',
              border: '1px solid #3e3e3e',
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
