import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CourierLayout } from './components/layout/CourierLayout';
import { DashboardPage } from './pages/courier/DashboardPage';
import { MyDeliveriesPage } from './pages/courier/MyDeliveriesPage';
import { DeliveryDetailPage } from './pages/courier/DeliveryDetailPage';
import { HistoryPage } from './pages/courier/HistoryPage';
import { NotificationsPage } from './pages/courier/NotificationsPage';
import { ProfilePage } from './pages/courier/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Development root redirects to Courier Portal */}
        <Route path="/" element={<Navigate to="/courier/dashboard" replace />} />
        <Route path="/courier" element={<Navigate to="/courier/dashboard" replace />} />

        {/* Courier Module Routes wrapped in CourierLayout */}
        <Route path="/courier" element={<CourierLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="deliveries" element={<MyDeliveriesPage />} />
          <Route path="deliveries/:trackingNumber" element={<DeliveryDetailPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/courier/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
