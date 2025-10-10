import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ProblemPage } from './pages/ProblemPage';
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
          <Route path="/problems/:id" element={<ProblemPage />} />
          {/* Add more protected routes here in the future */}
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/problems/1" replace />} />
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
      </BrowserRouter>
    </Provider>
  );
}

export default App;
