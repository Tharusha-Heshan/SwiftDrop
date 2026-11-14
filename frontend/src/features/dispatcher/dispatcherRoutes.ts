import type { DispatcherIconName } from './components/DispatcherIcon';

export const dispatcherPages = [
  { id: 'overview', title: 'Operations Overview', icon: 'grid' },
  { id: 'unassigned', title: 'Unassigned Parcels', icon: 'inbox' },
  { id: 'deliveries', title: 'All Deliveries', icon: 'box' },
  { id: 'couriers', title: 'Courier Workloads', icon: 'truck' },
  { id: 'failed', title: 'Failed Deliveries', icon: 'alert' },
] as const satisfies readonly { id: string; title: string; icon: DispatcherIconName }[];

export type DispatcherPage = (typeof dispatcherPages)[number];
export type DispatcherPageId = DispatcherPage['id'];

export interface DispatcherRoute {
  page: DispatcherPage;
  /** Development only: shows the screens without signing in (like /merchant/preview). */
  preview: boolean;
}

const BASE = '/dispatcher';
const PREVIEW_BASE = '/dispatcher/preview';

export function dispatcherPath(id: DispatcherPageId, preview: boolean): string {
  const base = preview ? PREVIEW_BASE : BASE;
  return id === 'overview' ? base : `${base}/${id}`;
}

/** /dispatcher, /dispatcher/{page}; in development also /dispatcher/preview and /dispatcher/preview/{page}. */
export function matchDispatcherRoute(path: string): DispatcherRoute | undefined {
  const clean = path.length > 1 ? path.replace(/\/+$/, '') : path;
  for (const page of dispatcherPages) {
    if (clean === dispatcherPath(page.id, false)) return { page, preview: false };
    if (import.meta.env.DEV && clean === dispatcherPath(page.id, true)) return { page, preview: true };
  }
  return undefined;
}
