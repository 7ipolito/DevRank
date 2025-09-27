interface LeaderboardIconProps {
  filled?: boolean;
  className?: string;
}

export function LeaderboardIcon({ filled = false, className = "" }: LeaderboardIconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {filled ? (
        <>
          <rect x="3" y="12" width="4" height="9" rx="1" fill="currentColor" />
          <rect x="10" y="8" width="4" height="13" rx="1" fill="currentColor" />
          <rect x="17" y="15" width="4" height="6" rx="1" fill="currentColor" />
          <circle cx="5" cy="4" r="2" fill="currentColor" />
          <circle cx="12" cy="4" r="2" fill="currentColor" />
          <circle cx="19" cy="4" r="2" fill="currentColor" />
        </>
      ) : (
        <>
          <rect x="3" y="12" width="4" height="9" rx="1" stroke="currentColor" strokeWidth="2" />
          <rect x="10" y="8" width="4" height="13" rx="1" stroke="currentColor" strokeWidth="2" />
          <rect x="17" y="15" width="4" height="6" rx="1" stroke="currentColor" strokeWidth="2" />
          <circle cx="5" cy="4" r="2" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="2" />
          <circle cx="19" cy="4" r="2" stroke="currentColor" strokeWidth="2" />
        </>
      )}
    </svg>
  );
}
