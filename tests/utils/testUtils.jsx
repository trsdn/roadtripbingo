import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

// Create a mock LanguageContext
const LanguageContext = React.createContext();

// Mock translations
const mockTranslations = {
  en: {
    'Generator': 'Generator',
    'Icons': 'Icons', 
    'Settings': 'Settings',
    'Backup': 'Backup',
    'No icons available': 'No icons available',
    'Loading...': 'Loading...',
    'Something went wrong': 'Something went wrong',
    'Reload Page': 'Reload Page',
    'Try Again': 'Try Again'
  }
};

const mockLanguageContext = {
  currentLanguage: 'en',
  setLanguage: vi.fn(),
  translate: (key) => mockTranslations.en[key] || key,
  translations: mockTranslations
};

// Mock the useLanguage hook
vi.mock('../../src/context/LanguageContext', () => ({
  LanguageContext: React.createContext(),
  useLanguage: () => mockLanguageContext
}));

export const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <LanguageContext.Provider value={mockLanguageContext}>
      {children}
    </LanguageContext.Provider>
  </BrowserRouter>
);

export const renderWithContext = (component) => {
  return render(component, { wrapper: TestWrapper });
};

export { mockLanguageContext };