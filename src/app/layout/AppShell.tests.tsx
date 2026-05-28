import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { AppShell } from './AppShell';
import type { DashboardController } from '../../models/AppData/controllers/useDashboardController';

afterEach(cleanup);

function createController(): DashboardController {
  return {
    isLoading: false,
    isTemplateDialogOpen: false,
    isTagDialogOpen: false,
    editingTemplate: null,
    themeMode: 'light',
    showSeededFavorite: true,
    visibleTemplates: [],
    lastBackupAt: null,
    tags: [],
    showBackupAlert: false,
    feedback: null,
    selectedTagIds: [],
    toggleThemeMode: vi.fn(),
    toggleSeededFavoriteVisibility: vi.fn(),
    openTemplateDialog: vi.fn(),
    openTemplateEditor: vi.fn(),
    closeTemplateDialog: vi.fn(),
    openTagDialog: vi.fn(),
    closeTagDialog: vi.fn(),
    clearFeedback: vi.fn(),
    shareRepositoryTemplate: vi.fn(async () => {}),
    toggleTagFilter: vi.fn(),
    clearTagFilter: vi.fn(),
    saveRepositoryTemplate: vi.fn(async () => {}),
    deleteRepositoryTemplate: vi.fn(async () => {}),
    addTag: vi.fn(async () => {}),
    updateTag: vi.fn(async () => {}),
    deleteTag: vi.fn(async () => {}),
    importDataSet: vi.fn(async () => {}),
    exportDataSet: vi.fn(async () => {}),
  };
}

describe('AppShell', () => {
  it('renders the backup page route', () => {
    render(
      <MemoryRouter initialEntries={['/backup']}>
        <AppShell controller={createController()} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Backup' })).toBeInTheDocument();
  });

  it('renders tree view navigation entries', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppShell controller={createController()} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('tree')).toBeInTheDocument();
    expect(screen.getByRole('treeitem', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('treeitem', { name: 'Repository templates' })).toBeInTheDocument();
    expect(screen.getByRole('treeitem', { name: 'Tags' })).toBeInTheDocument();
  });

  it('renders the not found route for unknown paths', () => {
    render(
      <MemoryRouter initialEntries={['/unknown']}>
        <AppShell controller={createController()} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });
});
