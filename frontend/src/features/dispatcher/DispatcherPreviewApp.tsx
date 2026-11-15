import { usePath } from '../../app/router';
import { DispatcherArea } from './DispatcherPortal';
import { matchDispatcherRoute } from './dispatcherRoutes';

/** The dispatcher area on its own, for the /dispatcher.html preview page. */
export function DispatcherPreviewApp() {
  const path = usePath();
  const route = matchDispatcherRoute(path);
  return route
    ? <DispatcherArea route={route} />
    : <p style={{ padding: 24 }}>This page isn't part of the dispatcher area. <a href="/dispatcher.html">Back to the dispatcher</a></p>;
}
