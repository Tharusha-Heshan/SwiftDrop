import { useEffect } from 'react';
import type { AccessClaims } from '../auth/lib/session';
import { DispatcherLayout } from './components/DispatcherLayout';
import { ProtectedDispatcherRoute } from './components/ProtectedDispatcherRoute';
import type { DispatcherRoute } from './dispatcherRoutes';
import { AllDeliveriesPage } from './pages/AllDeliveriesPage';
import { CourierWorkloadsPage } from './pages/CourierWorkloadsPage';
import { FailedDeliveriesPage } from './pages/FailedDeliveriesPage';
import { OverviewPage } from './pages/OverviewPage';
import { UnassignedParcelsPage } from './pages/UnassignedParcelsPage';

function DispatcherPortal({ route, claims }: { route: DispatcherRoute; claims?: AccessClaims }) {
  const { page, preview } = route;

  useEffect(() => {
    document.title = `${page.title} · SwiftDrop Admin`;
  }, [page.title]);

  function renderPage() {
    switch (page.id) {
      case 'overview': return <OverviewPage preview={preview} />;
      case 'unassigned': return <UnassignedParcelsPage preview={preview} />;
      case 'deliveries': return <AllDeliveriesPage preview={preview} />;
      case 'couriers': return <CourierWorkloadsPage preview={preview} />;
      case 'failed': return <FailedDeliveriesPage preview={preview} />;
    }
  }

  return (
    <DispatcherLayout page={page.id} preview={preview} name={claims?.name?.trim()}>
      {renderPage()}
    </DispatcherLayout>
  );
}

/**
 * The dispatch area for a matched route. Dispatch work is done by admins: signed-in pages need the parcel:assign
 * entitlement that the ADMIN role carries;
 * the development preview shows the screens without signing in.
 *
 * To add it to the app, in app/App.tsx before the switch:
 *   const dispatcherRoute = matchDispatcherRoute(path);
 *   if (dispatcherRoute) return <DispatcherArea route={dispatcherRoute} />;
 */
export function DispatcherArea({ route }: { route: DispatcherRoute }) {
  if (route.preview) return <DispatcherPortal route={route} />;
  return (
    <ProtectedDispatcherRoute>
      {(claims) => <DispatcherPortal route={route} claims={claims} />}
    </ProtectedDispatcherRoute>
  );
}
