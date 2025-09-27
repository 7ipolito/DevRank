import {
  MiniAppSendHapticFeedbackPayload,
  MiniKit,
  ResponseEvent,
  SendHapticFeedbackInput,
} from "@worldcoin/minikit-js";
import { useEffect, useCallback } from "react";

export const useHapticFeedback = () => {
  useEffect(() => {
    if (!MiniKit.isInstalled()) {
      return;
    }

    MiniKit.subscribe(
      ResponseEvent.MiniAppSendHapticFeedback,
      (payload: MiniAppSendHapticFeedbackPayload) => {
        if (payload.status === "error") {
          console.error("Haptic feedback error:", payload);
        }
      }
    );

    return () => {
      MiniKit.unsubscribe(ResponseEvent.MiniAppSendHapticFeedback);
    };
  }, []);

  const triggerHaptic = useCallback(async (input: SendHapticFeedbackInput) => {
    if (!MiniKit.isInstalled()) return;

    try {
      await MiniKit.commands.sendHapticFeedback(input);
    } catch (error) {
      console.error("Failed to trigger haptic feedback:", error);
    }
  }, []);

  return {
    triggerHaptic,
    triggerSuccess: () =>
      triggerHaptic({ hapticsType: "notification", style: "success" }),
    triggerError: () =>
      triggerHaptic({ hapticsType: "notification", style: "error" }),
    triggerWarning: () =>
      triggerHaptic({ hapticsType: "notification", style: "warning" }),
    triggerImpact: (style: "light" | "medium" | "heavy" = "medium") =>
      triggerHaptic({ hapticsType: "impact", style }),
    triggerSelection: () => triggerHaptic({ hapticsType: "selection-changed" }),
  };
};
