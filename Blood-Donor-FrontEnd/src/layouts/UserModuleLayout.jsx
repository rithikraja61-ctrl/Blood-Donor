import { Outlet } from 'react-router-dom';
import UserSidebar from '../components/layout/UserSidebar/UserSidebar';
import './UserModuleLayout.css';

function UserModuleLayout() {
  return (
    <div className="user-module-layout">
      <UserSidebar />
      <main className="user-module-layout__content">
        <Outlet />
      </main>
    </div>
  );
}

export default UserModuleLayout;
