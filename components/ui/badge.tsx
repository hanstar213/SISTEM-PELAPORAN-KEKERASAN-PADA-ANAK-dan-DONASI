import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        success:
          "bg-emerald-50 text-emerald-700 border border-emerald-200",
        warning:
          "bg-amber-50 text-amber-700 border border-amber-200",
        danger:
          "bg-red-50 text-red-700 border border-red-200",
        info:
          "bg-sky-50 text-sky-700 border border-sky-200",
        teal:
          "bg-teal-50 text-teal-700 border border-teal-200",
        navy:
          "bg-navy-800 text-white",
        coral:
          "bg-coral-50 text-coral-700 border border-coral-200",
        outline:
          "bg-transparent border border-current",
        muted:
          "bg-warm-100 text-navy-800/60",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", {
            "bg-emerald-500": variant === "success",
            "bg-amber-500": variant === "warning",
            "bg-red-500": variant === "danger",
            "bg-sky-500": variant === "info",
            "bg-teal-500": variant === "teal",
            "bg-white": variant === "navy",
            "bg-coral-500": variant === "coral",
          })}
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
