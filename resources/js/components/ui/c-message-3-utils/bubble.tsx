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
            "bg-[#1d1d1f] text-white rounded-br-xs",
          variant === "muted" &&
            "bg-white border border-slate-200/90 text-[#1d1d1f] rounded-bl-xs shadow-xs",
          variant === "system" &&
            "bg-slate-50 border border-slate-200/90 text-slate-700 rounded-2xl rounded-bl-xs shadow-2xs",
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
