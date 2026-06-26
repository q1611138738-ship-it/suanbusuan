'use client';

import { useId } from 'react';
import styles from '@/components/ui/GenderSelect.module.css';

interface GenderSelectProps {
  value: string;
  onChange: (val: string) => void;
}

export function GenderSelect({ value, onChange }: GenderSelectProps) {
  const selected = value === 'female' ? 'female' : 'male';
  const uid = useId().replace(/:/g, '');
  const groupName = `gender-${uid}`;
  const maleId = `gender-male-${uid}`;
  const femaleId = `gender-female-${uid}`;

  return (
    <div className={styles.seg} data-value={selected}>
      <span className={styles.thumb} aria-hidden="true" />
      <input
        className={styles.input}
        type="radio"
        name={groupName}
        id={maleId}
        checked={selected === 'male'}
        onChange={() => onChange('male')}
      />
      <label className={styles.label} htmlFor={maleId}>男</label>
      <input
        className={styles.input}
        type="radio"
        name={groupName}
        id={femaleId}
        checked={selected === 'female'}
        onChange={() => onChange('female')}
      />
      <label className={styles.label} htmlFor={femaleId}>女</label>
    </div>
  );
}
