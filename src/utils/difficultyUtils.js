// Utility functions for difficulty handling

export const getDifficultyLabel = (difficulty, t) => {
  switch(difficulty) {
    case 1: return t('difficultyVeryEasy');
    case 2: return t('difficultyEasy');
    case 3: return t('difficultyMedium');
    case 4: return t('difficultyHard');
    case 5: return t('difficultyVeryHard');
    default: return t('difficultyMedium');
  }
};

export const getDifficultyColorClasses = (difficulty) => {
  switch(difficulty) {
    case 1: return 'bg-green-100 text-green-800';
    case 2: return 'bg-green-200 text-green-800';
    case 3: return 'bg-yellow-100 text-yellow-800';
    case 4: return 'bg-orange-100 text-orange-800';
    case 5: return 'bg-red-100 text-red-800';
    default: return 'bg-yellow-100 text-yellow-800';
  }
};

export const getMultiHitColorClasses = (difficulty, isExcluded) => {
  if (isExcluded) {
    switch(difficulty) {
      case 1: return 'bg-red-100 text-red-700';
      case 2: return 'bg-red-200 text-red-800';
      case 3: return 'bg-red-300 text-red-800';
      case 4: return 'bg-red-400 text-red-900';
      case 5: return 'bg-red-500 text-red-100';
      default: return 'bg-red-200 text-red-800';
    }
  } else {
    switch(difficulty) {
      case 1: return 'bg-green-100 text-green-700';
      case 2: return 'bg-green-200 text-green-800';
      case 3: return 'bg-green-300 text-green-800';
      case 4: return 'bg-green-400 text-green-900';
      case 5: return 'bg-green-500 text-green-100';
      default: return 'bg-green-200 text-green-800';
    }
  }
};