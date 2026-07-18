import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/Login/LoginPage';
import RegisterPage from '../pages/Register/RegisterPage';
import FindDonorPage from '../pages/FindDonor/FindDonorPage';
import ProfilePage from '../pages/Profile/ProfilePage';
import UserHomePage from '../pages/UserHome/UserHomePage';
import BloodRequestPage from '../pages/BloodRequest/BloodRequestPage';
import MyRequestsPage from '../pages/MyRequests/MyRequestsPage';
import DonorHomePage from '../pages/DonorHome/DonorHomePage';
import DonorRequestsPage from '../pages/DonorRequests/DonorRequestsPage';
import DonorProfilePage from '../pages/DonorProfile/DonorProfilePage';
import UserModuleLayout from '../layouts/UserModuleLayout';
import DonorModuleLayout from '../layouts/DonorModuleLayout';
import HospitalModuleLayout from '../layouts/HospitalModuleLayout';
import ProtectedRoute from './ProtectedRoute';
import { ROLES } from '../utils/constants';
import HospitalHomePage from '../pages/HospitalHome/HospitalHomePage';
import HospitalProfilePage from '../pages/HospitalProfile/HospitalProfilePage';
import HospitalPatientsPage from '../pages/HospitalPatients/HospitalPatientsPage';
import HospitalSendRequestPage from '../pages/HospitalSendRequest/HospitalSendRequestPage';
import HospitalBloodBankRequestPage from '../pages/HospitalBloodBankRequest/HospitalBloodBankRequestPage';
import HospitalRequestsPage from '../pages/HospitalRequests/HospitalRequestsPage';
import BloodBankModuleLayout from '../layouts/BloodBankModuleLayout';
import BloodBankHomePage from '../pages/BloodBankHome/BloodBankHomePage';
import BloodBankProfilePage from '../pages/BloodBankProfile/BloodBankProfilePage';
import BloodBankInventoryPage from '../pages/BloodBankInventory/BloodBankInventoryPage';
import BloodBankHospitalRequestsPage from '../pages/BloodBankHospitalRequests/BloodBankHospitalRequestsPage';
import BloodBankReceivedRequestsPage from '../pages/BloodBankReceivedRequests/BloodBankReceivedRequestsPage';
import BloodBankSendRequestPage from '../pages/BloodBankSendRequest/BloodBankSendRequestPage';
import BloodBankIssueHistoryPage from '../pages/BloodBankIssueHistory/BloodBankIssueHistoryPage';

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
        <Route path="/request-blood" element={<BloodRequestPage />} />
        <Route path="/my-requests" element={<MyRequestsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route
        element={(
          <ProtectedRoute allowedRoles={[ROLES.DONOR]}>
            <DonorModuleLayout />
          </ProtectedRoute>
        )}
      >
        <Route path="/donor-home" element={<DonorHomePage />} />
        <Route path="/donor-requests" element={<DonorRequestsPage />} />
        <Route path="/donor-profile" element={<DonorProfilePage />} />
      </Route>

      <Route
        element={(
          <ProtectedRoute allowedRoles={[ROLES.HOSPITAL]}>
            <HospitalModuleLayout />
          </ProtectedRoute>
        )}
      >
        <Route path="/hospital-home" element={<HospitalHomePage />} />
        <Route path="/hospital-profile" element={<HospitalProfilePage />} />
        <Route path="/hospital-patients" element={<HospitalPatientsPage />} />
        <Route path="/hospital/send-request" element={<HospitalSendRequestPage />} />
        <Route path="/hospital/blood-bank-request" element={<HospitalBloodBankRequestPage />} />
        <Route path="/hospital-requests" element={<HospitalRequestsPage />} />
      </Route>

      <Route
        element={(
          <ProtectedRoute allowedRoles={[ROLES.BLOOD_BANK]}>
            <BloodBankModuleLayout />
          </ProtectedRoute>
        )}
      >
        <Route path="/blood-bank-home" element={<BloodBankHomePage />} />
        <Route path="/blood-bank-profile" element={<BloodBankProfilePage />} />
        <Route path="/blood-bank-inventory" element={<BloodBankInventoryPage />} />
        <Route path="/blood-bank-received-requests" element={<BloodBankReceivedRequestsPage />} />
        <Route path="/blood-bank-send-request" element={<BloodBankSendRequestPage />} />
        <Route path="/blood-bank-hospital-requests" element={<BloodBankHospitalRequestsPage />} />
        <Route path="/blood-bank-issue-history" element={<BloodBankIssueHistoryPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
