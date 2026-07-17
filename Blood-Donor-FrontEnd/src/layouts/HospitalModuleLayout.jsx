import { Outlet } from 'react-router-dom';
import HospitalSidebar from '../components/layout/HospitalSidebar/HospitalSidebar';
import './UserModuleLayout.css';

function HospitalModuleLayout() {
  return (
    <div className="user-module-layout">
      <HospitalSidebar />
      <main className="user-module-layout__content">
        <Outlet />
      </main>
    </div>
  );
}

export default HospitalModuleLayout;
