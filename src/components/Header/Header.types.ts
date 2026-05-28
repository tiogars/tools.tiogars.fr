import type { ThemeMode } from '../../models/AppData/types/domain';

export interface HeaderProps {
  themeMode: ThemeMode;
  showSeededFavorite: boolean;
  onToggleNavigation: () => void;
  onToggleTheme: () => void;
  onToggleSeededFavorite: () => void;
}
