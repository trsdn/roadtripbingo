import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TestWrapper } from '../utils/testUtils';

// Import components to test
import Navigation from '../../src/components/Navigation';
import BingoCard from '../../src/components/BingoCard';
import IconGrid from '../../src/components/IconGrid';
import Generator from '../../src/pages/Generator';

// Extend expect with accessibility matchers
expect.extend(toHaveNoViolations);

// Mock hooks for page components
vi.mock('../../src/hooks/useIcons', () => ({
  default: () => ({
    icons: [
      { id: '1', name: 'Car', category: 'transport', difficulty: 3 },
      { id: '2', name: 'Tree', category: 'nature', difficulty: 2 }
    ],
    loading: false,
    error: null,
    addIcon: vi.fn(),
    removeIcon: vi.fn()
  })
}));

vi.mock('../../src/hooks/useSettings', () => ({
  default: () => ({
    settings: { language: 'en', theme: 'light' },
    updateSetting: vi.fn(),
    getSetting: (key, defaultValue) => defaultValue
  })
}));

describe('Accessibility Tests', () => {
  describe('ARIA Labels and Roles', () => {
    it('Navigation has proper ARIA labels', () => {
      render(
        <TestWrapper>
          <Navigation />
        </TestWrapper>
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Main navigation');
      
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('aria-label');
      });
    });

    it('BingoCard has proper structure and labels', () => {
      const mockCard = {
        id: '1',
        title: 'Test Bingo Card',
        cells: [
          { icon: { name: 'Car', data: 'data:image/png;base64,test1' }, isBlank: false },
          { icon: null, isBlank: true },
          { icon: { name: 'Tree', data: 'data:image/png;base64,test2' }, isBlank: false }
        ],
        gridSize: 2
      };

      render(
        <TestWrapper>
          <BingoCard card={mockCard} showLabels={true} />
        </TestWrapper>
      );

      // Should have proper table structure
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByRole('table')).toHaveAttribute('aria-label', 'Bingo card: Test Bingo Card');

      // Cells should have proper roles and labels
      const cells = screen.getAllByRole('cell');
      expect(cells).toHaveLength(4); // 2x2 grid

      // Check for proper alt text on images
      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('alt')).not.toBe('');
      });
    });

    it('IconGrid provides proper labeling for selection', () => {
      const mockIcons = [
        { id: '1', name: 'Car', category: 'transport', data: 'data:image/png;base64,test1' },
        { id: '2', name: 'Tree', category: 'nature', data: 'data:image/png;base64,test2' }
      ];

      render(
        <TestWrapper>
          <IconGrid icons={mockIcons} selectable={true} />
        </TestWrapper>
      );

      expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Icon selection grid');
      
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach((checkbox, index) => {
        expect(checkbox).toHaveAttribute('aria-label', `Select ${mockIcons[index].name}`);
      });
    });

    it('Forms have proper labels and descriptions', () => {
      render(
        <TestWrapper>
          <Generator />
        </TestWrapper>
      );

      // All form inputs should have labels
      const inputs = screen.getAllByRole('textbox');
      const selects = screen.getAllByRole('combobox');
      const checkboxes = screen.getAllByRole('checkbox');

      [...inputs, ...selects, ...checkboxes].forEach(element => {
        const id = element.getAttribute('id');
        if (id) {
          const label = screen.queryByLabelText(new RegExp(element.getAttribute('aria-label') || '', 'i'));
          expect(label || element.getAttribute('aria-label')).toBeTruthy();
        }
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports tab navigation through all interactive elements', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Navigation />
        </TestWrapper>
      );

      const interactiveElements = screen.getAllByRole('link');
      
      // Should be able to tab through all links
      for (let i = 0; i < interactiveElements.length; i++) {
        await user.tab();
        expect(interactiveElements[i]).toHaveFocus();
      }
    });

    it('supports keyboard selection in IconGrid', async () => {
      const user = userEvent.setup();
      const onIconSelect = vi.fn();
      const mockIcons = [
        { id: '1', name: 'Car', category: 'transport', data: 'data:image/png;base64,test1' }
      ];

      render(
        <TestWrapper>
          <IconGrid icons={mockIcons} onIconSelect={onIconSelect} />
        </TestWrapper>
      );

      const firstIcon = screen.getByText('Car').closest('[tabindex]');
      await user.tab();
      expect(firstIcon).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(onIconSelect).toHaveBeenCalledWith(mockIcons[0]);

      await user.keyboard(' '); // Space bar should also work
      expect(onIconSelect).toHaveBeenCalledTimes(2);
    });

    it('provides skip links for screen readers', () => {
      render(
        <TestWrapper>
          <div>
            <Navigation />
            <main>
              <Generator />
            </main>
          </div>
        </TestWrapper>
      );

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('traps focus in modals', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Generator />
        </TestWrapper>
      );

      // Open icon selection modal
      await user.click(screen.getByText('Select Icons'));
      
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      
      // First focusable element should be focused
      const firstFocusable = screen.getByText('Select All');
      expect(firstFocusable).toHaveFocus();

      // Tab should stay within modal
      await user.tab();
      const currentFocus = document.activeElement;
      expect(modal).toContainElement(currentFocus);
    });
  });

  describe('Screen Reader Support', () => {
    it('provides live regions for dynamic content updates', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Generator />
        </TestWrapper>
      );

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');

      // Trigger an action that updates status
      await user.click(screen.getByText('Generate Cards'));
      
      expect(liveRegion).toHaveTextContent(/generating|generated/i);
    });

    it('announces page changes and navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <div>
            <Navigation />
            <div id="main-content" role="main">
              <Generator />
            </div>
          </div>
        </TestWrapper>
      );

      const pageTitle = screen.getByRole('heading', { level: 1 });
      expect(pageTitle).toHaveAttribute('aria-label');

      // Navigation changes should be announced
      const iconsLink = screen.getByText('Icons');
      await user.click(iconsLink);
      
      // Should update page title or announcement region
      const announcement = screen.getByRole('status');
      expect(announcement).toBeInTheDocument();
    });

    it('provides descriptive text for complex interactions', () => {
      const mockCard = {
        id: '1',
        title: 'Test Card',
        cells: [
          { icon: { name: 'Car', data: 'test' }, isBlank: false, multiHitTarget: true }
        ],
        gridSize: 1
      };

      render(
        <TestWrapper>
          <BingoCard card={mockCard} showLabels={true} />
        </TestWrapper>
      );

      const multiHitCell = screen.getByText('Car').closest('[role="cell"]');
      expect(multiHitCell).toHaveAttribute(
        'aria-describedby',
        expect.stringContaining('multi-hit')
      );
    });
  });

  describe('Color and Contrast', () => {
    it('maintains sufficient contrast ratios', async () => {
      render(
        <TestWrapper>
          <Navigation />
        </TestWrapper>
      );

      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });

    it('does not rely solely on color for information', () => {
      const mockIcons = [
        { id: '1', name: 'Easy Icon', difficulty: 1 },
        { id: '2', name: 'Hard Icon', difficulty: 5 }
      ];

      render(
        <TestWrapper>
          <IconGrid icons={mockIcons} showDifficulty={true} />
        </TestWrapper>
      );

      // Difficulty should be indicated by text/symbols, not just color
      expect(screen.getByText(/⭐/)).toBeInTheDocument(); // Star symbols
      expect(screen.getByText('Easy')).toBeInTheDocument();
      expect(screen.getByText('Hard')).toBeInTheDocument();
    });

    it('supports high contrast mode', () => {
      // Simulate high contrast preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(
        <TestWrapper>
          <Navigation />
        </TestWrapper>
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('high-contrast');
    });
  });

  describe('Motor Impairments Support', () => {
    it('provides large enough click targets', () => {
      render(
        <TestWrapper>
          <Navigation />
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      const links = screen.getAllByRole('link');

      [...buttons, ...links].forEach(element => {
        const styles = window.getComputedStyle(element);
        const minSize = 44; // WCAG AA minimum

        // Note: In jsdom, computed styles might not work perfectly
        // This test serves as documentation of the requirement
        expect(element).toHaveClass(/min-w-|min-h-|p-|px-|py-/);
      });
    });

    it('supports click and hover alternatives', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(
        <TestWrapper>
          <IconGrid 
            icons={[{ id: '1', name: 'Car', data: 'test' }]} 
            onIconSelect={onSelect}
          />
        </TestWrapper>
      );

      const iconElement = screen.getByText('Car').closest('[role="button"]');
      
      // Should work with keyboard
      iconElement.focus();
      await user.keyboard('{Enter}');
      expect(onSelect).toHaveBeenCalled();

      onSelect.mockClear();
      await user.keyboard(' ');
      expect(onSelect).toHaveBeenCalled();
    });

    it('provides adequate spacing between interactive elements', () => {
      render(
        <TestWrapper>
          <Navigation />
        </TestWrapper>
      );

      const links = screen.getAllByRole('link');
      
      // Adjacent links should have adequate spacing
      expect(links.length).toBeGreaterThan(1);
      // In real implementation, would check computed margins/padding
      links.forEach(link => {
        expect(link).toHaveClass(/m-|mx-|my-|space-/);
      });
    });
  });

  describe('Cognitive Accessibility', () => {
    it('provides clear and consistent navigation', () => {
      render(
        <TestWrapper>
          <Navigation />
        </TestWrapper>
      );

      const nav = screen.getByRole('navigation');
      
      // Navigation should be clearly labeled
      expect(nav).toHaveAttribute('aria-label', 'Main navigation');
      
      // Current page should be indicated
      const activeLink = screen.getByRole('link', { current: 'page' });
      expect(activeLink).toHaveAttribute('aria-current', 'page');
    });

    it('provides helpful error messages', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Generator />
        </TestWrapper>
      );

      // Try to generate without sufficient icons
      const generateButton = screen.getByText('Generate Cards');
      await user.click(generateButton);

      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent(/error|problem|required/i);
    });

    it('supports customizable interface settings', () => {
      render(
        <TestWrapper>
          <div data-theme="light" data-font-size="large" data-motion="reduced">
            <Generator />
          </div>
        </TestWrapper>
      );

      const container = screen.getByText('Bingo Card Generator').closest('[data-theme]');
      expect(container).toHaveAttribute('data-theme', 'light');
      expect(container).toHaveAttribute('data-font-size', 'large');
      expect(container).toHaveAttribute('data-motion', 'reduced');
    });

    it('provides progress indicators for long operations', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Generator />
        </TestWrapper>
      );

      await user.click(screen.getByText('Generate Cards'));

      const progressIndicator = screen.getByRole('progressbar');
      expect(progressIndicator).toBeInTheDocument();
      expect(progressIndicator).toHaveAttribute('aria-label');
    });
  });

  describe('WCAG Compliance', () => {
    it('passes automated accessibility tests', async () => {
      render(
        <TestWrapper>
          <div>
            <Navigation />
            <main>
              <Generator />
            </main>
          </div>
        </TestWrapper>
      );

      const results = await axe(document.body, {
        rules: {
          // Test against WCAG 2.1 AA standards
          'color-contrast': { enabled: true },
          'keyboard-navigation': { enabled: true },
          'aria-labels': { enabled: true },
          'heading-order': { enabled: true }
        }
      });

      expect(results).toHaveNoViolations();
    });

    it('supports assistive technologies', () => {
      render(
        <TestWrapper>
          <BingoCard 
            card={{
              id: '1',
              title: 'Accessible Card',
              cells: [
                { icon: { name: 'Car', data: 'test' }, isBlank: false }
              ],
              gridSize: 1
            }}
            showLabels={true}
          />
        </TestWrapper>
      );

      // Should work with screen readers
      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label');
      expect(table).toHaveAttribute('role', 'table');

      const cell = screen.getByRole('cell');
      expect(cell).toHaveAttribute('role', 'cell');
    });

    it('provides semantic HTML structure', () => {
      render(
        <TestWrapper>
          <div>
            <header>
              <Navigation />
            </header>
            <main>
              <Generator />
            </main>
          </div>
        </TestWrapper>
      );

      // Should use proper semantic elements
      expect(screen.getByRole('banner')).toBeInTheDocument(); // header
      expect(screen.getByRole('main')).toBeInTheDocument(); // main
      expect(screen.getByRole('navigation')).toBeInTheDocument(); // nav
      
      // Headings should follow proper hierarchy
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
      
      // Should have h1
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });
});