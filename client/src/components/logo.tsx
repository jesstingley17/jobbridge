import { Accessibility } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-9 w-9",
    lg: "h-16 w-16",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-4xl",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Rainbow gradient wheelchair icon with BB letters */}
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Wheelchair icon background with rainbow gradient */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 via-orange-500 to-teal-500 p-0.5">
          <div className="h-full w-full rounded-lg bg-white dark:bg-background flex items-center justify-center">
            <Accessibility className={`${sizeClasses[size]} text-purple-600`} />
          </div>
        </div>
        {/* BB letters overlay */}
        <div className="absolute -right-1 top-0 flex items-center gap-0.5">
          <span className={`font-bold ${size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-sm"} text-teal-600`}>B</span>
          <span className={`font-bold ${size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-sm"} text-teal-500`}>B</span>
        </div>
      </div>
      {showText && (
        <span className={`font-semibold tracking-tight ${textSizes[size]} bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent`}>
          JOBBRIDGE
        </span>
      )}
    </div>
  );
}

