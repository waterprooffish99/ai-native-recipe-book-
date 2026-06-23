import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../../i18n/config';
import { RecipeService, RecipeSummary } from '../../services/recipeService';

export const CommandMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const { t, i18n } = useTranslation();
  const isRtl = isRTL(i18n.language);

  // Toggle the menu when pressing Cmd+K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Fetch recipe summaries to populate search index when opened
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const langCode = (i18n.language || 'en').toUpperCase();
        const list = await RecipeService.listRecipes(langCode);
        setRecipes(list);
      } catch (err) {
        console.error('Failed to load recipes in CommandMenu:', err);
      }
    };
    if (open) {
      fetchRecipes();
    }
  }, [open, i18n.language]);

  const handleSelectRecipe = (recipeId: string) => {
    setOpen(false);
    if (typeof window !== 'undefined') {
      const currentLocale = i18n.language === 'en' ? '' : `/${i18n.language}`;
      window.location.href = `${currentLocale}/recipes/${recipeId}`;
    }
  };

  const handleSelectNav = (path: string) => {
    setOpen(false);
    if (typeof window !== 'undefined') {
      const currentLocale = i18n.language === 'en' ? '' : `/${i18n.language}`;
      window.location.href = `${currentLocale}${path}`;
    }
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <Command label="Global Command Menu" className="flex flex-col h-full max-h-[450px]">
          {/* Input field */}
          <div className="flex items-center border-b border-slate-800 px-4 py-3.5 gap-2.5">
            <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Command.Input
              autoFocus
              placeholder={t('search.placeholder', 'Type a recipe or navigation command...')}
              className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={() => setOpen(false)}
              className="rounded border border-slate-800 bg-slate-950 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-400 hover:text-slate-200"
            >
              ESC
            </button>
          </div>

          <Command.List className="overflow-y-auto px-2 py-3 max-h-[350px]">
            <Command.Empty className="py-8 text-center text-sm text-slate-500">
              {t('search.empty', 'No results found.')}
            </Command.Empty>

            {/* Navigation Group */}
            <Command.Group 
              heading={<span className="px-2 pb-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t('search.navigation', 'Navigation')}</span>}
              className="space-y-1"
            >
              <Command.Item
                onSelect={() => handleSelectNav('/')}
                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white rounded-xl hover:bg-slate-800/60 cursor-pointer transition-all"
              >
                🏠 {t('nav.home', 'Home Dashboard')}
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelectNav('/recipes')}
                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white rounded-xl hover:bg-slate-800/60 cursor-pointer transition-all"
              >
                🍳 {t('nav.recipes', 'Browse Recipes')}
              </Command.Item>
            </Command.Group>

            {/* Recipes Group */}
            {recipes.length > 0 && (
              <Command.Group 
                heading={<span className="px-2 pb-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t('search.recipes', 'Recipes')}</span>}
                className="space-y-1 pt-3 mt-3 border-t border-slate-800/40"
              >
                {recipes.map((recipe) => (
                  <Command.Item
                    key={recipe.recipe_id}
                    onSelect={() => handleSelectRecipe(recipe.recipe_id)}
                    className="flex items-center justify-between px-3 py-2 text-sm text-slate-300 hover:text-white rounded-xl hover:bg-slate-800/60 cursor-pointer transition-all"
                  >
                    <span className="flex items-center gap-2">
                      🍽️ {recipe.name}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800/60">
                      {recipe.origin_country}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
};

export default CommandMenu;
