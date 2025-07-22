import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Backup from '../../../src/pages/Backup';
import { TestWrapper } from '../../utils/testUtils';

// Mock the backup service
const mockBackupService = {
  createBackup: vi.fn(),
  restoreBackup: vi.fn(),
  getBackupHistory: vi.fn(),
  deleteBackup: vi.fn(),
  validateBackup: vi.fn(),
  getStorageStats: vi.fn()
};

vi.mock('../../../src/services/backupService', () => ({
  default: mockBackupService
}));

const mockBackupHistory = [
  {
    id: '1',
    name: 'backup-2024-01-15.json',
    date: '2024-01-15T10:30:00Z',
    size: 1024576,
    iconCount: 150,
    settingsCount: 12
  },
  {
    id: '2',
    name: 'backup-2024-01-10.json',
    date: '2024-01-10T14:20:00Z',
    size: 512288,
    iconCount: 75,
    settingsCount: 10
  }
];

const mockStorageStats = {
  totalIcons: 150,
  totalSize: 5242880,
  databaseSize: 3145728,
  backupSize: 2097152,
  lastBackup: '2024-01-15T10:30:00Z'
};

describe('Backup Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBackupService.getBackupHistory.mockResolvedValue(mockBackupHistory);
    mockBackupService.getStorageStats.mockResolvedValue(mockStorageStats);
  });

  describe('Initial Render', () => {
    it('renders backup management interface', async () => {
      render(
        <TestWrapper>
          <Backup />
        </TestWrapper>
      );
      
      expect(screen.getByText('Data Backup & Restore')).toBeInTheDocument();
      expect(screen.getByText('Create Backup')).toBeInTheDocument();
      expect(screen.getByText('Restore from File')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('Backup History')).toBeInTheDocument();
      });
    });

    it('displays storage statistics', async () => {
      render(
        <TestWrapper>
          <Backup />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('150 icons')).toBeInTheDocument();
        expect(screen.getByText('5.0 MB total')).toBeInTheDocument();
      });
    });

    it('shows backup history', async () => {
      render(
        <TestWrapper>
          <Backup />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('backup-2024-01-15.json')).toBeInTheDocument();
        expect(screen.getByText('backup-2024-01-10.json')).toBeInTheDocument();
      });
    });
  });

  describe('Create Backup', () => {
    it('creates a new backup successfully', async () => {
      const user = userEvent.setup();
      const mockBackupData = {
        id: '3',
        name: 'backup-2024-01-16.json',
        url: 'blob:test-url'
      };
      
      mockBackupService.createBackup.mockResolvedValue(mockBackupData);
      
      render(
        <TestWrapper>
          <Backup />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Create Backup'));
      
      expect(screen.getByText('Creating backup...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(mockBackupService.createBackup).toHaveBeenCalled();
        expect(screen.getByText('Backup created successfully')).toBeInTheDocument();
      });
    });

    it('handles backup creation errors', async () => {
      const user = userEvent.setup();
      const error = new Error('Failed to create backup');
      
      mockBackupService.createBackup.mockRejectedValue(error);
      
      render(
        <TestWrapper>
          <Backup />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Create Backup'));
      
      await waitFor(() => {
        expect(screen.getByText('Failed to create backup')).toBeInTheDocument();
      });
    });

    it('allows custom backup naming', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Backup />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Advanced Options'));
      
      const nameInput = screen.getByLabelText('Backup Name');
      await user.clear(nameInput);
      await user.type(nameInput, 'my-custom-backup');
      
      await user.click(screen.getByText('Create Backup'));
      
      expect(mockBackupService.createBackup).toHaveBeenCalledWith({
        name: 'my-custom-backup',
        includeSettings: true,
        includeIcons: true
      });
    });

    it('allows selective backup options', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Backup />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Advanced Options'));
      
      const settingsCheckbox = screen.getByLabelText('Include Settings');
      const iconsCheckbox = screen.getByLabelText('Include Icons');
      
      await user.click(settingsCheckbox); // Uncheck settings
      
      await user.click(screen.getByText('Create Backup'));
      
      expect(mockBackupService.createBackup).toHaveBeenCalledWith({
        name: expect.any(String),
        includeSettings: false,
        includeIcons: true
      });
    });
  });

  describe('Restore Backup', () => {
    it('restores from uploaded file', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['{"icons":[],"settings":{}}'], 'backup.json', {
        type: 'application/json'
      });
      
      mockBackupService.validateBackup.mockResolvedValue(true);
      mockBackupService.restoreBackup.mockResolvedValue({ success: true });
      
      render(
        <TestWrapper>
          <Backup />
        </TestWrapper>
      );
      
      const fileInput = screen.getByLabelText('Choose backup file');
      await user.upload(fileInput, mockFile);
      
      await waitFor(() => {
        expect(screen.getByText('Backup file loaded successfully')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Restore Backup'));
      
      await waitFor(() => {
        expect(mockBackupService.restoreBackup).toHaveBeenCalledWith(mockFile);
        expect(screen.getByText('Backup restored successfully')).toBeInTheDocument();
      });
    });

    it('validates backup file format', async () => {
      const user = userEvent.setup();
      const invalidFile = new File(['invalid json'], 'invalid.txt', {
        type: 'text/plain'
      });
      
      mockBackupService.validateBackup.mockRejectedValue(new Error('Invalid backup format'));
      
      render(
        <TestWrapper>
          <Backup />
        </TestWrapper>
      );
      
      const fileInput = screen.getByLabelText('Choose backup file');
      await user.upload(fileInput, invalidFile);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid backup file format')).toBeInTheDocument();
      });
    });

    it('shows confirmation dialog for restore', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['{"icons":[],"settings":{}}'], 'backup.json', {
        type: 'application/json'
      });
      
      mockBackupService.validateBackup.mockResolvedValue(true);
      
      render(
        <TestWrapper>
          <Backup />
        </TestWrapper>
      );
      
      const fileInput = screen.getByLabelText('Choose backup file');
      await user.upload(fileInput, mockFile);
      
      await waitFor(() => {
        expect(screen.getByText('Restore Backup')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Restore Backup'));
      
      expect(screen.getByText('Restore from backup?')).toBeInTheDocument();
      expect(screen.getByText('This will replace all current data')).toBeInTheDocument();
    });

    it('allows canceling restore operation', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['{"icons":[],"settings":{}}'], 'backup.json', {
        type: 'application/json'
      });
      
      mockBackupService.validateBackup.mockResolvedValue(true);
      
      render(
        <TestWrapper>
          <Backup />
        </TestWrapper>
      );
      
      const fileInput = screen.getByLabelText('Choose backup file');
      await user.upload(fileInput, mockFile);
      
      await waitFor(() => {
        expect(screen.getByText('Restore Backup')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Restore Backup'));
      await user.click(screen.getByText('Cancel'));
      
      expect(mockBackupService.restoreBackup).not.toHaveBeenCalled();
    });
  });

  describe('Backup History Management', () => {
    it('downloads previous backup', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Backup />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('backup-2024-01-15.json')).toBeInTheDocument();
      });
      
      const downloadButtons = screen.getAllByTitle('Download backup');
      await user.click(downloadButtons[0]);
      
      expect(mockBackupService.createBackup).toHaveBeenCalledWith({ id: '1' });
    });

    it('deletes backup from history', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Backup />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('backup-2024-01-15.json')).toBeInTheDocument();
      });
      
      const deleteButtons = screen.getAllByTitle('Delete backup');
      await user.click(deleteButtons[0]);
      
      // Confirm deletion
      await user.click(screen.getByText('Delete'));
      
      expect(mockBackupService.deleteBackup).toHaveBeenCalledWith('1');
    });

    it('shows backup details in expandable format', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Backup />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('backup-2024-01-15.json')).toBeInTheDocument();
      });
      
      const expandButton = screen.getAllByTitle('Show details')[0];
      await user.click(expandButton);
      
      expect(screen.getByText('150 icons')).toBeInTheDocument();
      expect(screen.getByText('12 settings')).toBeInTheDocument();
      expect(screen.getByText('1.0 MB')).toBeInTheDocument();
    });
  });

  describe('Storage Management', () => {
    it('displays storage usage breakdown', async () => {
      render(
        <TestWrapper>
          <Backup />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Storage Usage')).toBeInTheDocument();
        expect(screen.getByText('Database: 3.0 MB')).toBeInTheDocument();
        expect(screen.getByText('Backups: 2.0 MB')).toBeInTheDocument();
      });
    });

    it('offers storage cleanup options', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Backup />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Clean Up Storage')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Clean Up Storage'));
      
      expect(screen.getByText('Delete old backups')).toBeInTheDocument();
      expect(screen.getByText('Optimize database')).toBeInTheDocument();
    });
  });

  describe('Automatic Backup', () => {
    it('configures automatic backup settings', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Backup />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Auto Backup Settings'));
      
      const enableToggle = screen.getByLabelText('Enable automatic backups');
      const frequencySelect = screen.getByLabelText('Backup frequency');
      
      await user.click(enableToggle);
      await user.selectOptions(frequencySelect, 'weekly');
      
      expect(screen.getByText('Auto backup enabled')).toBeInTheDocument();
    });

    it('shows next scheduled backup time', async () => {
      render(
        <TestWrapper>
          <Backup />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/Next backup:/)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles network errors gracefully', async () => {
      const user = userEvent.setup();
      mockBackupService.createBackup.mockRejectedValue(new Error('Network error'));
      
      render(
        <TestWrapper>
          <Backup />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Create Backup'));
      
      await waitFor(() => {
        expect(screen.getByText('Network error occurred')).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    it('retries failed operations', async () => {
      const user = userEvent.setup();
      mockBackupService.createBackup
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ id: '3', name: 'backup.json', url: 'blob:test' });
      
      render(
        <TestWrapper>
          <Backup />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Create Backup'));
      
      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Retry'));
      
      await waitFor(() => {
        expect(screen.getByText('Backup created successfully')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels for all actions', async () => {
      render(
        <TestWrapper>
          <Backup />
        </TestWrapper>
      );
      
      expect(screen.getByLabelText('Choose backup file')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Backup' })).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Backup />
        </TestWrapper>
      );
      
      await user.tab();
      expect(screen.getByText('Create Backup')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByLabelText('Choose backup file')).toHaveFocus();
    });

    it('announces status changes to screen readers', async () => {
      const user = userEvent.setup();
      mockBackupService.createBackup.mockResolvedValue({ id: '3', name: 'test.json', url: 'blob:test' });
      
      render(
        <TestWrapper>
          <Backup />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Create Backup'));
      
      await waitFor(() => {
        const statusRegion = screen.getByRole('status');
        expect(statusRegion).toHaveTextContent('Backup created successfully');
      });
    });
  });
});