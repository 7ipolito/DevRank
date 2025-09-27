"use client";
import { Login } from "@/features/Auth/Login";
import { AnimationProvider } from "@/contexts/AnimationContext";

export default function LoginPage() {
  return (
    <AnimationProvider>
      <Login />
    </AnimationProvider>
  );
}
