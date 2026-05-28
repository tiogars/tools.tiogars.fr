import { cleanup, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./app/App', async () => {
  const { useLocation } = await import('react-router-dom');

  return {
    App: function App() {
      const location = useLocation();

      return <div>{`${location.pathname}${location.search}`}</div>;
    },
  };
});

describe('main', () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '<div id="root"></div>';
    window.history.replaceState({}, '', '/');
    window.location.hash = '';
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
    window.history.replaceState({}, '', '/');
    window.location.hash = '';
  });

  it('loads the current route from the URL hash on initial render', async () => {
    window.location.hash = '#/backup';

    await import('./main');

    expect(await screen.findByText('/backup')).toBeInTheDocument();
  });

  it('loads the current route from the pathname when hash is missing', async () => {
    window.history.replaceState({}, '', '/dashboard?from=refresh');

    await import('./main');

    expect(await screen.findByText('/dashboard?from=refresh')).toBeInTheDocument();
  });
});
