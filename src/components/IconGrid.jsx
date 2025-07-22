import React from 'react';
import { FaEdit, FaTrash, FaBan } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { getDifficultyLabel } from '../utils/difficultyUtils';

function IconGrid({ icons, onEdit, onDelete }) {
  const { t } = useLanguage();
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {icons.map((icon) => (
        <div key={icon.id} className="card p-4 group relative">
          <div className="aspect-square flex items-center justify-center mb-2">
            <img
              src={icon.data}
              alt={icon.name}
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="text-center">
            <h4 className="text-sm font-medium text-gray-800 truncate">
              {icon.name}
            </h4>
            <p className="text-xs text-gray-500 mb-1">
              {t('difficulty')}: {getDifficultyLabel(icon.difficulty, t)}
            </p>
            
            {/* Category */}
            {icon.category && icon.category !== 'default' && (
              <div className="mb-1">
                <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                  {icon.category}
                </span>
              </div>
            )}
            
            {/* Tags */}
            {icon.tags && Array.isArray(icon.tags) && icon.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1 mb-1">
                {icon.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                    {tag}
                  </span>
                ))}
                {icon.tags.length > 2 && (
                  <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                    +{icon.tags.length - 2}
                  </span>
                )}
              </div>
            )}
            
            {/* Multi-hit exclusion */}
            {icon.excludeFromMultiHit && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <FaBan className="w-3 h-3 text-red-500" />
                <span className="text-xs text-red-600">{t('noMultiHit')}</span>
              </div>
            )}
          </div>
          
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <button
              onClick={() => onEdit(icon)}
              className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              title={t('editIcon')}
            >
              <FaEdit className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDelete(icon.id)}
              className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
              title={t('deleteIcon')}
            >
              <FaTrash className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default IconGrid;