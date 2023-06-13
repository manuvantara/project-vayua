import Spinner from '@/components/ui/Spinner';
import { cn } from '@/utils/helpers/class-merge.helper';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 aria-disabled:opacity-50 disabled:pointer-events-none aria-disabled:pointer-events-none ring-offset-background aria-[busy=true]:opacity-50 aria-[busy=true]:pointer-events-none',
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-10 py-2 px-4',
        lg: 'h-11 px-8 rounded-md',
        sm: 'h-8 px-3 rounded-md',
      },
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-success',
        outline:
          'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      },
    },
  },
);

export interface ButtonProps
  extends Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      'prefix' | 'suffix'
    >,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild = false,
      className,
      loading = false,
      prefix,
      size,
      suffix,
      variant,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <>
        {asChild ? (
          <Comp
            className={cn(buttonVariants({ className, size, variant }))}
            ref={ref}
            {...props}
          />
        ) : (
          <Comp
            aria-busy={loading}
            className={cn(buttonVariants({ className, size, variant }))}
            ref={ref}
            {...props}
          >
            {loading && <Spinner className="mr-2 h-4 w-4" color="#666" />}
            {prefix && !loading && <span className="mr-2">{prefix}</span>}
            {props.children}
            {suffix && <span className="ml-2">{suffix}</span>}
          </Comp>
        )}
      </>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
