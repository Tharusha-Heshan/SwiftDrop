import React from 'react';
import { NavLink } from 'react-router-dom';
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
            <div
              className="nav-item disabled"
              title="Logout will be activated when shared Identity module is integrated"
            >
              <LogoutIcon size={19} color="#8A827B" />
              <span style={{ color: '#8A827B' }}>Logout (Dev)</span>
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
};
