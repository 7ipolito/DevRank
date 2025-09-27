interface HomeIconProps {
  filled?: boolean;
  className?: string;
  size?: number;
}

export function HomeIcon({ filled = false, className = "", size = 24 }: HomeIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {filled ? (
        <>
          <circle cx="12" cy="12" r="10" fill="currentColor" />
          <path
            d="M8 12L11 15L16 10"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M8 12L11 15L16 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
}
