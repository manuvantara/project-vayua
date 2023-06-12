"use client";

import * as React from "react";
import { HTMLAttributes } from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/utils/helpers/class-merge.helper";

type ProgressProps = React.ComponentPropsWithoutRef<
  typeof ProgressPrimitive.Root
> & {
  indicatorClassName?: HTMLAttributes<
    typeof ProgressPrimitive.Indicator
  >["className"];
};

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, max = 100, ...props }, ref) => {
  max = max === 0 ? 100 : max;
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 bg-primary transition-all",
          props.indicatorClassName
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
