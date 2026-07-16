import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/Login/LoginPage';
import RegisterPage from '../pages/Register/RegisterPage';
import FindDonorPage from '../pages/FindDonor/FindDonorPage';
import ProfilePage from '../pages/Profile/ProfilePage';
import UserHomePage from '../pages/UserHome/UserHomePage';
import UserModuleLayout from '../layouts/UserModuleLayout';
import ProtectedRoute from './ProtectedRoute';
import { ROLES } from '../utils/constants';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={(
          <ProtectedRoute allowedRoles={[ROLES.USER]}>
            <UserModuleLayout />
          </ProtectedRoute>
        )}
      >
        <Route path="/user-home" element={<UserHomePage />} />
        <Route path="/find-donor" element={<FindDonorPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
