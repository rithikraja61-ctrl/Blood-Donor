import { Outlet } from 'react-router-dom';
import BloodBankSidebar from '../components/layout/BloodBankSidebar/BloodBankSidebar';
import './UserModuleLayout.css';

function BloodBankModuleLayout() {
  return (
    <div className="user-module-layout">
      <BloodBankSidebar />
      <main className="user-module-layout__content">
        <Outlet />
      </main>
    </div>
  );
}

export default BloodBankModuleLayout;
