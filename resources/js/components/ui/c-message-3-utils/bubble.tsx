import * as React from "react";
import { cn } from "@/lib/utils";

export interface BubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "muted" | "system";
}

export const Bubble = React.forwardRef<HTMLDivElement, BubbleProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-2xl px-4 py-2.5 text-sm transition-all shadow-xs",
          variant === "default" &&
            "bg-[#1d1d1f] text-white rounded-br-sm",
          variant === "muted" &&
            "bg-[#f5f5f7] border border-black/[0.06] text-[#1d1d1f] rounded-bl-sm shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
          variant === "system" &&
            "bg-amber-50/80 border border-amber-200/60 text-amber-900 rounded-xl",
          className
        )}
        {...props}
      />
    );
  }
);
Bubble.displayName = "Bubble";

export const BubbleContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("leading-relaxed break-words whitespace-pre-wrap", className)}
      {...props}
    />
  );
});
BubbleContent.displayName = "BubbleContent";
