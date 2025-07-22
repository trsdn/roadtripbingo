import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../../../src/components/LoadingSpinner';
import { TestWrapper } from '../../utils/testUtils';

describe('LoadingSpinner', () => {
  it('renders loading spinner', () => {
    render(
      <TestWrapper>
        <LoadingSpinner />
      </TestWrapper>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(
      <TestWrapper>
        <LoadingSpinner message="Generating cards..." />
      </TestWrapper>
    );
    
    expect(screen.getByText('Generating cards...')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    render(
      <TestWrapper>
        <LoadingSpinner />
      </TestWrapper>
    );
    
    const spinnerDiv = screen.getByText('Loading...').closest('div');
    expect(spinnerDiv).toBeInTheDocument();
  });
});