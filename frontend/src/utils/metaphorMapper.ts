/**
 * Metaphor Mapper Utility
 *
 * Maps software/hardware backgrounds to personalized cooking metaphors
 * to make the kitchen feel personal and relatable.
 */

interface MetaphorMapping {
  background: string;
  welcomeMessage: string;
  cookingTip: string;
}

const METAPHOR_MAPPINGS: MetaphorMapping[] = [
  {
    background: 'Developer',
    welcomeMessage: "Welcome to your kitchen, where recipes are like well-documented code!",
    cookingTip: "Think of each recipe as a function: follow the steps, and you'll get consistent, delicious results."
  },
  {
    background: 'Mechanic',
    welcomeMessage: "Welcome to your kitchen workshop, where ingredients are your tools!",
    cookingTip: "Just like tuning an engine, cooking is about precision and the right sequence of steps."
  },
  {
    background: 'Student',
    welcomeMessage: "Welcome to your cooking classroom, where every dish is a lesson!",
    cookingTip: "Learning to cook is like studying: break it into steps, practice, and master one recipe at a time."
  },
  {
    background: 'Teacher',
    welcomeMessage: "Welcome to your teaching kitchen, where you'll learn to guide others!",
    cookingTip: "Teaching cooking is like any lesson: clear instructions, patience, and hands-on practice."
  },
  {
    background: 'Healthcare',
    welcomeMessage: "Welcome to your healing kitchen, where nutrition meets flavor!",
    cookingTip: "Like patient care, cooking requires attention to detail, timing, and understanding what nourishes."
  },
  {
    background: 'Hospitality',
    welcomeMessage: "Welcome to your culinary home, where service meets creativity!",
    cookingTip: "You already know hospitality; now add cooking skills to create memorable experiences."
  },
  {
    background: 'Other',
    welcomeMessage: "Welcome to your personal kitchen, your creative space!",
    cookingTip: "Cooking is an art anyone can learn. Start simple, build confidence, and enjoy the journey."
  },
  {
    background: 'None',
    welcomeMessage: "Welcome to your kitchen, where every meal is an adventure!",
    cookingTip: "No experience needed! We'll guide you step-by-step to cooking delicious meals with confidence."
  }
];

/**
 * Get a personalized welcome message based on user's background
 *
 * @param background - User's software/hardware background
 * @returns Personalized welcome message
 */
export function getWelcomeMessage(background?: string | null): string {
  if (!background) {
    return METAPHOR_MAPPINGS.find(m => m.background === 'None')?.welcomeMessage ||
           "Welcome to your kitchen!";
  }

  const mapping = METAPHOR_MAPPINGS.find(
    m => m.background.toLowerCase() === background.toLowerCase()
  );

  return mapping?.welcomeMessage ||
         METAPHOR_MAPPINGS.find(m => m.background === 'Other')!.welcomeMessage;
}

/**
 * Get a personalized cooking tip based on user's background
 *
 * @param background - User's software/hardware background
 * @returns Personalized cooking tip
 */
export function getCookingTip(background?: string | null): string {
  if (!background) {
    return METAPHOR_MAPPINGS.find(m => m.background === 'None')?.cookingTip ||
           "Start simple and build your skills!";
  }

  const mapping = METAPHOR_MAPPINGS.find(
    m => m.background.toLowerCase() === background.toLowerCase()
  );

  return mapping?.cookingTip ||
         METAPHOR_MAPPINGS.find(m => m.background === 'Other')!.cookingTip;
}

/**
 * Get a personalized progress message based on mastery count
 *
 * @param recipesMastered - Number of recipes mastered
 * @param background - User's background (optional, for future enhancements)
 * @returns Encouraging progress message
 */
export function getProgressMessage(recipesMastered: number, background?: string | null): string {
  if (recipesMastered === 0) {
    return "Every expert was once a beginner. Start your first recipe today!";
  } else if (recipesMastered === 1) {
    return "Amazing! You've mastered your first recipe. Keep the momentum going!";
  } else if (recipesMastered < 5) {
    return `Great progress! ${recipesMastered} recipes mastered. You're building real skills!`;
  } else if (recipesMastered < 10) {
    return `Impressive! ${recipesMastered} recipes mastered. You're becoming confident in the kitchen!`;
  } else {
    return `Outstanding! ${recipesMastered} recipes mastered. You're a kitchen champion!`;
  }
}
