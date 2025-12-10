interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  variant?: "horizontal" | "vertical";
}

export function Logo({ 
  size = "md", 
  showText = true, 
  className = "",
  variant = "horizontal"
}: LogoProps) {
  const iconSizes = {
    sm: { width: 60, height: 50, fontSize: 16, bbSize: 20 },
    md: { width: 90, height: 75, fontSize: 24, bbSize: 30 },
    lg: { width: 120, height: 100, fontSize: 32, bbSize: 40 },
    xl: { width: 180, height: 150, fontSize: 48, bbSize: 60 },
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-5xl",
  };

  const dimensions = iconSizes[size];

  return (
    <div className={`flex items-center ${variant === "vertical" ? "flex-col gap-2" : "gap-3"} ${className}`}>
      {/* Logo Graphic: Purple wheelchair + Rainbow arch + BB letters */}
      <div className="relative" style={{ width: dimensions.width, height: dimensions.height }}>
        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox="0 0 180 150"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          {/* Three-banded Rainbow Arch - Pink (outermost), Yellow/Orange (middle), Teal (innermost) */}
          <path
            d="M 35 55 Q 90 15 145 55"
            stroke="#EC4899"
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 40 60 Q 90 20 140 60"
            stroke="#F59E0B"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 45 65 Q 90 25 135 65"
            stroke="#14B8A6"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Purple Wheelchair User Icon - positioned on the left */}
          {/* Head (circle) */}
          <circle cx="25" cy="20" r="7" fill="#9333EA" />
          {/* Torso (rounded rectangle) */}
          <rect x="18" y="27" width="14" height="18" rx="3" fill="#9333EA" />
          {/* Arms (extending forward) */}
          <rect x="15" y="29" width="5" height="10" rx="2.5" fill="#9333EA" />
          <rect x="30" y="29" width="5" height="10" rx="2.5" fill="#9333EA" />
          {/* Legs (extending forward) */}
          <rect x="20" y="45" width="4" height="12" rx="2" fill="#9333EA" />
          <rect x="26" y="45" width="4" height="12" rx="2" fill="#9333EA" />
          {/* Wheelchair wheel (large arc) */}
          <circle cx="25" cy="75" r="16" stroke="#9333EA" strokeWidth="5" fill="none" />
          <circle cx="25" cy="75" r="10" stroke="#9333EA" strokeWidth="2" fill="none" />
          {/* Wheelchair seat/frame (horizontal bar) */}
          <rect x="18" y="62" width="14" height="3" rx="1.5" fill="#9333EA" />
        </svg>

        {/* BB Letters - positioned over the rainbow */}
        <div 
          className="absolute top-0 right-0 flex items-center font-bold"
          style={{ 
            fontSize: dimensions.bbSize,
            color: '#14B8A6',
            lineHeight: 1,
            marginTop: size === 'sm' ? '8px' : size === 'md' ? '12px' : size === 'lg' ? '16px' : '24px',
            marginRight: size === 'sm' ? '4px' : size === 'md' ? '6px' : size === 'lg' ? '8px' : '12px',
          }}
        >
          <span className="drop-shadow-sm">BB</span>
        </div>
      </div>

      {/* JOBBRIDGE Text */}
      {showText && (
        <span 
          className={`font-bold tracking-tight ${textSizes[size]}`}
          style={{ 
            color: '#F97316',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          JOBBRIDGE
        </span>
      )}
    </div>
  );
}

