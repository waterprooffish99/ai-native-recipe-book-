import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { Recipe } from '../../services/recipeService';
import { scaleQuantity } from './IngredientChecklist';

interface RecipePdfDocumentProps {
  recipe: Recipe;
  scalingFactor: number;
  qrCodeDataUrl?: string;
}

// Helper to parse ingredients in different formats
const parseIngredients = (ingredientsInput: any): { ingredient_id: string; name: string; quantity?: string; unit?: string }[] => {
  if (!ingredientsInput) return [];
  
  let raw: any = ingredientsInput;
  if (typeof ingredientsInput === 'string') {
    try {
      raw = JSON.parse(ingredientsInput);
    } catch {
      return [{ ingredient_id: 'ing-0', name: ingredientsInput }];
    }
  }

  const isIngredientObj = (obj: any) => obj && typeof obj === 'object' && ('name' in obj);

  const list: any[] = [];
  
  const processItem = (item: any) => {
    if (typeof item === 'string') {
      list.push({ name: item });
    } else if (typeof item === 'object' && item !== null) {
      if (isIngredientObj(item)) {
        list.push({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit
        });
      } else {
        Object.entries(item).forEach(([key, val]) => {
          list.push({
            name: key,
            quantity: typeof val === 'string' || typeof val === 'number' ? String(val) : ''
          });
        });
      }
    }
  };

  if (Array.isArray(raw)) {
    raw.forEach(processItem);
  } else {
    processItem(raw);
  }

  return list.map((item, idx) => ({
    ingredient_id: `ing-${idx}`,
    name: item.name || '',
    quantity: item.quantity,
    unit: item.unit,
  }));
};

const getParsedSteps = (recipe: Recipe) => {
  const rawSteps = recipe.steps || (recipe as any).instructions || [];
  const stepsArray = Array.isArray(rawSteps)
    ? rawSteps
    : (rawSteps && typeof rawSteps === 'object' ? Object.values(rawSteps) : []);
  return stepsArray.map((step: any, idx: number) => {
    if (typeof step === 'string') {
      return {
        step_number: idx + 1,
        instruction: step,
      };
    }
    if (step && typeof step === 'object') {
      const text = step.instruction || step.step_text || step.text || '';
      return {
        ...step,
        step_number: step.step_number || idx + 1,
        instruction: typeof text === 'string' ? text : String(text || ''),
      };
    }
    return {
      step_number: idx + 1,
      instruction: String(step || ''),
    };
  });
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#6366F1',
    paddingBottom: 15,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Helvetica-Oblique',
  },
  metaContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaCol: {
    flex: 1,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 9,
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 2,
    fontFamily: 'Helvetica-Bold',
  },
  metaValue: {
    fontSize: 12,
    color: '#334155',
    fontFamily: 'Helvetica',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#4F46E5',
    marginTop: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 4,
  },
  kitchenGuard: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    padding: 10,
    marginBottom: 15,
    borderRadius: 4,
  },
  kitchenGuardTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#991B1B',
    marginBottom: 2,
  },
  kitchenGuardText: {
    fontSize: 10,
    color: '#7F1D1D',
    lineHeight: 1.4,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    paddingVertical: 2,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    backgroundColor: '#10B981',
    borderRadius: 3,
    marginRight: 8,
  },
  ingredientText: {
    fontSize: 11,
    color: '#334155',
    flex: 1,
  },
  stepContainer: {
    marginBottom: 12,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepNumber: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#4F46E5',
    backgroundColor: '#EEF2F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  stepText: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  footerBrand: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#6366F1',
    marginBottom: 2,
  },
  footerText: {
    fontSize: 8,
    color: '#94A3B8',
    lineHeight: 1.3,
  },
  qrContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 4,
    borderRadius: 4,
  },
  qrImage: {
    width: 50,
    height: 50,
  },
});

export const RecipePdfDocument: React.FC<RecipePdfDocumentProps> = ({
  recipe,
  scalingFactor,
  qrCodeDataUrl,
}) => {
  const parsedIngredients = parseIngredients(recipe.ingredients);
  const parsedSteps = getParsedSteps(recipe);
  const baseServings = recipe.servings || 4;
  const scaledServings = Math.round(baseServings * scalingFactor);

  return (
    <Document title={recipe.name} author="GlobalPlate">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{recipe.name}</Text>
          <Text style={styles.subtitle}>
            {recipe.origin_country ? `${recipe.origin_country} Recipe` : 'GlobalPlate Recipe'}
          </Text>
        </View>

        {/* Metadata */}
        <View style={styles.metaContainer}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Difficulty</Text>
            <Text style={styles.metaValue}>{recipe.difficulty || 'Medium'}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Prep Time</Text>
            <Text style={styles.metaValue}>
              {recipe.prep_time ? `${recipe.prep_time} mins` : 'N/A'}
            </Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Cook Time</Text>
            <Text style={styles.metaValue}>
              {recipe.cook_time ? `${recipe.cook_time} mins` : 'N/A'}
            </Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Servings</Text>
            <Text style={styles.metaValue}>
              {scaledServings} {scalingFactor !== 1 ? `(Scaled from ${baseServings})` : ''}
            </Text>
          </View>
        </View>

        {/* Kitchen Guard / Safety */}
        {recipe.kitchen_guard && (
          <View style={styles.kitchenGuard}>
            <Text style={styles.kitchenGuardTitle}>🛡️ KITCHEN GUARD SAFETY WARNING</Text>
            <Text style={styles.kitchenGuardText}>{recipe.kitchen_guard}</Text>
          </View>
        )}

        {/* Ingredients Section */}
        <Text style={styles.sectionTitle}>Ingredients</Text>
        <View style={{ marginBottom: 15 }}>
          {parsedIngredients.map((ingredient) => {
            const displayQty = ingredient.quantity
              ? scaleQuantity(ingredient.quantity, scalingFactor)
              : '';
            const details = displayQty
              ? `${displayQty} ${ingredient.unit || ''} ${ingredient.name}`.trim()
              : ingredient.name;

            return (
              <View key={ingredient.ingredient_id} style={styles.ingredientRow}>
                <View style={styles.bulletPoint} />
                <Text style={styles.ingredientText}>{details}</Text>
              </View>
            );
          })}
        </View>

        {/* Steps Section */}
        <Text style={styles.sectionTitle}>Instructions</Text>
        <View style={{ marginBottom: 80 }}>
          {parsedSteps.map((step) => (
            <View key={step.step_number} style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepNumber}>Step {step.step_number}</Text>
              </View>
              <Text style={styles.stepText}>{step.instruction}</Text>
            </View>
          ))}
        </View>

        {/* Footer with QR code */}
        <View style={styles.footer}>
          <View style={styles.footerTextContainer}>
            <Text style={styles.footerBrand}>GlobalPlate Cook Book</Text>
            <Text style={styles.footerText}>
              Scan the QR code to view this recipe online, scale servings, or enter full-screen Cook Mode with screen-wake safety guidelines.
            </Text>
          </View>
          {qrCodeDataUrl && (
            <View style={styles.qrContainer}>
              <Image style={styles.qrImage} src={qrCodeDataUrl} />
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};
