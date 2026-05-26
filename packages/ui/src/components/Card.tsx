import React from "react";

interface CardProps {
  children: React.ReactNode;
  padding?: string;
  radius?: string;
  shadow?: "sm" | "md" | "lg";
  hover?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const shadowMap = {
  sm: "0 2px 8px rgba(26, 26, 46, 0.06)",
  md: "0 4px 20px rgba(26, 26, 46, 0.08)",
  lg: "0 8px 40px rgba(26, 26, 46, 0.12)",
};

export function Card({
  children,
  padding = "24px",
  radius = "var(--radius, 16px)",
  shadow = "md",
  hover = false,
  style,
  className,
}: CardProps) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: "var(--bg-card, #FFFFFF)",
        borderRadius: radius,
        padding,
        boxShadow: shadowMap[shadow],
        border: "1px solid rgba(26, 26, 46, 0.05)",
        transition: hover ? "transform 0.3s ease, box-shadow 0.3s ease" : undefined,
        ...style,
      }}
      onMouseEnter={
        hover
          ? (e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
              (e.currentTarget as HTMLElement).style.boxShadow = shadowMap["lg"];
            }
          : undefined
      }
      onMouseLeave={
        hover
          ? (e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = shadowMap[shadow];
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
