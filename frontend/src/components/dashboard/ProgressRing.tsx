import React from 'react';
import styles from './ProgressRing.module.css';

interface ProgressRingProps {
  recipesMastered: number;
  totalRecipes: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  recipesMastered,
  totalRecipes,
  size = 200,
  strokeWidth = 16,
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalRecipes > 0 ? (recipesMastered / totalRecipes) * 100 : 0;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Determine color based on progress
  const getColor = () => {
    if (progress === 0) return '#cbd5e0'; // Gray for no progress
    if (progress < 25) return '#f56565'; // Red for just starting
    if (progress < 50) return '#ed8936'; // Orange for getting there
    if (progress < 75) return '#ecc94b'; // Yellow for halfway
    if (progress < 100) return '#48bb78'; // Green for almost done
    return '#38b2ac'; // Teal for complete!
  };

  const color = getColor();

  return (
    <div className={`${styles.progressRingContainer} ${className}`}>
      <svg
        className={styles.progressRingSvg}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          className={styles.progressRingBackground}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <circle
          className={styles.progressRingProgress}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      {/* Center text */}
      <div className={styles.progressRingText}>
        <div className={styles.progressNumber} style={{ color }}>
          {recipesMastered}
        </div>
        <div className={styles.progressDivider}>/</div>
        <div className={styles.progressTotal}>{totalRecipes}</div>
        <div className={styles.progressLabel}>recipes mastered</div>
      </div>

      {/* Percentage badge */}
      {progress > 0 && (
        <div className={styles.progressBadge} style={{ backgroundColor: color }}>
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};
