interface ErrorMessageProps {
  error: string | null;
  retryCount: number;
  isRetrying: boolean;
}

export const ErrorMessage = ({ error, retryCount, isRetrying }: ErrorMessageProps) => {
  if (!error || retryCount < 3 || isRetrying) return null;

  return (
    <div style={{ marginBottom: "16px" }}>
      <div
        style={{
          backgroundColor: "#FEF2F2",
          border: "1px solid #FECACA",
          borderRadius: "12px",
          padding: "12px",
          marginBottom: "12px",
        }}
      >
        <p
          style={{
            fontFamily: "Sora, sans-serif",
            fontSize: "12px",
            color: "#DC2626",
          }}
        >
          {error}
        </p>
      </div>
    </div>
  );
};
