import { NavLink, useNavigate } from 'react-router-dom';
import Stamp from './Stamp';
import RoleSwitcher from './RoleSwitcher';
import { ROLE_META, useRole } from '../context/RoleContext';
import { useAuth } from '../context/AuthContext';
import { logout } from '../api/auth';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', roles: ['super_admin', 'org_admin', 'manager', 'member'] },
  { to: '/projects', label: 'Projects', roles: ['super_admin', 'org_admin', 'manager', 'member'] },
  { to: '/organizations', label: 'Organizations', roles: ['super_admin'] },
  { to: '/team', label: 'Team', roles: ['super_admin', 'org_admin'] },
  { to: '/sessions', label: 'Sessions', roles: ['super_admin', 'org_admin', 'manager', 'member'] },
  { to: '/settings', label: 'Settings', roles: ['super_admin', 'org_admin', 'manager', 'member'] },
];

function Sidebar() {
  const { role } = useRole();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout().finally(() => {
      setUser(null);
      navigate('/');
    });
  };

  return (
    <div className="sidebar">
      <div className="brand">
        Role<span>call</span>
      </div>
      <div className="org-name">{user?.org_name || 'MAIN BRANCH · NO AUTH'}</div>

      {/* <RoleSwitcher /> */}

      <div className="user-card">
        <Stamp size="md" name={user?.name} role={user?.role} />
        <div>
          <div className="name">{user?.name || 'Not signed in'}</div>
          <div className="role-label">{ROLE_META[user?.role]?.label || ''}</div>
        </div>
      </div>

      {NAV_ITEMS.filter((item) => item.roles.includes(role)).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon"></span> {item.label}
        </NavLink>
      ))}

      <button type="button" className="sidebar-footer" onClick={handleSignOut}>
        ↩ SIGN OUT
      </button>
    </div>
  );
}

export default Sidebar;
