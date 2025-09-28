"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getBottomSpace, isIOSDevice } from "@/utils/device";
import { HomeIcon } from "@/shared/icons/Home";
import { ChallengesIcon } from "@/shared/icons/Challenges";
import { NotificationsIcon } from "@/shared/icons/Notifications";
import Link from "next/link";
import { motion } from "framer-motion";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useConnection } from "@/contexts/ConnectionContext";
import styles from "./BottomNav.module.css";

export default function BottomNav() {
  const pathname = usePathname();
  const [bottomSpace, setBottomSpace] = useState(0);
  const [isIOS, setIsIOS] = useState(false);
  const { triggerImpact, triggerSelection } = useHapticFeedback();
  const { isConnected } = useConnection();

  useEffect(() => {
    setBottomSpace(getBottomSpace());
    setIsIOS(isIOSDevice());
  }, []);

  const hiddenRoutes = ["/login", "/event", "/payment-selection", "/register", "/language-setup", "/language-settings"];
  
  // Verifica se é uma rota de detalhes de challenge ou resultados (ex: /challenges/1, /challenges/2/results, etc)
  const isChallengeDetailsRoute = /^\/challenges\/\d+/.test(pathname);

  const shouldHideNav = hiddenRoutes.some((route) =>
    pathname.startsWith(route)
  ) || isChallengeDetailsRoute;

  if (shouldHideNav) {
    return null;
  }

  const menuItems = [
    {
      icon: HomeIcon,
      href: "/dashboard",
      label: "Home",
      disabled: false,
    },
    {
      icon: ChallengesIcon,
      href: "/challenges",
      label: "Challenges",
      disabled: !isConnected,
    },
    {
      icon: NotificationsIcon,
      href: "/notifications",
      label: "Notifications",
      disabled: false,
    },
  ];

  const IconWrapper = isIOS ? motion.div : "div";

  const handleTap = () => {
    if (isIOS) {
      triggerImpact("light");
    } else {
      triggerSelection();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.gradient} />
      <div 
        className={styles.content}
        style={{ marginBottom: `${bottomSpace}px` }}
      >
        {menuItems.map((item) => {
          const isActive = pathname === item.href || 
            (pathname === "/" && item.href === "/dashboard");
          const Icon = item.icon;
          
          const handleItemClick = (e: React.MouseEvent) => {
            if (item.disabled) {
              e.preventDefault();
              return;
            }
            handleTap();
          };
          
          if (item.disabled) {
            return (
              <div
                key={item.href}
                className={`${styles.navItem} ${styles.disabled}`}
                onClick={handleItemClick}
              >
                <IconWrapper className={styles.iconWrapper}>
                  <Icon 
                    filled={false} 
                    size={24}
                    className={styles.icon}
                  />
                </IconWrapper>
                <span className={styles.label}>
                  {item.label}
                </span>
              </div>
            );
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : styles.inactive}`}
              onClick={handleItemClick}
            >
              <IconWrapper
                whileTap={isIOS ? { scale: 1.2 } : undefined}
                transition={
                  isIOS
                    ? { type: "spring", stiffness: 400, damping: 17 }
                    : undefined
                }
                className={styles.iconWrapper}
              >
                <Icon 
                  filled={isActive} 
                  size={24}
                  className={styles.icon}
                />
                {/* Badge de notificação para o ícone de notifications */}
                {item.href === "/notifications" && !isActive && (
                  <div className={styles.notificationBadge}>
                    <span className={styles.badgeNumber}>1</span>
                  </div>
                )}
              </IconWrapper>
              <span className={styles.label}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      <div style={{ height: 0 }} />
    </div>
  );
}
