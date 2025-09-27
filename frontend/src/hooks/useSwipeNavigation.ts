"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export function useSwipeNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const touchStart = useRef<number>(0);
  const touchEnd = useRef<number>(0);
  const minSwipeDistance = 100; // Distância mínima para considerar um swipe

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      touchStart.current = e.targetTouches[0].clientX;
    };

    const onTouchMove = (e: TouchEvent) => {
      touchEnd.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = () => {
      const swipeDistance = touchEnd.current - touchStart.current;
      const isLeftToRight = swipeDistance > minSwipeDistance;

      // Verifica se é um swipe da esquerda para direita e não está no dashboard
      if (isLeftToRight && pathname !== "/dashboard") {
        router.back();
      }

      // Reset dos valores
      touchStart.current = 0;
      touchEnd.current = 0;
    };

    document.addEventListener("touchstart", onTouchStart);
    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onTouchEnd);

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [router, pathname]);
}
