const paths = {
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  inbox: 'M3 13h5l1.5 3h5L16 13h5M5.5 5h13L21 13v6H3v-6l2.5-8Z',
  box: 'M12 3 3.5 7.5v9L12 21l8.5-4.5v-9L12 3ZM3.5 7.5 12 12l8.5-4.5M12 12v9',
  truck: 'M3 6h11v10H3zm11 4h4l3 3v3h-7M8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm11 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z',
  alert: 'M12 4 2.5 20h19L12 4Zm0 6v4m0 3h.01',
  clock: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2',
  check: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-13 0 3 3 5-6',
  failed: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9 9l6 6m0-6-6 6',
  search: 'M15 15l5 5m-3-9a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z',
  assign: 'M15 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1m8-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 0v6m-3-3h6',
  reassign: 'M4 12a8 8 0 0 1 14-5.3M20 4v4h-4m4 4a8 8 0 0 1-14 5.3M4 20v-4h4',
  logout: 'M10 5h9v14h-9M3 12h10m-7-3-3 3 3 3',
  left: 'm15 6-6 6 6 6',
  right: 'm9 6 6 6-6 6',
  close: 'M6 6l12 12M18 6 6 18',
  pin: 'M18 10c0 4-6 9-6 9s-6-5-6-9a6 6 0 1 1 12 0Zm-6 0h.01',
  user: 'M20 20a8 8 0 0 0-16 0m12-12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
};

export type DispatcherIconName = keyof typeof paths;

export function DispatcherIcon({ name, size = 20 }: { name: DispatcherIconName; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
}
