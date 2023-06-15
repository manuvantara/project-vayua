'use client';

import type { HTMLAttributes } from 'react';

import { cn } from '@/utils/helpers/class-merge.helper';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as React from 'react';

type ProgressProps = React.ComponentPropsWithoutRef<
  typeof ProgressPrimitive.Root
> & {
  indicatorclassname?: HTMLAttributes<
    typeof ProgressPrimitive.Indicator
  >['className'];
};

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, max = 100, value = 0, ...props }, ref) => {
  max = max === 0 ? 100 : max;
  return (
    <ProgressPrimitive.Root
      className={cn(
        'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
        className,
      )}
      ref={ref}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          'h-full w-full flex-1 bg-primary transition-all',
          props.indicatorclassname,
        )}
        style={{
          transform: `translateX(-${100 - ((value as number) / max) * 100}%)`,
        }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
