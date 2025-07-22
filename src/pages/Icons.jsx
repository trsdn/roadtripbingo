import React, { useState } from 'react';
import { FaPlus, FaUpload, FaImages, FaTh, FaList, FaFolderOpen } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { useIcons } from '../hooks/useIcons';
import { useIconSets } from '../hooks/useIconSets';
import IconGrid from '../components/IconGrid';
import IconTable from '../components/IconTable';
import IconUploadModal from '../components/IconUploadModal';
import BatchIconUploadModal from '../components/BatchIconUploadModal';
import IconEditModal from '../components/IconEditModal';
import IconSearch from '../components/IconSearch';
import IconSetManager from '../components/IconSetManager';

function Icons() {
  const { t } = useLanguage();
  const { icons, loading, uploadIcon, updateIcon, deleteIcon } = useIcons();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [batchUploadModalOpen, setBatchUploadModalOpen] = useState(false);
  const [editingIcon, setEditingIcon] = useState(null);
  const [filteredIcons, setFilteredIcons] = useState(icons);
  const [viewMode, setViewMode] = useState('table'); // 'grid' or 'table' - default to table to show all features
  const [selectedIconSetId, setSelectedIconSetId] = useState(null);
  const [iconSetModalOpen, setIconSetModalOpen] = useState(false);

  // Update filtered icons when main icons change
  React.useEffect(() => {
    setFilteredIcons(icons);
  }, [icons]);
  
  const handleUpload = async (iconData) => {
    try {
      await uploadIcon(iconData);
      setUploadModalOpen(false);
    } catch (error) {
      console.error('Error uploading icon:', error);
    }
  };

  const handleBatchUpload = async (iconData) => {
    try {
      await uploadIcon(iconData);
    } catch (error) {
      console.error('Error uploading icon:', error);
      throw error; // Re-throw to let BatchUploadModal handle the error display
    }
  };
  
  const handleEdit = async (iconData) => {
    try {
      await updateIcon(editingIcon.id, iconData);
      setEditingIcon(null);
    } catch (error) {
      console.error('Error updating icon:', error);
    }
  };
  
  const handleDelete = async (iconId) => {
    if (window.confirm(t('confirmDelete'))) {
      try {
        await deleteIcon(iconId);
      } catch (error) {
        console.error('Error deleting icon:', error);
      }
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">{t('navIconManager')}</h2>
          <IconSetManager onSelectSet={setSelectedIconSetId} />
        </div>
        <div className="flex gap-2">
          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 flex items-center gap-2 text-sm ${
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              title={t('gridView')}
            >
              <FaTh className="w-4 h-4" />
              <span className="hidden sm:inline">{t('gridView')}</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 flex items-center gap-2 text-sm border-l border-gray-300 ${
                viewMode === 'table' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              title={t('tableView')}
            >
              <FaList className="w-4 h-4" />
              <span className="hidden sm:inline">{t('tableView')}</span>
            </button>
          </div>
          
          <button
            onClick={() => setUploadModalOpen(true)}
            className="btn-secondary"
          >
            <FaUpload />
            {t('uploadIcon')}
          </button>
          <button
            onClick={() => setBatchUploadModalOpen(true)}
            className="btn-primary"
          >
            <FaImages />
            Batch Upload
          </button>
        </div>
      </div>
      
      {/* Search and Filter */}
      {!loading && icons.length > 0 && (
        <IconSearch 
          icons={icons} 
          onFilteredIcons={setFilteredIcons}
          className="mb-6"
        />
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : icons.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">{t('noIcons')}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="btn-secondary"
            >
              <FaPlus />
              {t('uploadIcon')}
            </button>
            <button
              onClick={() => setBatchUploadModalOpen(true)}
              className="btn-primary"
            >
              <FaImages />
              Batch Upload
            </button>
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <IconGrid
              icons={filteredIcons}
              onEdit={setEditingIcon}
              onDelete={handleDelete}
            />
          ) : (
            <IconTable
              icons={filteredIcons}
              onEdit={setEditingIcon}
              onDelete={handleDelete}
            />
          )}
        </>
      )}
      
      {uploadModalOpen && (
        <IconUploadModal
          onClose={() => setUploadModalOpen(false)}
          onUpload={handleUpload}
        />
      )}

      {batchUploadModalOpen && (
        <BatchIconUploadModal
          onClose={() => setBatchUploadModalOpen(false)}
          onUpload={handleBatchUpload}
        />
      )}
      
      {editingIcon && (
        <IconEditModal
          icon={editingIcon}
          onClose={() => setEditingIcon(null)}
          onSave={handleEdit}
        />
      )}
    </div>
  );
}

export default Icons;