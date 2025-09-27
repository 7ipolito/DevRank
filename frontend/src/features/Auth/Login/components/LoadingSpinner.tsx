interface LoadingSpinnerProps {
  isLoading: boolean;
  isRetrying: boolean;
}

export const LoadingSpinner = ({ isLoading, isRetrying }: LoadingSpinnerProps) => {
  if (!isLoading && !isRetrying) return null;

  return (
    <div style={{ textAlign: "center", marginBottom: "16px" }}>
      <div
        style={{
          width: "32px",
          height: "32px",
          border: "3px solid #E5E7EB",
          borderTop: "3px solid #8338EC",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 12px auto",
        }}
      ></div>
      <p
        style={{
          fontFamily: "Sora, sans-serif",
          fontSize: "14px",
          color: "#8338EC",
        }}
      >
        Connecting to WorldID...
      </p>
    </div>
  );
};
