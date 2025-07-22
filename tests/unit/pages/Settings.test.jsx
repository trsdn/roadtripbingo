import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Settings from '../../../src/pages/Settings';
import { TestWrapper } from '../../utils/testUtils';

const mockUseSettings = {
  settings: {
    language: 'en',
    theme: 'light',
    defaultGridSize: '5',
    autoSave: 'true',
    pdfLayout: 'two-per-page'
  },
  updateSetting: vi.fn(),
  getSetting: (key, defaultValue) => {
    const settings = {
      language: 'en',
      theme: 'light',
      defaultGridSize: '5',
      autoSave: 'true',
      pdfLayout: 'two-per-page'
    };
    return settings[key] || defaultValue;
  },
  loading: false,
  error: null
};

vi.mock('../../../src/hooks/useSettings', () => ({
  default: () => mockUseSettings
}));

describe('Settings Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('renders settings page with all sections', () => {
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );
      
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('General Settings')).toBeInTheDocument();
      expect(screen.getByText('Card Generation Defaults')).toBeInTheDocument();
      expect(screen.getByText('Export Settings')).toBeInTheDocument();
    });

    it('displays current setting values', () => {
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );
      
      expect(screen.getByDisplayValue('English')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Light')).toBeInTheDocument();
      expect(screen.getByDisplayValue('5x5')).toBeInTheDocument();
    });

    it('shows loading state when settings are loading', () => {
      vi.mocked(useSettings).mockReturnValue({
        ...mockUseSettings,
        loading: true,
        settings: {}
      });

      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );
      
      expect(screen.getByText('Loading settings...')).toBeInTheDocument();
    });

    it('displays error state when settings fail to load', () => {
      const error = new Error('Failed to load settings');
      vi.mocked(useSettings).mockReturnValue({
        ...mockUseSettings,
        error,
        settings: {}
      });

      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );
      
      expect(screen.getByText(/Error loading settings/)).toBeInTheDocument();
    });
  });

  describe('Language Settings', () => {
    it('changes language setting', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );
      
      const languageSelect = screen.getByLabelText('Language');
      await user.selectOptions(languageSelect, 'de');
      
      expect(mockUseSettings.updateSetting).toHaveBeenCalledWith('language', 'de');
    });

    it('shows language options', async () => {
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );
      
      const languageSelect = screen.getByLabelText('Language');
      expect(languageSelect).toContainHTML('<option value="en">English</option>');
      expect(languageSelect).toContainHTML('<option value="de">Deutsch</option>');
      expect(languageSelect).toContainHTML('<option value="es">Español</option>');
    });
  });

  describe('Theme Settings', () => {
    it('toggles between light and dark theme', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );
      
      const themeToggle = screen.getByLabelText('Dark Mode');
      await user.click(themeToggle);
      
      expect(mockUseSettings.updateSetting).toHaveBeenCalledWith('theme', 'dark');
    });

    it('applies theme immediately', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );
      
      const themeToggle = screen.getByLabelText('Dark Mode');
      await user.click(themeToggle);
      
      await waitFor(() => {
        expect(document.documentElement).toHaveClass('dark');
      });
    });
  });

  describe('Card Generation Defaults', () => {
    it('updates default grid size', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );
      
      const gridSizeSelect = screen.getByLabelText('Default Grid Size');
      await user.selectOptions(gridSizeSelect, '4');
      
      expect(mockUseSettings.updateSetting).toHaveBeenCalledWith('defaultGridSize', '4');
    });

    it('toggles auto-save setting', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );
      
      const autoSaveToggle = screen.getByLabelText('Auto-save card generations');
      await user.click(autoSaveToggle);
      
      expect(mockUseSettings.updateSetting).toHaveBeenCalledWith('autoSave', 'false');
    });

    it('updates default difficulty setting', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );
      
      const difficultySelect = screen.getByLabelText('Default Difficulty');
      await user.selectOptions(difficultySelect, 'HARD');
      
      expect(mockUseSettings.updateSetting).toHaveBeenCalledWith('defaultDifficulty', 'HARD');
    });
  });

  describe('Export Settings', () => {
    it('updates PDF layout preference', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );
      
      const pdfLayoutSelect = screen.getByLabelText('Default PDF Layout');
      await user.selectOptions(pdfLayoutSelect, 'one-per-page');
      
      expect(mockUseSettings.updateSetting).toHaveBeenCalledWith('pdfLayout', 'one-per-page');
    });

    it('updates compression settings', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );
      
      const compressionSelect = screen.getByLabelText('Default Compression');
      await user.selectOptions(compressionSelect, 'HIGH');
      
      expect(mockUseSettings.updateSetting).toHaveBeenCalledWith('defaultCompression', 'HIGH');
    });
  });

  describe('Advanced Settings', () => {
    it('shows advanced settings when toggled', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );
      
      const advancedToggle = screen.getByText('Show Advanced Settings');
      await user.click(advancedToggle);
      
      expect(screen.getByText('Debug Mode')).toBeInTheDocument();
      expect(screen.getByText('Performance Settings')).toBeInTheDocument();
    });

    it('toggles debug mode', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Show Advanced Settings'));
      const debugToggle = screen.getByLabelText('Enable Debug Mode');
      await user.click(debugToggle);
      
      expect(mockUseSettings.updateSetting).toHaveBeenCalledWith('debugMode', 'true');
    });

    it('updates performance settings', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Show Advanced Settings'));
      const performanceSelect = screen.getByLabelText('Rendering Mode');
      await user.selectOptions(performanceSelect, 'fast');
      
      expect(mockUseSettings.updateSetting).toHaveBeenCalledWith('renderingMode', 'fast');
    });
  });

  describe('Settings Persistence', () => {
    it('saves settings automatically on change', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );
      
      const languageSelect = screen.getByLabelText('Language');
      await user.selectOptions(languageSelect, 'de');
      
      await waitFor(() => {
        expect(screen.getByText('Settings saved')).toBeInTheDocument();
      });
    });

    it('shows save status indicator', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );
      
      const themeToggle = screen.getByLabelText('Dark Mode');
      await user.click(themeToggle);
      
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('Settings saved')).toBeInTheDocument();
      });
    });
  });

  describe('Reset Settings', () => {
    it('shows reset confirmation dialog', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );
      
      const resetButton = screen.getByText('Reset to Defaults');
      await user.click(resetButton);
      
      expect(screen.getByText('Reset all settings?')).toBeInTheDocument();
      expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
    });

    it('resets all settings when confirmed', async () => {
      const user = userEvent.setup();
      const resetAllSettings = vi.fn();
      
      vi.mocked(useSettings).mockReturnValue({
        ...mockUseSettings,
        resetAllSettings
      });
      
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Reset to Defaults'));
      await user.click(screen.getByText('Reset All Settings'));
      
      expect(resetAllSettings).toHaveBeenCalled();
    });

    it('cancels reset operation', async () => {
      const user = userEvent.setup();
      const resetAllSettings = vi.fn();
      
      vi.mocked(useSettings).mockReturnValue({
        ...mockUseSettings,
        resetAllSettings
      });
      
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Reset to Defaults'));
      await user.click(screen.getByText('Cancel'));
      
      expect(resetAllSettings).not.toHaveBeenCalled();
      expect(screen.queryByText('Reset all settings?')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for form controls', () => {
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );
      
      expect(screen.getByLabelText('Language')).toBeInTheDocument();
      expect(screen.getByLabelText('Dark Mode')).toBeInTheDocument();
      expect(screen.getByLabelText('Default Grid Size')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );
      
      await user.tab();
      expect(screen.getByLabelText('Language')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByLabelText('Dark Mode')).toHaveFocus();
    });

    it('provides clear focus indicators', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Settings />
        </TestWrapper>
      );
      
      const languageSelect = screen.getByLabelText('Language');
      await user.tab();
      
      expect(languageSelect).toHaveFocus();
      expect(languageSelect).toHaveClass('focus:ring-2');
    });
  });
});