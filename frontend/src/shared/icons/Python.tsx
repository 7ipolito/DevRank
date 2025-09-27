interface PythonIconProps {
  className?: string;
  size?: number;
}

export function PythonIcon({ className = "", size = 40 }: PythonIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="pythonBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#306998" />
          <stop offset="100%" stopColor="#4b8bbe" />
        </linearGradient>
        <linearGradient id="pythonYellow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd43b" />
          <stop offset="100%" stopColor="#ffde57" />
        </linearGradient>
      </defs>
      
      {/* Python logo top part (blue) */}
      <path
        d="M20 5C15 5 12 8 12 12V18H20V20H10C8 20 6 22 6 24V28C6 30 8 32 10 32H14V28C14 26 16 24 18 24H26C28 24 30 22 30 20V12C30 8 27 5 22 5H20Z"
        fill="url(#pythonBlue)"
      />
      
      {/* Python logo bottom part (yellow) */}
      <path
        d="M20 35C25 35 28 32 28 28V22H20V20H30C32 20 34 18 34 16V12C34 10 32 8 30 8H26V12C26 14 24 16 22 16H14C12 16 10 18 10 20V28C10 32 13 35 18 35H20Z"
        fill="url(#pythonYellow)"
      />
      
      {/* Eyes */}
      <circle cx="16" cy="12" r="1.5" fill="white" />
      <circle cx="24" cy="28" r="1.5" fill="white" />
    </svg>
  );
}
