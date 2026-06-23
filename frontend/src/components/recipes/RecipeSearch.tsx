/**
 * T057: RecipeSearch Component
 * Voice and text search component with RAG integration, mobile-friendly design and RTL support
 */

import React, { useState, useRef } from 'react';
import { RAGService, RecipeSearchResult } from '../../services/ragService';
import { RecipeService } from '../../services/recipeService';
import RecipeCard from './RecipeCard';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../../i18n/config';

interface RecipeSearchProps {
  language?: string;
  onRecipeSelect: (recipeId: string) => void;
}

const RecipeSearch: React.FC<RecipeSearchProps> = ({ language = 'EN', onRecipeSelect }) => {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<RecipeSearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const isRtl = isRTL(i18n.language);

  // Initialize speech recognition if available
  React.useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language.toLowerCase();

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        performSearch(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        setError(t('recipe.search.voiceError', 'Voice recognition error'));
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, t]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First try RAG search
      const ragResults = await RAGService.searchRecipes(searchQuery, language);

      if (ragResults.length > 0) {
        setResults(ragResults);
        setShowResults(true);
      } else {
        // Fallback to regular recipe search
        const recipes = await RecipeService.listRecipes(language);
        const filtered = recipes.filter(recipe =>
          recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.origin_country.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(recipe => ({
          recipe: recipe,
          relevance_score: 0.5,
          matched_content: recipe.name
        }));

        setResults(filtered);
        setShowResults(true);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(t('recipe.search.error', 'Search failed'));
      setResults([]);
      setShowResults(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleVoiceSearch = () => {
    if (!recognitionRef.current) {
      setError(t('recipe.search.voiceNotSupported', 'Voice search not supported in this browser'));
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setError(null);
  };

  return (
    <div className={`recipe-search-container ${isRtl ? 'rtl-recipe-search' : 'ltr-recipe-search'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Search header */}
      <div className={`mb-6 ${isRtl ? 'text-right' : 'text-left'}`}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('recipe.search.title', 'Search Recipes')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('recipe.search.subtitle', 'Find recipes by name, ingredient, or cooking style')}
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('recipe.search.placeholder', 'Search for recipes...')}
              className={`
                w-full
                px-4
                py-3
                border
                border-gray-300
                dark:border-gray-600
                rounded-lg
                focus:ring-2
                focus:ring-blue-500
                focus:border-blue-500
                dark:bg-gray-700
                dark:text-white
                ${isRtl ? 'rtl-search-input' : 'ltr-search-input'}
              `}
              dir={isRtl ? 'rtl' : 'ltr'}
              aria-label={t('recipe.search.ariaLabel', 'Search for recipes')}
            />

            {/* Clear button */}
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={t('common.clear', 'Clear')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          {/* Voice search button */}
          <button
            type="button"
            onClick={handleVoiceSearch}
            disabled={isListening}
            className={`
              px-4
              py-3
              border
              rounded-lg
              flex
              items-center
              justify-center
              transition-colors
              min-w-[44px]
              min-h-[44px]
              ${isListening
                ? 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900 dark:text-red-200'
                : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600'
              }
            `}
            aria-label={isListening ? t('recipe.search.listening', 'Listening...') : t('recipe.search.voice', 'Voice search')}
          >
            {isListening ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* Search button */}
          <button
            type="submit"
            disabled={loading}
            className={`
              px-6
              py-3
              bg-blue-600
              text-white
              border
              border-blue-600
              rounded-lg
              hover:bg-blue-700
              focus:ring-2
              focus:ring-blue-500
              focus:ring-offset-2
              transition-colors
              disabled:opacity-50
              min-w-[44px]
              min-h-[44px]
            `}
            aria-label={t('recipe.search.button', 'Search')}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t('common.searching', 'Searching...')}
              </div>
            ) : (
              t('common.search', 'Search')
            )}
          </button>
        </div>
      </form>

      {/* Error message */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Search results */}
      {showResults && (
        <div className={`results-container ${isRtl ? 'text-right' : 'text-left'}`}>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('recipe.search.resultsTitle', 'Search Results')}
          </h3>

          {results.length > 0 ? (
            <div className="recipe-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {results.map((result, index) => (
                <RecipeCard
                  key={result.recipe.recipe_id || index}
                  recipe={result.recipe}
                  onClick={() => onRecipeSelect(result.recipe.recipe_id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 max-w-md mx-auto text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('recipe.search.noResultsTitle', 'No recipes found')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('recipe.search.noResultsMessage', 'Try a different search term')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecipeSearch;