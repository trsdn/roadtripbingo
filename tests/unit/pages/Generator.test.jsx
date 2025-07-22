import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Generator from '../../../src/pages/Generator';

// Mock the hooks
vi.mock('../../../src/hooks/useIcons', () => ({
  default: () => ({
    icons: [
      { id: '1', name: 'Car', category: 'transport' },
      { id: '2', name: 'Tree', category: 'nature' }
    ],
    loading: false,
    error: null
  })
}));

vi.mock('../../../src/hooks/useSettings', () => ({
  default: () => ({
    settings: { gridSize: '5', language: 'en' },
    updateSetting: vi.fn(),
    getSetting: (key, defaultValue) => defaultValue
  })
}));

const GeneratorWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Generator', () => {
  it('renders generator form', () => {
    render(
      <GeneratorWrapper>
        <Generator />
      </GeneratorWrapper>
    );
    
    expect(screen.getByText('Bingo Card Generator')).toBeInTheDocument();
    expect(screen.getByLabelText(/Grid Size/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Card Title/)).toBeInTheDocument();
    expect(screen.getByText('Generate Cards')).toBeInTheDocument();
  });

  it('updates grid size when changed', () => {
    render(
      <GeneratorWrapper>
        <Generator />
      </GeneratorWrapper>
    );
    
    const gridSizeSelect = screen.getByLabelText(/Grid Size/);
    fireEvent.change(gridSizeSelect, { target: { value: '4' } });
    
    expect(gridSizeSelect.value).toBe('4');
  });

  it('shows loading state when generating cards', () => {
    render(
      <GeneratorWrapper>
        <Generator />
      </GeneratorWrapper>
    );
    
    const generateButton = screen.getByText('Generate Cards');
    fireEvent.click(generateButton);
    
    // Should show loading state
    expect(screen.getByText(/Generating/)).toBeInTheDocument();
  });

  it('disables generate button when no icons available', () => {
    vi.mocked(useIcons).mockReturnValue({
      icons: [],
      loading: false,
      error: null
    });

    render(
      <GeneratorWrapper>
        <Generator />
      </GeneratorWrapper>
    );
    
    const generateButton = screen.getByText('Generate Cards');
    expect(generateButton).toBeDisabled();
  });
});