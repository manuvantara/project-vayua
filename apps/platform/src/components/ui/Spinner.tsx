import styles from '@/styles/Spinner.module.css';
import { cn } from '@/utils/helpers/class-merge.helper';
import * as React from 'react';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: `#${string}`;
  size?: number;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, color = '#000', size = 20, ...props }, ref) => (
    <div
      style={
        {
          '--spinner-color': color,
          '--spinner-size': `${size}px`,
        } as React.CSSProperties
      }
      className={cn(styles.spinner_wrapper, className)}
      ref={ref}
      {...props}
    >
      <div className={styles.spinner_spinner}>
        <div className={styles.spinner_bar}></div>
        <div className={styles.spinner_bar}></div>
        <div className={styles.spinner_bar}></div>
        <div className={styles.spinner_bar}></div>
        <div className={styles.spinner_bar}></div>
        <div className={styles.spinner_bar}></div>
        <div className={styles.spinner_bar}></div>
        <div className={styles.spinner_bar}></div>
        <div className={styles.spinner_bar}></div>
        <div className={styles.spinner_bar}></div>
        <div className={styles.spinner_bar}></div>
        <div className={styles.spinner_bar}></div>
      </div>
    </div>
  ),
);
Spinner.displayName = 'Spinner';

export default Spinner;
