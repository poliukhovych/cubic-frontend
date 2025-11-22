import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SpinnerProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  ariaLabel?: string;
};

export const Spinner: React.FC<SpinnerProps> = ({ className, size = "md", ariaLabel = "Завантаження" }) => {
  const sizeClass = size === "sm" ? "h-5 w-5" : size === "lg" ? "h-12 w-12" : "h-8 w-8";
  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)} role="status" aria-live="polite">
      <Loader2 className={cn("animate-spin text-primary", sizeClass)} aria-hidden="true" />
      <span className="sr-only">{ariaLabel}...</span>
    </div>
  );
};

export default Spinner;

export const InlineSpinner: React.FC<Pick<SpinnerProps, "className" | "ariaLabel" | "size">> = ({ className, ariaLabel = "Завантаження", size = "sm" }) => {
  const sizeClass = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";
  return (
    <span className={cn("inline-flex items-center justify-center", className)} role="status" aria-live="polite">
      <Loader2 className={cn("animate-spin text-primary", sizeClass)} aria-hidden="true" />
      <span className="sr-only">{ariaLabel}...</span>
    </span>
  );
};
