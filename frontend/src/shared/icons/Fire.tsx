interface FireIconProps {
  className?: string;
  size?: number;
}

export function FireIcon({ className = "", size = 40 }: FireIconProps) {
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
        <linearGradient id="fireGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff6b35" />
          <stop offset="50%" stopColor="#ff8c42" />
          <stop offset="100%" stopColor="#ffd23f" />
        </linearGradient>
      </defs>
      <path
        d="M20 5C15 8 12 12 12 17C12 22 15.5 26 20 26C24.5 26 28 22 28 17C28 12 25 8 20 5Z"
        fill="url(#fireGradient)"
      />
      <path
        d="M20 10C17.5 12 16 14 16 17C16 19.5 17.5 21.5 20 21.5C22.5 21.5 24 19.5 24 17C24 14 22.5 12 20 10Z"
        fill="#ffeb3b"
      />
      <ellipse
        cx="20"
        cy="30"
        rx="8"
        ry="3"
        fill="rgba(255, 107, 53, 0.3)"
      />
    </svg>
  );
}
