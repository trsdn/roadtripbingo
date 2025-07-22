import React from 'react';
import { FaEdit, FaTrash, FaBan, FaCheck, FaTimes, FaLanguage } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { getDifficultyLabel, getDifficultyColorClasses, getMultiHitColorClasses } from '../utils/difficultyUtils';

function IconTable({ icons, onEdit, onDelete }) {
  const { t } = useLanguage();
  
  return (
    <div className="card overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Icon</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('iconName')}</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('category')}</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('difficulty')}</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('tags')}</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('multiHitMode')}</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {icons.map((icon) => (
            <tr key={icon.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">
                <img
                  src={icon.data}
                  alt={icon.name}
                  className="w-12 h-12 object-contain"
                />
              </td>
              <td className="py-3 px-4 max-w-xs">
                <div className="font-medium text-gray-900 break-words">{icon.name}</div>
                {icon.altText && (
                  <div className="text-sm text-gray-500 break-words">{icon.altText}</div>
                )}
              </td>
              <td className="py-3 px-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {icon.category || 'default'}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColorClasses(icon.difficulty)}`}>
                  {getDifficultyLabel(icon.difficulty, t)}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(icon.tags) && icon.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
              <td className="py-3 px-4">
                {icon.excludeFromMultiHit ? (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMultiHitColorClasses(icon.difficulty, true)}`}>
                    {t('no')}
                  </span>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMultiHitColorClasses(icon.difficulty, false)}`}>
                    {t('yes')}
                  </span>
                )}
              </td>
              <td className="py-3 px-4">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(icon)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                    title={t('editIcon')}
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(icon.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                    title={t('deleteIcon')}
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default IconTable;