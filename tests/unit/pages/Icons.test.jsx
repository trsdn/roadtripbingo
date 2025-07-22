import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Icons from '../../../src/pages/Icons';
import { TestWrapper } from '../../utils/testUtils';

// Mock the hooks
const mockIcons = [
  { id: '1', name: 'Car', category: 'transport', difficulty: 3, sets: [] },
  { id: '2', name: 'Tree', category: 'nature', difficulty: 2, sets: ['nature'] }
];

const mockUseIcons = {
  icons: mockIcons,
  loading: false,
  error: null,
  addIcon: vi.fn(),
  removeIcon: vi.fn(),
  updateIcon: vi.fn(),
  refreshIcons: vi.fn()
};

const mockUseSettings = {
  settings: { language: 'en' },
  updateSetting: vi.fn(),
  getSetting: (key, defaultValue) => defaultValue
};

vi.mock('../../../src/hooks/useIcons', () => ({
  default: () => mockUseIcons
}));

vi.mock('../../../src/hooks/useSettings', () => ({
  default: () => mockUseSettings
}));

describe('Icons Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('renders icon management interface', () => {
      render(
        <TestWrapper>
          <Icons />
        </TestWrapper>
      );
      
      expect(screen.getByText('Icon Management')).toBeInTheDocument();
      expect(screen.getByText('Upload Icons')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search icons...')).toBeInTheDocument();
    });

    it('displays icon list when icons are available', () => {
      render(
        <TestWrapper>
          <Icons />
        </TestWrapper>
      );
      
      expect(screen.getByText('Car')).toBeInTheDocument();
      expect(screen.getByText('Tree')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      vi.mocked(useIcons).mockReturnValue({
        ...mockUseIcons,
        loading: true,
        icons: []
      });

      render(
        <TestWrapper>
          <Icons />
        </TestWrapper>
      );
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('displays error state', () => {
      const error = new Error('Failed to load icons');
      vi.mocked(useIcons).mockReturnValue({
        ...mockUseIcons,
        error,
        icons: []
      });

      render(
        <TestWrapper>
          <Icons />
        </TestWrapper>
      );
      
      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    });
  });

  describe('Search and Filter', () => {
    it('filters icons by search term', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Icons />
        </TestWrapper>
      );
      
      const searchInput = screen.getByPlaceholderText('Search icons...');
      await user.type(searchInput, 'car');
      
      expect(screen.getByText('Car')).toBeInTheDocument();
      expect(screen.queryByText('Tree')).not.toBeInTheDocument();
    });

    it('filters by category', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Icons />
        </TestWrapper>
      );
      
      const categoryFilter = screen.getByDisplayValue('All Categories');
      await user.selectOptions(categoryFilter, 'transport');
      
      expect(screen.getByText('Car')).toBeInTheDocument();
      expect(screen.queryByText('Tree')).not.toBeInTheDocument();
    });

    it('filters by difficulty level', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Icons />
        </TestWrapper>
      );
      
      const difficultyFilter = screen.getByDisplayValue('All Difficulties');
      await user.selectOptions(difficultyFilter, '2');
      
      expect(screen.getByText('Tree')).toBeInTheDocument();
      expect(screen.queryByText('Car')).not.toBeInTheDocument();
    });

    it('combines search and filters', async () => {
      const user = userEvent.setup();
      const manyIcons = [
        ...mockIcons,
        { id: '3', name: 'Bus', category: 'transport', difficulty: 2 },
        { id: '4', name: 'Truck', category: 'transport', difficulty: 3 }
      ];

      vi.mocked(useIcons).mockReturnValue({
        ...mockUseIcons,
        icons: manyIcons
      });
      
      render(
        <TestWrapper>
          <Icons />
        </TestWrapper>
      );
      
      const searchInput = screen.getByPlaceholderText('Search icons...');
      const categoryFilter = screen.getByDisplayValue('All Categories');
      
      await user.type(searchInput, 'car');
      await user.selectOptions(categoryFilter, 'transport');
      
      expect(screen.getByText('Car')).toBeInTheDocument();
      expect(screen.queryByText('Tree')).not.toBeInTheDocument();
      expect(screen.queryByText('Bus')).not.toBeInTheDocument();
    });
  });

  describe('Icon Management Actions', () => {
    it('opens upload modal when upload button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Icons />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Upload Icons'));
      
      expect(screen.getByText('Upload New Icons')).toBeInTheDocument();
    });

    it('selects multiple icons for bulk operations', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Icons />
        </TestWrapper>
      );
      
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // First icon checkbox
      await user.click(checkboxes[2]); // Second icon checkbox
      
      expect(screen.getByText('2 items selected')).toBeInTheDocument();
    });

    it('performs bulk delete operation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Icons />
        </TestWrapper>
      );
      
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]);
      await user.click(screen.getByText('Delete Selected'));
      
      // Confirm delete
      await user.click(screen.getByText('Confirm'));
      
      expect(mockUseIcons.removeIcon).toHaveBeenCalledWith('1');
    });

    it('opens edit modal for individual icon', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Icons />
        </TestWrapper>
      );
      
      const editButtons = screen.getAllByTitle('Edit icon');
      await user.click(editButtons[0]);
      
      expect(screen.getByText('Edit Icon')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Car')).toBeInTheDocument();
    });
  });

  describe('View Toggle', () => {
    it('switches between table and grid view', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Icons />
        </TestWrapper>
      );
      
      const gridViewButton = screen.getByText('Grid View');
      await user.click(gridViewButton);
      
      expect(gridViewButton).toHaveClass('active');
      expect(screen.getByText('Table View')).not.toHaveClass('active');
    });

    it('persists view preference', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Icons />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Grid View'));
      
      expect(mockUseSettings.updateSetting).toHaveBeenCalledWith('iconView', 'grid');
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no icons exist', () => {
      vi.mocked(useIcons).mockReturnValue({
        ...mockUseIcons,
        icons: []
      });

      render(
        <TestWrapper>
          <Icons />
        </TestWrapper>
      );
      
      expect(screen.getByText('No icons found')).toBeInTheDocument();
      expect(screen.getByText('Start by uploading some icons')).toBeInTheDocument();
    });

    it('shows no results when search yields no matches', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Icons />
        </TestWrapper>
      );
      
      const searchInput = screen.getByPlaceholderText('Search icons...');
      await user.type(searchInput, 'nonexistent');
      
      expect(screen.getByText('No icons match your search')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation in search', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Icons />
        </TestWrapper>
      );
      
      const searchInput = screen.getByPlaceholderText('Search icons...');
      await user.tab();
      
      expect(searchInput).toHaveFocus();
    });

    it('supports escape key to close modals', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Icons />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Upload Icons'));
      expect(screen.getByText('Upload New Icons')).toBeInTheDocument();
      
      await user.keyboard('{Escape}');
      expect(screen.queryByText('Upload New Icons')).not.toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('handles large icon lists efficiently', () => {
      const manyIcons = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        name: `Icon ${i}`,
        category: 'test',
        difficulty: 1 + (i % 5)
      }));

      vi.mocked(useIcons).mockReturnValue({
        ...mockUseIcons,
        icons: manyIcons
      });

      const startTime = Date.now();
      render(
        <TestWrapper>
          <Icons />
        </TestWrapper>
      );
      const renderTime = Date.now() - startTime;
      
      expect(renderTime).toBeLessThan(1000); // Should render in under 1 second
      expect(screen.getByText('Icon 0')).toBeInTheDocument();
    });
  });
});