interface FooterTextProps {
  loading: boolean;
  isRetrying: boolean;
}

export const FooterText = ({ loading, isRetrying }: FooterTextProps) => {
  if (loading || isRetrying) return null;

  return (
    <div style={{ textAlign: "center" }}>
      <p
        style={{
          fontFamily: "Sora, sans-serif",
          fontSize: "10px",
          color: "#6B7280",
          lineHeight: "1.3",
        }}
      >
        By continuing, you agree to our{" "}
        <span style={{ color: "#8338EC", fontWeight: "500" }}>
          Terms
        </span>{" "}
        and{" "}
        <span style={{ color: "#8338EC", fontWeight: "500" }}>
          Privacy Policy
        </span>
      </p>
    </div>
  );
};
