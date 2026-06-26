import styles from './PrimaryButton.module.css';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  showArrow?: boolean;
}

export default function PrimaryButton({
  children,
  showArrow = true,
  className = '',
  ...rest
}: PrimaryButtonProps) {
  return (
    <button className={`${styles.btn} ${className}`} {...rest}>
      <span className={styles.label}>{children}</span>
      {showArrow && (
        <svg
          className={styles.arrow}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      )}
    </button>
  );
}
