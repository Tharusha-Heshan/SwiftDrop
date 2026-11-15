import { useEffect, useState, type ReactNode } from 'react';
import { navigate, routes } from '../../../app/router';
import { refresh } from '../../auth/api/authApi';
import { getAccessToken, readClaims, type AccessClaims } from '../../auth/lib/session';
import styles from './Dispatcher.module.css';

/** Dispatch work is done by admins; the ADMIN role carries this permission. The backend still checks every call. */
const DISPATCH_ENTITLEMENT = 'parcel:assign';

let pendingRefresh: Promise<boolean> | undefined;

function currentClaims(): AccessClaims | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const claims = readClaims(token);
    return claims.exp > Date.now() / 1000 ? claims : null;
  } catch {
    return null;
  }
}

async function restoreClaims(): Promise<AccessClaims | null> {
  const claims = currentClaims();
  if (claims) return claims;
  // One refresh at a time: the refresh token is single-use, so two parallel refreshes would end the session.
  pendingRefresh ??= refresh().catch(() => false).finally(() => {
    pendingRefresh = undefined;
  });
  return (await pendingRefresh) ? currentClaims() : null;
}

export function ProtectedDispatcherRoute({ children }: { children: (claims: AccessClaims) => ReactNode }) {
  const [claims, setClaims] = useState<AccessClaims | null>(null);

  useEffect(() => {
    let active = true;
    void restoreClaims().then((restored) => {
      if (!active) return;
      if (!restored) navigate(routes.login, { replace: true });
      else if (!restored.entitlements?.includes(DISPATCH_ENTITLEMENT)) navigate(routes.account, { replace: true });
      else setClaims(restored);
    });
    return () => {
      active = false;
    };
  }, []);

  return claims ? children(claims) : <p className={styles.loadingPage} role="status">Checking your session…</p>;
}
