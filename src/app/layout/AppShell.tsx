import type { ChangeEvent, ReactNode } from 'react';
import { useMemo, useRef, useState } from 'react';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import UploadOutlinedIcon from '@mui/icons-material/UploadOutlined';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Drawer,
  FormControlLabel,
  Grid,
  Snackbar,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { FloatingActions } from '../../components/FloatingActions';
import { Footer } from '../../components/Footer';
import { Header } from '../../components/Header';
import { RepositoryTemplateCard } from '../../components/RepositoryTemplateCard';
import { RepositoryTemplateDialog } from '../../components/RepositoryTemplateDialog';
import { TagDialog } from '../../components/TagDialog';
import { DashboardPage } from '../../features/dashboard';
import type { DashboardController } from '../../models/AppData/controllers/useDashboardController';
import type { RepositoryTemplate } from '../../models/AppData/types/domain';

interface AppShellProps {
  controller: DashboardController;
}

interface NavigationItem {
  id: string;
  label: string;
  path: string;
}

const DRAWER_WIDTH = 280;
const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { id: 'repository-templates', label: 'Repository templates', path: '/repository-templates' },
  { id: 'tags', label: 'Tags', path: '/tags' },
  { id: 'backup', label: 'Backup', path: '/backup' },
  { id: 'preferences', label: 'Preferences', path: '/preferences' },
];

export function AppShell({ controller }: Readonly<AppShellProps>) {
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<RepositoryTemplate | null>(null);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  const selectedNavigationItem = useMemo(
    () =>
      navigationItems.find((item) => item.path === location.pathname)?.id ??
      (location.pathname === '/' ? 'dashboard' : null),
    [location.pathname],
  );

  function handleDeleteTemplate(template: RepositoryTemplate) {
    setDeleteTarget(template);
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    void controller.deleteRepositoryTemplate(deleteTarget.id);
    setDeleteTarget(null);
  }

  function handleImportChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPendingImportFile(file);
    event.target.value = '';
  }

  function handleImportStrategy(strategy: 'merge' | 'replace') {
    if (!pendingImportFile) return;
    void controller.importDataSet(pendingImportFile, strategy);
    setPendingImportFile(null);
  }

  function handleNavigation(itemId: string) {
    const target = navigationItems.find((item) => item.id === itemId);
    if (!target) return;
    navigate(target.path);
    setMobileNavigationOpen(false);
  }

  function renderDashboardContent() {
    return (
      <Stack spacing={3}>
        {controller.showBackupAlert ? (
          <Alert severity="warning">
            JSON export has not been executed recently. Use the export
            action to refresh your local backup.
          </Alert>
        ) : null}
        <DashboardPage
          templates={controller.visibleTemplates}
          repositoryCount={controller.visibleTemplates.length}
          lastBackupAt={controller.lastBackupAt}
          tags={controller.tags}
          selectedTagIds={controller.selectedTagIds}
          onEditTemplate={controller.openTemplateEditor}
          onDeleteTemplate={handleDeleteTemplate}
          onShareTemplate={(url, title) => { void controller.shareRepositoryTemplate(url, title); }}
          onToggleTagFilter={controller.toggleTagFilter}
          onClearTagFilter={controller.clearTagFilter}
        />
      </Stack>
    );
  }

  function renderRepositoryTemplatesPage() {
    return (
      <Stack spacing={3}>
        <Typography variant="h5">Repository templates</Typography>
        {controller.visibleTemplates.length === 0 ? (
          <Typography color="text.secondary">
            No repository template is currently visible.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {controller.visibleTemplates.map((template) => (
              <Grid key={template.id} size={{ xs: 12, md: 6, xl: 4 }}>
                <RepositoryTemplateCard
                  template={template}
                  tags={controller.tags}
                  onEdit={controller.openTemplateEditor}
                  onDelete={handleDeleteTemplate}
                  onShare={(url, title) => { void controller.shareRepositoryTemplate(url, title); }}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
    );
  }

  function renderTagsPage() {
    return (
      <Stack spacing={3}>
        <Typography variant="h5">Tags</Typography>
        {controller.tags.length > 0 ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {controller.tags.map((tag) => (
              <Chip
                key={tag.id}
                label={tag.label}
                sx={{ bgcolor: tag.color, color: 'common.white' }}
              />
            ))}
          </Stack>
        ) : (
          <Typography color="text.secondary">No tags are currently configured.</Typography>
        )}
        <Button variant="contained" onClick={controller.openTagDialog}>
          Manage tags
        </Button>
      </Stack>
    );
  }

  function renderBackupPage() {
    return (
      <Stack spacing={2}>
        <Typography variant="h5">Backup</Typography>
        <Typography color="text.secondary">
          Last backup: {controller.lastBackupAt ? new Date(controller.lastBackupAt).toLocaleString() : 'Never'}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button variant="outlined" onClick={() => importInputRef.current?.click()}>
            Import JSON
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              void controller.exportDataSet();
            }}
          >
            Export JSON
          </Button>
        </Stack>
      </Stack>
    );
  }

  function renderPreferencesPage() {
    return (
      <Stack spacing={2}>
        <Typography variant="h5">Preferences</Typography>
        <FormControlLabel
          control={<Switch checked={controller.themeMode === 'dark'} onChange={controller.toggleThemeMode} />}
          label="Dark theme"
        />
        <FormControlLabel
          control={
            <Switch
              checked={controller.showSeededFavorite}
              onChange={controller.toggleSeededFavoriteVisibility}
            />
          }
          label="Show seeded favorite"
        />
      </Stack>
    );
  }

  function renderNotFoundPage() {
    return (
      <Stack spacing={2}>
        <Typography variant="h5">Page not found</Typography>
        <Typography color="text.secondary">
          The requested page does not exist.
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/dashboard')}>
          Back to dashboard
        </Button>
      </Stack>
    );
  }

  function renderNavigationTree() {
    return (
      <Box role="navigation" aria-label="Main navigation" sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Navigation
        </Typography>
        <SimpleTreeView
          selectedItems={selectedNavigationItem}
          expandedItems={['workspace']}
          onItemClick={(_, itemId) => {
            if (typeof itemId === 'string') {
              handleNavigation(itemId);
            }
          }}
        >
          <TreeItem itemId="workspace" label="Workspace">
            {navigationItems.map((item) => (
              <TreeItem key={item.id} itemId={item.id} label={item.label} />
            ))}
          </TreeItem>
        </SimpleTreeView>
      </Box>
    );
  }

  function renderContentRoutes(): ReactNode {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={renderDashboardContent()} />
        <Route path="/repository-templates" element={renderRepositoryTemplatesPage()} />
        <Route path="/tags" element={renderTagsPage()} />
        <Route path="/backup" element={renderBackupPage()} />
        <Route path="/preferences" element={renderPreferencesPage()} />
        <Route path="*" element={renderNotFoundPage()} />
      </Routes>
    );
  }

  if (controller.isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        themeMode={controller.themeMode}
        showSeededFavorite={controller.showSeededFavorite}
        onToggleNavigation={() => setMobileNavigationOpen((open) => !open)}
        onToggleTheme={controller.toggleThemeMode}
        onToggleSeededFavorite={controller.toggleSeededFavoriteVisibility}
      />
      <Box sx={{ flex: 1, display: 'flex' }}>
        <Drawer
          variant="temporary"
          open={mobileNavigationOpen}
          onClose={() => setMobileNavigationOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          <Box sx={{ width: DRAWER_WIDTH }}>{renderNavigationTree()}</Box>
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          {renderNavigationTree()}
        </Drawer>
        <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
          <Container sx={{ py: 4 }}>
            {renderContentRoutes()}
          </Container>
        </Box>
      </Box>
      <Footer />
      <FloatingActions
        actions={[
          {
            icon: <AddBoxOutlinedIcon />,
            label: 'Add repository template',
            onClick: controller.openTemplateDialog,
          },
          {
            icon: <LabelOutlinedIcon />,
            label: 'Manage tags',
            onClick: controller.openTagDialog,
          },
          {
            icon: <UploadOutlinedIcon />,
            label: 'Import JSON',
            onClick: () => importInputRef.current?.click(),
          },
          {
            icon: <DownloadOutlinedIcon />,
            label: 'Export JSON',
            onClick: () => {
              void controller.exportDataSet();
            },
          },
        ]}
      />
      <input
        ref={importInputRef}
        type="file"
        accept="application/json"
        hidden
        onChange={handleImportChange}
      />
      <RepositoryTemplateDialog
        open={controller.isTemplateDialogOpen}
        tags={controller.tags}
        template={controller.editingTemplate}
        onClose={controller.closeTemplateDialog}
        onSubmit={controller.saveRepositoryTemplate}
      />
      <TagDialog
        open={controller.isTagDialogOpen}
        tags={controller.tags}
        onClose={controller.closeTagDialog}
        onAdd={controller.addTag}
        onUpdate={controller.updateTag}
        onDelete={controller.deleteTag}
      />
      <Dialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete repository template</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete &ldquo;{deleteTarget?.name}&rdquo;? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={pendingImportFile !== null} onClose={() => setPendingImportFile(null)}>
        <DialogTitle>Import dataset</DialogTitle>
        <DialogContent>
          <DialogContentText>
            How would you like to import{' '}
            <strong>{pendingImportFile?.name}</strong>?
          </DialogContentText>
          <DialogContentText sx={{ mt: 1 }}>
            <strong>Merge</strong> keeps existing templates and adds new ones.
            <br />
            <strong>Replace</strong> discards all existing data.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingImportFile(null)}>Cancel</Button>
          <Button onClick={() => handleImportStrategy('merge')}>Merge</Button>
          <Button
            variant="contained"
            onClick={() => handleImportStrategy('replace')}
          >
            Replace
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={controller.feedback !== null}
        autoHideDuration={4000}
        onClose={controller.clearFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={controller.feedback?.severity}
          onClose={controller.clearFeedback}
          variant="filled"
        >
          {controller.feedback?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
