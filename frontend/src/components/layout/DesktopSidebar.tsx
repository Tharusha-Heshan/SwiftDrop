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
  ShieldCheckIcon,
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
    <aside className="sidebar" aria-label="Main Navigation">
      {/* Brand Header */}
      <div className="brand-header">
        <div className="brand-logo-icon">
          <LogoParcelIcon size={22} color="#181B20" />
        </div>
        <div className="brand-title-wrap">
          <span className="brand-title">SwiftDrop</span>
          <span className="brand-subtitle">FLEET LOGISTICS</span>
        </div>
      </div>

      {/* Courier Portal Status Badge */}
      <div className="portal-pill">
        <div className="portal-pill-left">
          <TruckIcon size={16} color="var(--primary-active)" />
          <span>Courier Portal</span>
        </div>
        <span className="portal-live-dot" title="Operational Connection Active" />
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li>
            <NavLink
              to="/courier/dashboard"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <HomeIcon size={18} className="nav-icon" />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/courier/deliveries"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <PackageIcon size={18} className="nav-icon" />
              <span>My Deliveries</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/courier/history"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <ClockIcon size={18} className="nav-icon" />
              <span>History</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/courier/notifications"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <BellIcon size={18} className="nav-icon" />
              <span>Notifications</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/courier/profile"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <UserIcon size={18} className="nav-icon" />
              <span>Profile</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-courier-card">
          <div className="courier-avatar-mini">SM</div>
          <div className="courier-card-details">
            <span className="courier-card-name">Sachin M.</span>
            <span className="courier-card-badge">
              <ShieldCheckIcon size={12} color="#10B981" />
              Verified Driver
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="sidebar-logout-btn"
          title="Sign out of Courier Portal"
        >
          <LogoutIcon size={17} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
