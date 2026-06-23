import React from 'react';
import styles from './QuickAccessCard.module.css';

interface QuickAccessCardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  className?: string;
}

export const QuickAccessCard: React.FC<QuickAccessCardProps> = ({
  icon,
  title,
  description,
  onClick,
  color = 'blue',
  className = '',
}) => {
  const colorClass = styles[`card${color.charAt(0).toUpperCase() + color.slice(1)}`];

  return (
    <button
      className={`${styles.quickAccessCard} ${colorClass} ${className}`}
      onClick={onClick}
    >
      <div className={styles.iconContainer}>
        <span className={styles.icon} role="img" aria-hidden="true">
          {icon}
        </span>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
      <div className={styles.arrow} aria-hidden="true">
        →
      </div>
    </button>
  );
};
