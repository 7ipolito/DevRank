"use client";

import React, { useState, useEffect, useRef, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useNavigation } from "@/contexts/NavigationContext";

interface SwipeTransitionProps {
  children: ReactNode;
  onSwipeComplete?: () => void;
}

export function SwipeTransition({
  children,
  onSwipeComplete,
}: SwipeTransitionProps) {
  const router = useRouter();
  const { previousScreen, navigateBack } = useNavigation();
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number>(0);
  const currentX = useRef<number>(0);
  const [transformX, setTransformX] = useState<number>(0);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );
  const minSwipeDistance = 40; // Distância mínima para começar a transição
  const threshold = window.innerWidth * 0.3; // 30% da largura da tela para completar a transição

  useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0].clientX < 30) {
      // Apenas inicia o swipe se tocar próximo à borda esquerda
      startX.current = e.touches[0].clientX;
      currentX.current = e.touches[0].clientX;
      setIsSwiping(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;

    currentX.current = e.touches[0].clientX;
    const diffX = currentX.current - startX.current;

    if (diffX > 0) {
      // Apenas permite swipe da esquerda para direita
      setTransformX(diffX);
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;

    const diffX = currentX.current - startX.current;

    if (diffX > threshold) {
      // Completa a transição
      setTransformX(window.innerWidth);
      setTimeout(() => {
        if (onSwipeComplete) {
          onSwipeComplete();
        } else {
          navigateBack();
        }
      }, 300);
    } else {
      // Cancela a transição
      setTransformX(0);
    }

    setIsSwiping(false);
  };

  const slidePercentage = Math.min(transformX / window.innerWidth, 1);
  const currentPageTransform = `translateX(${slidePercentage * 30}%) scale(${
    1 - slidePercentage * 0.1
  })`;

  if (!portalContainer) return <>{children}</>;

  // Este estilo garante que o conteúdo mantenha sua altura e rolagem normal
  const mainContainerStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    transform: currentPageTransform,
    transition: isSwiping ? "none" : "transform 0.3s ease",
    zIndex: 2,
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Tela atual */}
      <div ref={containerRef} style={mainContainerStyle}>
        {children}
      </div>

      {/* Tela anterior (renderizada no portal) */}
      {transformX > minSwipeDistance &&
        previousScreen &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 1,
              transform: `translateX(${-window.innerWidth + transformX}px)`,
              transition: isSwiping ? "none" : "transform 0.3s ease",
            }}
          >
            {previousScreen}
          </div>,
          portalContainer
        )}

      {/* Área sensível ao toque para detectar o swipe */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "20px", // Área estreita no lado esquerdo da tela
          height: "100%",
          zIndex: 10000,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
}
