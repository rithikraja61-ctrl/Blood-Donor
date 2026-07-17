import { Outlet } from 'react-router-dom';
import DonorSidebar from '../components/layout/DonorSidebar/DonorSidebar';
import './UserModuleLayout.css';

function DonorModuleLayout() {
  return (
    <div className="user-module-layout">
      <DonorSidebar />
      <main className="user-module-layout__content">
        <Outlet />
      </main>
    </div>
  );
}

export default DonorModuleLayout;
