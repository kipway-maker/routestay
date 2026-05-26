import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: "linear-gradient(135deg, #FF6240, #FF8A6E)",
    color: "white",
    border: "none",
    boxShadow: "0 4px 14px rgba(255, 98, 64, 0.3)",
  },
  secondary: {
    background: "white",
    color: "#1A1A2E",
    border: "1.5px solid rgba(26, 26, 46, 0.12)",
    boxShadow: "0 2px 8px rgba(26, 26, 46, 0.06)",
  },
  ghost: {
    background: "transparent",
    color: "#FF6240",
    border: "none",
    boxShadow: "none",
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: "8px 16px", fontSize: "13px", borderRadius: "10px" },
  md: { padding: "12px 24px", fontSize: "15px", borderRadius: "12px" },
  lg: { padding: "16px 32px", fontSize: "17px", borderRadius: "14px" },
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  fullWidth = false,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontFamily: "var(--font-nunito), 'Nunito', sans-serif",
        fontWeight: 700,
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
        width: fullWidth ? "100%" : "auto",
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      onMouseEnter={(e) => {
        if (variant === "primary") {
          (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(255,98,64,0.4)";
        }
        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        if (variant === "primary") {
          (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(255,98,64,0.3)";
        }
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
      {...props}
    >
      {children}
    </button>
  );
}
