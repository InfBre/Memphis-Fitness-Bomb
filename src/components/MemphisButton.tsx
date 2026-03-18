import { motion } from "motion/react";
import { ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MemphisButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  color?: "mint" | "coral" | "lavender" | "lemon" | "white";
  type?: "button" | "submit";
  key?: string | number;
}

export default function MemphisButton({ children, onClick, className, color = "white", type = "button" }: MemphisButtonProps) {
  const colorClasses = {
    mint: "bg-mint",
    coral: "bg-coral",
    lavender: "bg-lavender",
    lemon: "bg-lemon",
    white: "bg-white",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: 1.05, x: -4, y: -4 }}
      whileTap={{ scale: 0.95, x: 4, y: 4 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className={cn(
        "memphis-button shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        colorClasses[color],
        className
      )}
    >
      {children}
    </motion.button>
  );
}
