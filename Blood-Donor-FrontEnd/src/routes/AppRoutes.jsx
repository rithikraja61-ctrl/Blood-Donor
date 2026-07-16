import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/Login/LoginPage';
import RegisterPage from '../pages/Register/RegisterPage';
import FindDonorPage from '../pages/FindDonor/FindDonorPage';
import ModuleLayout from '../layouts/ModuleLayout';
import ProtectedRoute from './ProtectedRoute';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/find-donor"
        element={(
          <ProtectedRoute>
            <ModuleLayout>
              <FindDonorPage />
            </ModuleLayout>
          </ProtectedRoute>
        )}
      />
    </Routes>
  );
}

export default AppRoutes;