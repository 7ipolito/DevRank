"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getBottomSpace, isIOSDevice } from "@/utils/device";
import { HomeIcon } from "@/shared/icons/Home";
import { ChallengesIcon } from "@/shared/icons/Challenges";
import { LeaderboardIcon } from "@/shared/icons/Leaderboard";
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

  const hiddenRoutes = ["/login", "/language-setup", "/language-settings"];

  const shouldHideNav = hiddenRoutes.some((route) =>
    pathname.startsWith(route)
  );

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
      disabled: false,
      //disabled: !isConnected,
    },
    {
      icon: LeaderboardIcon,
      href: "/leaderboards",
      label: "Leaderboards",
      disabled: false,
      //disabled: !isConnected,

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
