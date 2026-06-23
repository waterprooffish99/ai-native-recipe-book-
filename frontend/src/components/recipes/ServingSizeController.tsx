import React from 'react';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../../i18n/config';

interface ServingSizeControllerProps {
  currentServings: number;
  onServingsChange: (servings: number) => void;
  baseServings: number;
}

export const ServingSizeController: React.FC<ServingSizeControllerProps> = ({
  currentServings,
  onServingsChange,
  baseServings,
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = isRTL(i18n.language);

  const handleDecrease = () => {
    if (currentServings > 1) {
      onServingsChange(currentServings - 1);
    }
  };

  const handleIncrease = () => {
    onServingsChange(currentServings + 1);
  };

  const handleReset = () => {
    onServingsChange(baseServings);
  };

  return (
    <div 
      className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 w-fit select-none"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="flex flex-col">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          {t('recipe.servings.label', 'Servings')}
        </span>
        <span className="text-xs text-slate-300 font-medium">
          {currentServings !== baseServings ? (
            <button 
              type="button"
              onClick={handleReset}
              className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline focus:outline-none transition-all text-[11px]"
              title={t('recipe.servings.reset_title', 'Reset to base servings')}
            >
              {t('recipe.servings.modified', 'Reset')}
            </button>
          ) : (
            t('recipe.servings.default', 'Default')
          )}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleDecrease}
          disabled={currentServings <= 1}
          className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 active:scale-95 flex items-center justify-center font-bold text-slate-200 transition-all disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Decrease serving size"
        >
          －
        </button>

        <span className="text-base font-semibold text-indigo-300 min-w-[20px] text-center">
          {currentServings}
        </span>

        <button
          type="button"
          onClick={handleIncrease}
          className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 active:scale-95 flex items-center justify-center font-bold text-slate-200 transition-all"
          aria-label="Increase serving size"
        >
          ＋
        </button>
      </div>
    </div>
  );
};

export default ServingSizeController;
