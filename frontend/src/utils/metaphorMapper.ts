/**
 * T081: Metaphor Mapper Utility
 * Maps user background to appropriate metaphors for personalized cooking experiences
 */

import { useTranslation } from 'react-i18next';

// Define types for user background
export type BackgroundType = 'software' | 'hardware' | 'cooking' | 'other';
export type BackgroundLevel = 'beginner' | 'intermediate' | 'expert';

// Define types for metaphor contexts
export type MetaphorContext = 'welcome_message' | 'recipe_explanation' | 'safety_tips';

// Define the structure for a metaphor mapping
export interface MetaphorMapping {
  backgroundType: BackgroundType;
  backgroundLevel: BackgroundLevel;
  context: MetaphorContext;
  key: string; // The key to look up in the translation files
}

/**
 * Gets the appropriate metaphor key based on user background and context
 * @param backgroundType - User's background type (software, hardware, cooking, other)
 * @param backgroundLevel - User's background level (beginner, intermediate, expert)
 * @param context - Context for the metaphor (welcome_message, recipe_explanation, safety_tips)
 * @returns The key to use for looking up the metaphor in translation files
 */
export const getMetaphorKey = (
  backgroundType: BackgroundType,
  backgroundLevel: BackgroundLevel,
  context: MetaphorContext
): string => {
  // Format: context.backgroundType_backgroundLevel
  return `${context}.${backgroundType}_${backgroundLevel}`;
};

/**
 * Gets a personalized metaphor based on user background and context
 * @param backgroundType - User's background type
 * @param backgroundLevel - User's background level
 * @param context - Context for the metaphor
 * @returns The localized metaphor string or a default message
 */
export const getPersonalizedMetaphor = (
  backgroundType: BackgroundType,
  backgroundLevel: BackgroundLevel,
  context: MetaphorContext
): string => {
  const { t } = useTranslation();
  const key = getMetaphorKey(backgroundType, backgroundLevel, context);

  // Try to get the metaphor from translation
  const metaphor = t(`metaphors.${key}`, '');

  // If no metaphor found, return a default message
  if (!metaphor || metaphor === key) {
    return getDefaultMetaphor(backgroundType, backgroundLevel, context);
  }

  return metaphor;
};

/**
 * Gets a default metaphor when translation is not available
 * @param backgroundType - User's background type
 * @param backgroundLevel - User's background level
 * @param context - Context for the metaphor
 * @returns A default metaphor string
 */
const getDefaultMetaphor = (
  backgroundType: BackgroundType,
  backgroundLevel: BackgroundLevel,
  context: MetaphorContext
): string => {
  const contextMap: Record<MetaphorContext, string> = {
    welcome_message: 'Welcome message',
    recipe_explanation: 'Recipe explanation',
    safety_tips: 'Safety tip'
  };

  return `Here's a ${contextMap[context]} based on your ${backgroundType} background at ${backgroundLevel} level.`;
};

/**
 * Gets the appropriate metaphor mapping based on user background and context
 * @param backgroundType - User's background type
 * @param backgroundLevel - User's background level
 * @param context - Context for the metaphor
 * @returns The metaphor mapping object
 */
export const getMetaphorMapping = (
  backgroundType: BackgroundType,
  backgroundLevel: BackgroundLevel,
  context: MetaphorContext
): MetaphorMapping => {
  return {
    backgroundType,
    backgroundLevel,
    context,
    key: getMetaphorKey(backgroundType, backgroundLevel, context)
  };
};

/**
 * A utility function to get a personalized welcome message
 * @param backgroundType - User's background type
 * @param backgroundLevel - User's background level
 * @returns The localized welcome message metaphor
 */
export const getPersonalizedWelcomeMessage = (
  backgroundType: BackgroundType,
  backgroundLevel: BackgroundLevel
): string => {
  return getPersonalizedMetaphor(backgroundType, backgroundLevel, 'welcome_message');
};

/**
 * A utility function to get a personalized recipe explanation
 * @param backgroundType - User's background type
 * @param backgroundLevel - User's background level
 * @returns The localized recipe explanation metaphor
 */
export const getPersonalizedRecipeExplanation = (
  backgroundType: BackgroundType,
  backgroundLevel: BackgroundLevel
): string => {
  return getPersonalizedMetaphor(backgroundType, backgroundLevel, 'recipe_explanation');
};

/**
 * A utility function to get personalized safety tips
 * @param backgroundType - User's background type
 * @param backgroundLevel - User's background level
 * @returns The localized safety tip metaphor
 */
export const getPersonalizedSafetyTips = (
  backgroundType: BackgroundType,
  backgroundLevel: BackgroundLevel
): string => {
  return getPersonalizedMetaphor(backgroundType, backgroundLevel, 'safety_tips');
};

/**
 * Validates if a background type is valid
 * @param type - Background type to validate
 * @returns True if valid, false otherwise
 */
export const isValidBackgroundType = (type: string): type is BackgroundType => {
  return ['software', 'hardware', 'cooking', 'other'].includes(type);
};

/**
 * Validates if a background level is valid
 * @param level - Background level to validate
 * @returns True if valid, false otherwise
 */
export const isValidBackgroundLevel = (level: string): level is BackgroundLevel => {
  return ['beginner', 'intermediate', 'expert'].includes(level);
};
