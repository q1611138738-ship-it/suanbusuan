'use client';

import styles from './GenderSelect.module.css';

interface GenderSelectProps {
  value: 'male' | 'female';
  onChange: (value: 'male' | 'female') => void;
}

export default function GenderSelect({ value, onChange }: GenderSelectProps) {
  return (
    <div className={styles.seg} data-value={value}>
      <span className={styles.thumb} aria-hidden="true" />
      <input
        className={styles.input}
        type="radio"
        name="gender"
        id="gender-male"
        checked={value === 'male'}
        onChange={() => onChange('male')}
      />
      <label className={styles.label} htmlFor="gender-male">男</label>
      <input
        className={styles.input}
        type="radio"
        name="gender"
        id="gender-female"
        checked={value === 'female'}
        onChange={() => onChange('female')}
      />
      <label className={styles.label} htmlFor="gender-female">女</label>
    </div>
  );
}
