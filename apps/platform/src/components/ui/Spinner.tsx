import * as React from "react";
import { cn } from "@/utils/class-merge";
import styles from "@/styles/Spinner.module.css";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 20, ...props }, ref) => (
    <div
      className={cn(styles.spinner_wrapper, className)}
      style={{ "--spinner-size": `${size}px` } as React.CSSProperties}
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
  )
);
Spinner.displayName = "Spinner";

export default Spinner;
