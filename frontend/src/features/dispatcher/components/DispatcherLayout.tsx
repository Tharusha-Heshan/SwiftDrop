import type { ReactNode } from 'react';
import { navigate, routes } from '../../../app/router';
import { logOut } from '../../auth/api/authApi';
import { getStatusCounts, listUnassignedDeliveries, usingSampleData } from '../api/dispatcherApi';
import { dispatcherPages, dispatcherPath, type DispatcherPageId } from '../dispatcherRoutes';
import { useDispatchData } from '../lib/useDispatchData';
import { DispatcherIcon } from './DispatcherIcon';
import { DispatcherLink } from './DispatcherLink';
import styles from './Dispatcher.module.css';

interface DispatcherLayoutProps {
  page: DispatcherPageId;
  preview: boolean;
  name?: string;
  children: ReactNode;
}

/** Sidebar counts: parcels waiting for a courier, and failed deliveries. */
async function loadNavCounts(): Promise<Partial<Record<DispatcherPageId, number>>> {
  const [unassigned, counts] = await Promise.all([listUnassignedDeliveries(), getStatusCounts()]);
  return { unassigned: unassigned.length, failed: counts.FAILED };
}

export function DispatcherLayout({ page, preview, name, children }: DispatcherLayoutProps) {
  const { data: counts } = useDispatchData(loadNavCounts, []);

  function signOut() {
    void logOut();
    navigate(routes.login, { replace: true });
  }

  const initials = name?.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'A';

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}><DispatcherIcon name="box" size={22} /></span>
          <strong>SwiftDrop</strong>
          <span className={styles.roleChip}>Admin</span>
        </div>

        <nav aria-label="Dispatch navigation">
          <ul className={styles.navigation}>
            {dispatcherPages.map(({ id, title, icon }) => {
              const count = counts?.[id];
              return (
                <li key={id}>
                  <DispatcherLink className={styles.navItem} href={dispatcherPath(id, preview)}
                    aria-current={page === id ? 'page' : undefined}>
                    <DispatcherIcon name={icon} />
                    <span className={styles.navLabel}>{title}</span>
                    {count ? <span className={styles.navCount} aria-label={`${count} waiting`}>{count}</span> : null}
                  </DispatcherLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          <span className={styles.avatar} aria-hidden="true">{initials}</span>
          <span className={styles.who}>
            <strong>{name || (preview ? 'Preview' : 'Admin')}</strong>
            <small>{preview ? 'Not signed in' : 'Admin account'}</small>
          </span>
          {!preview && (
            <button className={styles.iconButton} type="button" onClick={signOut} aria-label="Sign out" title="Sign out">
              <DispatcherIcon name="logout" />
            </button>
          )}
        </div>
      </aside>

      <main className={styles.main}>
        {(preview || usingSampleData) && (
          <p className={styles.notice} role="note">
            {usingSampleData
              ? 'Showing sample data: the backend has no dispatcher endpoints yet, so changes here stay in this browser tab.'
              : 'Development preview: you are not signed in.'}
          </p>
        )}
        {children}
      </main>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  breadcrumb?: boolean;
  preview?: boolean;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, breadcrumb, preview = false, action }: PageHeaderProps) {
  return (
    <header className={styles.pageHeader}>
      <div>
        {breadcrumb && (
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <DispatcherLink href={dispatcherPath('overview', preview)}>Operations</DispatcherLink>
            <DispatcherIcon name="right" size={14} />
            <span aria-current="page">{title}</span>
          </nav>
        )}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
