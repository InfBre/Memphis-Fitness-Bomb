import { motion } from "motion/react";
import { ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MemphisCardProps {
  children: ReactNode;
  className?: string;
  color?: "mint" | "coral" | "lavender" | "lemon" | "white";
  key?: string | number;
}

export default function MemphisCard({ children, className, color = "white" }: MemphisCardProps) {
  const colorClasses = {
    mint: "bg-mint",
    coral: "bg-coral",
    lavender: "bg-lavender",
    lemon: "bg-lemon",
    white: "bg-white",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, x: -4, y: -4 }}
      whileTap={{ scale: 0.98, x: 4, y: 4 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className={cn(
        "memphis-card p-6",
        colorClasses[color],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
