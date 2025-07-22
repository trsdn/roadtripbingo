import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IconGrid from '../../../src/components/IconGrid';
import { TestWrapper } from '../../utils/testUtils';

const mockIcons = [
  {
    id: '1',
    name: 'Car',
    data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    category: 'transport',
    difficulty: 3
  },
  {
    id: '2',
    name: 'Tree',
    data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    category: 'nature',
    difficulty: 2
  }
];

describe('IconGrid', () => {
  it('renders icons in grid layout', () => {
    render(
      <TestWrapper>
        <IconGrid icons={mockIcons} />
      </TestWrapper>
    );
    
    expect(screen.getByText('Car')).toBeInTheDocument();
    expect(screen.getByText('Tree')).toBeInTheDocument();
  });

  it('handles empty icon list', () => {
    render(
      <TestWrapper>
        <IconGrid icons={[]} />
      </TestWrapper>
    );
    
    expect(screen.getByText('No icons available')).toBeInTheDocument();
  });

  it('calls onIconSelect when icon is clicked', async () => {
    const user = userEvent.setup();
    const onIconSelect = vi.fn();
    
    render(
      <TestWrapper>
        <IconGrid icons={mockIcons} onIconSelect={onIconSelect} />
      </TestWrapper>
    );
    
    await user.click(screen.getByText('Car'));
    
    expect(onIconSelect).toHaveBeenCalledWith(mockIcons[0]);
  });

  it('shows selection state for selected icons', () => {
    render(
      <TestWrapper>
        <IconGrid icons={mockIcons} selectedIcons={['1']} />
      </TestWrapper>
    );
    
    const carIcon = screen.getByText('Car').closest('.icon-item');
    expect(carIcon).toHaveClass('selected');
  });

  it('filters icons by search term', () => {
    render(
      <TestWrapper>
        <IconGrid icons={mockIcons} searchTerm="car" />
      </TestWrapper>
    );
    
    expect(screen.getByText('Car')).toBeInTheDocument();
    expect(screen.queryByText('Tree')).not.toBeInTheDocument();
  });
});