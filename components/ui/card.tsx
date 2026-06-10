import * as React from "react";
import { cn } from "@/lib/utils";

/* ─── Card Container ──────────────────────────────────────── */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }
>(({ className, hover = true, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl bg-white border border-warm-200/60 shadow-card",
      hover &&
        "transition-all duration-300 ease-out hover:shadow-card-hover hover:-translate-y-1",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

/* ─── Card Header ─────────────────────────────────────────── */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 pb-0", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

/* ─── Card Title ──────────────────────────────────────────── */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold font-heading leading-tight tracking-tight text-navy-800",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

/* ─── Card Description ────────────────────────────────────── */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-navy-800/50", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

/* ─── Card Content ────────────────────────────────────────── */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6", className)} {...props} />
));
CardContent.displayName = "CardContent";

/* ─── Card Footer ─────────────────────────────────────────── */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
