"use client";
import { MiniKit, WalletAuthInput } from "@worldcoin/minikit-js";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAnimation } from "@/contexts/AnimationContext";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { 
  LoadingSpinner, 
  ErrorMessage, 
  LoginButton, 
  LogoSection, 
  FooterText, 
  loginStyles 
} from "./components";

const walletAuthInput = (nonce: string): WalletAuthInput => {
  return {
    nonce,
    requestId: "0",
    expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
    statement:
      "This is my statement and here is a link https://worldcoin.com/apps",
  };
};

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const { triggerImpact } = useHapticFeedback();

  const router = useRouter();
  const { setIsAnimating } = useAnimation();

  // Check if user is already logged in
  useEffect(() => {
    if (MiniKit.user?.walletAddress) {
      router.push("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    if (error && retryCount < 3 && !isRetrying) {
      setIsRetrying(true);
      const timer = setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        handleLogin();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [error, retryCount]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setIsAnimating(true);
      setError(null);

      // Loading timeout after 3 seconds
      const loadingTimeout = setTimeout(() => {
        setLoading(false);
        setError("Connection timeout. Please try again.");
        setIsAnimating(false);
      }, 3000);

      const res = await fetch(`/api/nonce`);
      const { nonce } = await res.json();

      const { finalPayload } = await MiniKit.commandsAsync.walletAuth(
        walletAuthInput(nonce)
      );

      clearTimeout(loadingTimeout);

      if (finalPayload.status === "error") {
        setLoading(false);
        setError("Error during WorldID authentication.");
        setIsAnimating(false);
        setIsRetrying(false);
        return;
      } else {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payload: finalPayload,
            nonce,
          }),
        });

        if (response.status === 200) {
          if (!MiniKit.user?.walletAddress) {
            setError("Wallet address is missing.");
            setLoading(false);
            setIsAnimating(false);
            setIsRetrying(false);
            console.log("Wallet address is missing.");
            return;
          }

          router.push("/dashboard");
        } else {
          setError("Failed to log in.");
          setIsAnimating(false);
          setIsRetrying(false);
        }
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Error during login.");
      setLoading(false);
      setIsAnimating(false);
      setIsRetrying(false);
    }
  };

  const handleLoginClick = () => {
    if (loading || isRetrying) return;

    triggerImpact("medium");
    setError(null);
    setRetryCount(0);
    setIsRetrying(false);
    handleLogin();
  };

  return (
    <>
      <style>{loginStyles}</style>
      <div
        style={{
          height: "100vh",
          background:
            "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 50%, #F1F5F9 100%)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
        }}
      >
        {/* Main Content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "60px 24px 20px 24px",
          }}
        >
          {/* Top Section with Logo and Text */}
          <div
            style={{
              textAlign: "center",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            {/* Logo Section */}
            <LogoSection />

            {/* Content Section */}
            <div
              style={{
                textAlign: "center",
                maxWidth: "300px",
                margin: "0 auto",
              }}
            ></div>
          </div>

          {/* Bottom Section with Button */}
          <div
            style={{ width: "100%", maxWidth: "300px", marginBottom: "10px" }}
          >
            {/* Loading State */}
            <LoadingSpinner isLoading={loading} isRetrying={isRetrying} />

            {/* Error State */}
            <ErrorMessage error={error} retryCount={retryCount} isRetrying={isRetrying} />

            {/* Login Button */}
            <LoginButton 
              loading={loading}
              isRetrying={isRetrying}
              error={error}
              retryCount={retryCount}
              onLoginClick={handleLoginClick}
            />

            {/* Footer Text */}
            <FooterText loading={loading} isRetrying={isRetrying} />
          </div>
        </div>
      </div>
    </>
  );
};
