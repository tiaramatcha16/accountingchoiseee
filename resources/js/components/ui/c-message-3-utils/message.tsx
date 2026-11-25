import * as React from "react";
import { cn } from "@/lib/utils";

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end";
}

export const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ className, align = "start", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full flex-col gap-1.5",
          align === "end" ? "items-end" : "items-start",
          className
        )}
        {...props}
      />
    );
  }
);
Message.displayName = "Message";

export const MessageContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex max-w-[85%] flex-col gap-1.5 sm:max-w-[75%]", className)}
      {...props}
    />
  );
});
MessageContent.displayName = "MessageContent";

export const MessageHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center text-xs font-medium text-muted-foreground px-1",
        className
      )}
      {...props}
    />
  );
});
MessageHeader.displayName = "MessageHeader";

export const MessageFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center text-[11px] text-muted-foreground px-1",
        className
      )}
      {...props}
    />
  );
});
MessageFooter.displayName = "MessageFooter";
