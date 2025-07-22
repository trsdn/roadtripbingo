import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BingoCard from '../../../src/components/BingoCard';

const MockWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('BingoCard', () => {
  const mockCard = {
    cells: [
      { isBlank: false, icon: { id: '1', name: 'Test Icon', data: 'data:image/png;base64,test' }, multiHitTarget: false },
      { isBlank: true, icon: null, multiHitTarget: false },
      { isBlank: false, icon: { id: '2', name: 'Another Icon', data: 'data:image/png;base64,test2' }, multiHitTarget: true },
    ]
  };
  
  const mockSettings = {
    gridSize: 3,
    showLabels: true,
    title: 'Test Bingo Card'
  };
  
  it('renders card title', () => {
    render(
      <MockWrapper>
        <BingoCard card={mockCard} settings={mockSettings} />
      </MockWrapper>
    );
    
    expect(screen.getByText('Test Bingo Card')).toBeInTheDocument();
  });
  
  it('renders correct number of cells', () => {
    const { container } = render(
      <MockWrapper>
        <BingoCard card={mockCard} settings={mockSettings} />
      </MockWrapper>
    );
    
    const cells = container.querySelectorAll('[class*="aspect-square"]');
    expect(cells).toHaveLength(3);
  });
  
  it('shows FREE text for blank cells', () => {
    render(
      <MockWrapper>
        <BingoCard card={mockCard} settings={mockSettings} />
      </MockWrapper>
    );
    
    expect(screen.getByText('FREE')).toBeInTheDocument();
  });
  
  it('shows icon names when labels are enabled', () => {
    render(
      <MockWrapper>
        <BingoCard card={mockCard} settings={mockSettings} />
      </MockWrapper>
    );
    
    expect(screen.getByText('Test Icon')).toBeInTheDocument();
    expect(screen.getByText('Another Icon')).toBeInTheDocument();
  });
});