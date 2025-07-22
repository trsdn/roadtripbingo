import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaFolder, FaFolderOpen } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { useIconSets } from '../hooks/useIconSets';
import IconSetModal from './IconSetModal';

function IconSetManager({ onSelectSet }) {
  const { t } = useLanguage();
  const { iconSets, loading, createIconSet, updateIconSet, deleteIconSet } = useIconSets();
  const [selectedSetId, setSelectedSetId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSet, setEditingSet] = useState(null);
  const [selectorOpen, setSelectorOpen] = useState(false);

  const handleCreateSet = async (setData) => {
    try {
      await createIconSet(setData);
      setModalOpen(false);
    } catch (error) {
      console.error('Error creating icon set:', error);
    }
  };

  const handleUpdateSet = async (setData) => {
    try {
      await updateIconSet(editingSet.id, setData);
      setEditingSet(null);
    } catch (error) {
      console.error('Error updating icon set:', error);
    }
  };

  const handleDeleteSet = async (id) => {
    if (window.confirm(t('confirmDeleteIconSet'))) {
      try {
        await deleteIconSet(id);
        if (selectedSetId === id) {
          setSelectedSetId(null);
          onSelectSet?.(null);
        }
      } catch (error) {
        console.error('Error deleting icon set:', error);
      }
    }
  };

  const handleSelectSet = (setId) => {
    setSelectedSetId(setId);
    onSelectSet?.(setId);
    setSelectorOpen(false);
  };

  const selectedSet = iconSets.find(set => set.id === selectedSetId);

  return (
    <div className="space-y-4">
      {/* Icon Set Selector */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSelectorOpen(!selectorOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {selectedSet ? (
            <>
              <FaFolderOpen 
                className="w-5 h-5" 
                style={{ color: selectedSet.color }}
              />
              <span>{selectedSet.name}</span>
              <span className="text-sm text-gray-500">({selectedSet.iconCount})</span>
            </>
          ) : (
            <>
              <FaFolder className="w-5 h-5 text-gray-400" />
              <span>{t('selectIconSet')}</span>
            </>
          )}
        </button>
        
        <button
          onClick={() => setModalOpen(true)}
          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
          title={t('createIconSet')}
        >
          <FaPlus className="w-5 h-5" />
        </button>
      </div>

      {/* Icon Set Dropdown */}
      {selectorOpen && (
        <div className="absolute z-50 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-2">
            <button
              onClick={() => handleSelectSet(null)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded"
            >
              <span className="text-gray-500">{t('allIcons')}</span>
            </button>
            
            {iconSets.map(set => (
              <div
                key={set.id}
                className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded"
              >
                <button
                  onClick={() => handleSelectSet(set.id)}
                  className="flex-1 flex items-center gap-2 text-left"
                >
                  <FaFolder 
                    className="w-4 h-4 flex-shrink-0" 
                    style={{ color: set.color }}
                  />
                  <span className="truncate">{set.name}</span>
                  <span className="text-sm text-gray-500">({set.iconCount})</span>
                </button>
                
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSet(set);
                    }}
                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                  >
                    <FaEdit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSet(set.id);
                    }}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(modalOpen || editingSet) && (
        <IconSetModal
          iconSet={editingSet}
          onClose={() => {
            setModalOpen(false);
            setEditingSet(null);
          }}
          onSave={editingSet ? handleUpdateSet : handleCreateSet}
        />
      )}
    </div>
  );
}

export default IconSetManager;