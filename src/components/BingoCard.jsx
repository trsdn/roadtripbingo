import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getTranslatedIconName } from '../utils/translationUtils';

function BingoCard({ card, settings }) {
  const { gridSize, showLabels, title } = settings;
  const { language } = useLanguage();
  
  // Map grid sizes to CSS classes (Tailwind needs explicit classes)
  const gridClasses = {
    3: 'grid-cols-3',
    4: 'grid-cols-4', 
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
    8: 'grid-cols-8'
  };
  
  return (
    <div className="card">
      <h3 className="text-xl font-bold text-center mb-4">{title}</h3>
      <div 
        className={`grid ${gridClasses[gridSize] || 'grid-cols-5'} gap-2`}
        style={{ aspectRatio: '1' }}
      >
        {card.cells.map((cell, index) => (
          <div
            key={index}
            className={`
              aspect-square border-2 border-gray-300 rounded-lg p-2
              flex flex-col items-center justify-center
              ${cell.isBlank ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'}
              ${cell.multiHitTarget ? 'ring-2 ring-blue-400' : ''}
            `}
          >
            {!cell.isBlank && cell.icon && (
              <>
                <img
                  src={cell.icon.data}
                  alt={cell.icon.name}
                  className="w-full h-full object-contain"
                />
                {showLabels && (
                  <span className="text-xs text-center mt-1 text-gray-700">
                    {getTranslatedIconName(cell.icon, language)}
                  </span>
                )}
              </>
            )}
            {cell.isBlank && (
              <span className="text-gray-400 text-sm">FREE</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BingoCard;