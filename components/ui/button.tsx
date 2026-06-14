import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        solid:
          "bg-navy-800 text-white shadow-soft hover:bg-navy-700 hover:shadow-soft-lg",
        accent:
          "bg-teal-500 text-white shadow-glow hover:bg-teal-600 hover:shadow-glow-lg",
        coral:
          "bg-coral-500 text-white shadow-glow-coral hover:bg-coral-600",
        outline:
          "border-2 border-navy-800 text-navy-800 bg-transparent hover:bg-navy-800 hover:text-white",
        "outline-teal":
          "border-2 border-teal-500 text-teal-500 bg-transparent hover:bg-teal-500 hover:text-white",
        ghost:
          "text-navy-800 hover:bg-navy-800/5",
        "ghost-light":
          "text-white/80 hover:text-white hover:bg-white/10",
        link:
          "text-teal-500 underline-offset-4 hover:underline p-0 h-auto",
        destructive:
          "bg-red-500 text-white hover:bg-red-600",
      },
      size: {
        sm: "h-9 px-4 text-xs rounded-lg",
        md: "h-11 px-6 text-sm",
        lg: "h-13 px-8 text-base rounded-2xl",
        xl: "h-14 px-10 text-lg rounded-2xl",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
