import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Header } from './index';

afterEach(cleanup);

describe('Header', () => {
  it('calls the theme toggle handler', () => {
    const handleToggleTheme = vi.fn();

    render(
      <Header
        themeMode="light"
        showSeededFavorite={true}
        onToggleNavigation={() => undefined}
        onToggleTheme={handleToggleTheme}
        onToggleSeededFavorite={() => undefined}
      />,
    );

    fireEvent.click(screen.getByLabelText('Toggle theme'));

    expect(handleToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('calls the seeded favorite toggle handler when the mobile switch is changed', () => {
    const handleToggleSeededFavorite = vi.fn();

    render(
      <Header
        themeMode="light"
        showSeededFavorite={true}
        onToggleNavigation={() => undefined}
        onToggleTheme={() => undefined}
        onToggleSeededFavorite={handleToggleSeededFavorite}
      />,
    );

    fireEvent.click(screen.getByLabelText('Toggle seeded favorite'));

    expect(handleToggleSeededFavorite).toHaveBeenCalledTimes(1);
  });

  it('calls the navigation toggle handler', () => {
    const handleToggleNavigation = vi.fn();

    render(
      <Header
        themeMode="light"
        showSeededFavorite={true}
        onToggleNavigation={handleToggleNavigation}
        onToggleTheme={() => undefined}
        onToggleSeededFavorite={() => undefined}
      />,
    );

    fireEvent.click(screen.getByLabelText('Toggle navigation menu'));

    expect(handleToggleNavigation).toHaveBeenCalledTimes(1);
  });
});
