/**
 * T113: Ingredient Checklist Component (UI Scaffold)
 * Displays interactive ingredient checkboxes with Tailwind styling
 * Note: Database persistence will be added in T116-T118 (Part 2)
 */

import React, { useState } from 'react';

interface Ingredient {
  ingredient_id: string;
  name: string;
  quantity?: number | string;
  unit?: string;
  category?: string;
}

interface IngredientChecklistProps {
  ingredients: Ingredient[];
  checkedIngredientIds?: string[];
  onIngredientToggle?: (ingredientId: string, isChecked: boolean) => void;
  scalingFactor?: number;
}

export const scaleQuantity = (quantity: number | string | undefined, factor: number): string => {
  if (!quantity) return '';
  
  const num = typeof quantity === 'number' ? quantity : parseFloat(quantity);
  if (!isNaN(num)) {
    const scaled = num * factor;
    return Number(scaled.toFixed(2)).toString();
  }

  if (typeof quantity === 'string' && quantity.includes('/')) {
    const parts = quantity.split('/');
    if (parts.length === 2) {
      const numerator = parseFloat(parts[0]);
      const denominator = parseFloat(parts[1]);
      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        const val = (numerator / denominator) * factor;
        return Number(val.toFixed(2)).toString();
      }
    }
  }

  return String(quantity);
};

export const IngredientChecklist: React.FC<IngredientChecklistProps> = ({
  ingredients,
  checkedIngredientIds,
  onIngredientToggle,
  scalingFactor = 1,
}) => {
  // Local state for UI-only implementation (Part 1)
  // Will be replaced with database sync in Part 2
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (checkedIngredientIds) {
      setCheckedIngredients(new Set(checkedIngredientIds));
    }
  }, [checkedIngredientIds]);

  const handleToggle = (ingredientId: string, isChecked: boolean) => {
    const newChecked = new Set(checkedIngredients);
    if (isChecked) {
      newChecked.add(ingredientId);
    } else {
      newChecked.delete(ingredientId);
    }
    setCheckedIngredients(newChecked);

    // Call parent handler if provided
    if (onIngredientToggle) {
      onIngredientToggle(ingredientId, isChecked);
    }
  };

  const checkedCount = checkedIngredients.size;
  const totalCount = ingredients.length;
  const progressPercentage = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-globalplate-bg-surface rounded-lg p-6 my-4">
      {/* Header with progress */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-globalplate-text-primary">
          Ingredients ({checkedCount}/{totalCount})
        </h3>
        <span className="text-globalplate-text-secondary">
          {Math.round(progressPercentage)}% prepared
        </span>
      </div>

      {/* Progress bar */}
      <div className="step-progress-bar mb-4">
        <div
          className="step-progress-fill"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Ingredient list */}
      <div className="ingredient-checklist">
        {ingredients.map((ingredient) => {
          const isChecked = checkedIngredients.has(ingredient.ingredient_id);
          
          return (
            <label
              key={ingredient.ingredient_id}
              className="ingredient-item group hover:bg-globalplate-bg-card transition-colors cursor-pointer"
            >
              <input
                type="checkbox"
                className="ingredient-checkbox"
                checked={isChecked}
                onChange={(e) => handleToggle(ingredient.ingredient_id, e.target.checked)}
              />
              <div className="flex-1">
                <span className={`ingredient-name ${isChecked ? 'checked' : ''}`}>
                  {ingredient.name}
                </span>
                {ingredient.quantity && (
                  <span className="text-globalplate-text-muted text-sm ml-2">
                    ({scaleQuantity(ingredient.quantity, scalingFactor)}{ingredient.unit ? ` ${ingredient.unit}` : ''})
                  </span>
                )}
                {ingredient.category && (
                  <span className="text-globalplate-text-muted text-xs block">
                    {ingredient.category}
                  </span>
                )}
              </div>
              {isChecked && (
                <span className="text-globalplate-success text-xl">✓</span>
              )}
            </label>
          );
        })}
      </div>

      {/* Completion message */}
      {checkedCount === totalCount && totalCount > 0 && (
        <div className="mt-4 p-4 bg-globalplate-success bg-opacity-20 rounded-lg text-center">
          <p className="text-globalplate-success font-bold text-lg">
            🎉 All ingredients prepared! Ready to cook!
          </p>
        </div>
      )}
    </div>
  );
};
