interface LoginButtonProps {
  loading: boolean;
  isRetrying: boolean;
  error: string | null;
  retryCount: number;
  onLoginClick: () => void;
}

export const LoginButton = ({ 
  loading, 
  isRetrying, 
  error, 
  retryCount, 
  onLoginClick 
}: LoginButtonProps) => {
  if (loading || isRetrying) return null;

  return (
    <button
      onClick={onLoginClick}
      disabled={loading || isRetrying}
      onMouseDown={(e) => {
        if (!loading && !isRetrying) {
          (e.target as HTMLButtonElement).style.transform = "scale(0.95)";
        }
      }}
      onMouseUp={(e) => {
        (e.target as HTMLButtonElement).style.transform = "scale(1)";
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLButtonElement).style.transform = "scale(1)";
      }}
      onTouchStart={(e) => {
        if (!loading && !isRetrying) {
          (e.target as HTMLButtonElement).style.transform = "scale(0.95)";
        }
      }}
      onTouchEnd={(e) => {
        (e.target as HTMLButtonElement).style.transform = "scale(1)";
      }}
      style={{
        fontFamily: "Sora, sans-serif",
        width: "100%",
        padding: "14px",
        color: "white",
        fontSize: "16px",
        fontWeight: "600",
        borderRadius: "12px",
        border: "none",
        backgroundColor: loading || isRetrying ? "#9CA3AF" : "#8338EC",
        marginBottom: "16px",
        cursor: loading || isRetrying ? "not-allowed" : "pointer",
        transition: "transform 0.1s ease",
        opacity: loading || isRetrying ? 0.6 : 1,
      }}
    >
      {error && retryCount >= 3 ? "Try Again" : "Continue with WorldID"}
    </button>
  );
};
