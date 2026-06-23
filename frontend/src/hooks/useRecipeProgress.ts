import { useState, useEffect, useCallback } from 'react';
import { RecipeService, UserRecipeProgress } from '../services/recipeService';

export function useRecipeProgress(recipeId: string, isAuthenticated: boolean) {
  const [progress, setProgress] = useState<UserRecipeProgress | null>(() => {
    if (typeof window !== 'undefined' && recipeId) {
      const cached = localStorage.getItem(`recipe_progress_${recipeId}`);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {}
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch progress from API
  const fetchProgress = useCallback(async () => {
    if (!recipeId || !isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await RecipeService.getRecipeProgress(recipeId);
      setProgress(data);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`recipe_progress_${recipeId}`, JSON.stringify(data));
      }
    } catch (err: any) {
      // If offline, load from localStorage
      if (typeof window !== 'undefined' && !navigator.onLine) {
        const cached = localStorage.getItem(`recipe_progress_${recipeId}`);
        if (cached) {
          try {
            setProgress(JSON.parse(cached));
            return;
          } catch (e) {}
        }
      }
      // 404 means no progress exists yet, which is not an error
      if (err.message && err.message.includes('404')) {
        setProgress(null);
      } else {
        setError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [recipeId, isAuthenticated]);

  // Load progress initially and setup background sync polling
  useEffect(() => {
    fetchProgress();

    // Background sync polling every 10 seconds (only if online)
    const interval = setInterval(() => {
      if (recipeId && isAuthenticated && !isLoading && typeof window !== 'undefined' && navigator.onLine) {
        RecipeService.getRecipeProgress(recipeId)
          .then((data) => {
            setProgress(data);
            localStorage.setItem(`recipe_progress_${recipeId}`, JSON.stringify(data));
          })
          .catch((err) => console.warn('Background sync failed:', err));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [recipeId, isAuthenticated, fetchProgress]);

  // Sync pending offline changes when connection is restored
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncOfflineProgress = async () => {
      if (!recipeId || !isAuthenticated || !navigator.onLine) return;

      const isPending = localStorage.getItem(`recipe_progress_pending_${recipeId}`) === 'true';
      if (!isPending) return;

      console.log('📶 Connection restored. Syncing offline progress for recipe:', recipeId);
      
      const cached = localStorage.getItem(`recipe_progress_${recipeId}`);
      if (!cached) return;

      try {
        const localData = JSON.parse(cached) as UserRecipeProgress;

        // 1. Sync ingredient checkboxes
        for (const cb of localData.ingredient_checkboxes) {
          await RecipeService.toggleIngredientCheckbox(recipeId, cb.ingredient_id, cb.is_checked);
        }

        // 2. Sync progress and cook mode
        const data = await RecipeService.updateRecipeProgress(
          recipeId,
          localData.current_step,
          localData.step_progress.find(s => s.step_number === localData.current_step)?.status || 'started',
          localData.cook_mode_active
        );

        setProgress(data);
        localStorage.setItem(`recipe_progress_${recipeId}`, JSON.stringify(data));
        localStorage.removeItem(`recipe_progress_pending_${recipeId}`);
        console.log('✅ Offline progress synced successfully.');
      } catch (err) {
        console.error('❌ Failed to sync offline progress:', err);
      }
    };

    window.addEventListener('online', syncOfflineProgress);
    return () => window.removeEventListener('online', syncOfflineProgress);
  }, [recipeId, isAuthenticated]);

  // Update step progress (with optimistic updates)
  const updateProgress = useCallback(async (currentStep: number, stepStatus: string, cookModeActive: boolean = false) => {
    if (!recipeId || !isAuthenticated) return;

    // Optimistic Update
    setProgress((prev) => {
      let next: UserRecipeProgress;
      if (!prev) {
        next = {
          user_id: '',
          recipe_id: recipeId,
          current_step: currentStep,
          total_steps: 5,
          progress_percentage: stepStatus === 'completed' ? 20.0 : 0.0,
          ingredient_checkboxes: [],
          step_progress: [{
            step_id: '',
            step_number: currentStep,
            status: stepStatus,
          }],
          cook_mode_active: cookModeActive,
          last_synced_at: new Date().toISOString(),
        };
      } else {
        const newStepProgress = prev.step_progress.map(s =>
          s.step_number === currentStep ? { ...s, status: stepStatus } : s
        );
        const completedCount = newStepProgress.filter(s => s.status === 'completed').length;

        next = {
          ...prev,
          current_step: currentStep,
          cook_mode_active: cookModeActive,
          step_progress: newStepProgress,
          progress_percentage: prev.total_steps > 0 ? (completedCount / prev.total_steps) * 100.0 : 0.0,
          last_synced_at: new Date().toISOString(),
        };
      }
      localStorage.setItem(`recipe_progress_${recipeId}`, JSON.stringify(next));
      return next;
    });

    try {
      const data = await RecipeService.updateRecipeProgress(recipeId, currentStep, stepStatus, cookModeActive);
      setProgress(data);
      localStorage.setItem(`recipe_progress_${recipeId}`, JSON.stringify(data));
      localStorage.removeItem(`recipe_progress_pending_${recipeId}`);
    } catch (err: any) {
      if (typeof window !== 'undefined' && !navigator.onLine) {
        console.warn('Offline: Update progress queued for sync.');
        localStorage.setItem(`recipe_progress_pending_${recipeId}`, 'true');
        return;
      }
      setError(err);
      fetchProgress();
    }
  }, [recipeId, isAuthenticated, fetchProgress]);

  // Toggle ingredient checkbox (with optimistic updates)
  const toggleIngredient = useCallback(async (ingredientId: string, isChecked: boolean) => {
    if (!recipeId || !isAuthenticated) return;

    // Optimistic Update
    setProgress((prev) => {
      if (!prev) return null;

      const existingIdx = prev.ingredient_checkboxes.findIndex(cb => cb.ingredient_id === ingredientId);
      let newCheckboxes = [...prev.ingredient_checkboxes];

      if (existingIdx > -1) {
        newCheckboxes[existingIdx] = {
          ...newCheckboxes[existingIdx],
          is_checked: isChecked,
          checked_at: isChecked ? new Date().toISOString() : undefined,
        };
      } else {
        newCheckboxes.push({
          ingredient_id: ingredientId,
          is_checked: isChecked,
          checked_at: isChecked ? new Date().toISOString() : undefined,
        });
      }

      const next = {
        ...prev,
        ingredient_checkboxes: newCheckboxes,
        last_synced_at: new Date().toISOString(),
      };
      localStorage.setItem(`recipe_progress_${recipeId}`, JSON.stringify(next));
      return next;
    });

    try {
      await RecipeService.toggleIngredientCheckbox(recipeId, ingredientId, isChecked);
    } catch (err: any) {
      if (typeof window !== 'undefined' && !navigator.onLine) {
        console.warn('Offline: Toggle ingredient checkbox queued for sync.');
        localStorage.setItem(`recipe_progress_pending_${recipeId}`, 'true');
        return;
      }
      setError(err);
      fetchProgress();
    }
  }, [recipeId, isAuthenticated, fetchProgress]);

  // Toggle cook mode
  const toggleCookMode = useCallback(async () => {
    if (!recipeId || !isAuthenticated) return;

    setProgress((prev) => {
      if (!prev) return null;
      const next = {
        ...prev,
        cook_mode_active: !prev.cook_mode_active,
        last_synced_at: new Date().toISOString(),
      };
      localStorage.setItem(`recipe_progress_${recipeId}`, JSON.stringify(next));
      return next;
    });

    try {
      const state = await RecipeService.toggleCookMode(recipeId);
      setProgress((prev) => {
        if (!prev) return null;
        const next = {
          ...prev,
          cook_mode_active: state.active,
          current_step: state.current_step,
        };
        localStorage.setItem(`recipe_progress_${recipeId}`, JSON.stringify(next));
        return next;
      });
      localStorage.removeItem(`recipe_progress_pending_${recipeId}`);
    } catch (err: any) {
      if (typeof window !== 'undefined' && !navigator.onLine) {
        console.warn('Offline: Toggle cook mode queued for sync.');
        localStorage.setItem(`recipe_progress_pending_${recipeId}`, 'true');
        return;
      }
      setError(err);
      fetchProgress();
    }
  }, [recipeId, isAuthenticated, fetchProgress]);

  const totalSteps = progress?.total_steps || 0;
  const currentStep = progress?.current_step || 0;
  const isCompleted = totalSteps > 0 ? (currentStep >= totalSteps) : false;

  return {
    progress,
    isLoading,
    error,
    updateProgress,
    toggleIngredient,
    toggleCookMode,
    refetch: fetchProgress,
    isCompleted,
  };
}
