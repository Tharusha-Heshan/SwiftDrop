import React from 'react';
import { NavLink } from 'react-router-dom';
import { logOut } from '../../features/auth/api/authApi';
import {
  LogoParcelIcon,
  TruckIcon,
  HomeIcon,
  PackageIcon,
  ClockIcon,
  BellIcon,
  UserIcon,
  LogoutIcon,
} from '../common/Icons';

export const DesktopSidebar: React.FC = () => {
  const handleLogout = async () => {
    try {
      await logOut();
    } catch {
      // Continue navigation even if revoke fails
    }
    window.location.href = '/';
  };
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="brand-header">
        <div className="brand-logo-icon">
          <LogoParcelIcon size={22} color="#1F1712" />
        </div>
        <span className="brand-title">SwiftDrop</span>
      </div>

      {/* Courier Portal Pill */}
      <div className="portal-pill">
        <TruckIcon size={17} color="#241913" />
        <span>Courier Portal</span>
      </div>

      {/* Navigation Links */}
      <nav>
        <ul className="nav-list">
          <li>
            <NavLink
              to="/courier/dashboard"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <HomeIcon size={19} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/courier/deliveries"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <PackageIcon size={19} />
              <span>My Deliveries</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/courier/history"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <ClockIcon size={19} />
              <span>History</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/courier/notifications"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <BellIcon size={19} />
              <span>Notifications</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/courier/profile"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <UserIcon size={19} />
              <span>Profile</span>
            </NavLink>
          </li>

          <li className="sidebar-divider"></li>

          <li>
            <button
              type="button"
              onClick={handleLogout}
              className="nav-item"
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                fontSize: '13.5px',
                color: '#8A827B',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
              }}
              title="Log out of Courier Portal"
            >
              <LogoutIcon size={19} color="#8A827B" />
              <span>Log Out</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};
