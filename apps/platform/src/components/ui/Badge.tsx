import { cn } from '@/utils/helpers/class-merge.helper';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

const badgeVariants = cva(
  'inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      variant: {
        default: 'bg-primary border-transparent text-primary-foreground',
        destructive:
          'bg-destructive border-transparent text-destructive-foreground',
        outline: 'text-foreground',
        secondary: 'bg-secondary border-transparent text-secondary-foreground',
        success: 'bg-success-dark border-transparent text-primary-foreground',
        warning: 'bg-warning border-transparent text-warning-foreground',
      },
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
