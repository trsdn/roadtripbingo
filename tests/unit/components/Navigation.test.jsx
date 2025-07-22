import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Navigation from '../../../src/components/Navigation';
import { TestWrapper } from '../../utils/testUtils';

describe('Navigation', () => {
  it('renders navigation links', () => {
    render(
      <TestWrapper>
        <Navigation />
      </TestWrapper>
    );
    
    expect(screen.getByText('Generator')).toBeInTheDocument();
    expect(screen.getByText('Icons')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Backup')).toBeInTheDocument();
  });

  it('highlights active navigation link', () => {
    render(
      <TestWrapper>
        <Navigation />
      </TestWrapper>
    );
    
    const generatorLink = screen.getByText('Generator').closest('a');
    expect(generatorLink).toHaveClass('active');
  });
});