import React from 'react';
import { Outlet } from 'react-router-dom';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNav } from './MobileBottomNav';

export const CourierLayout: React.FC = () => {
  return (
    <div className="app-container">
      <div className="dashboard-viewport">
        {/* Fixed Desktop Sidebar */}
        <DesktopSidebar />

        {/* Main Content Viewport */}
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};
