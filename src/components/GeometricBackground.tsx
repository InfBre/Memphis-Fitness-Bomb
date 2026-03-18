import { motion } from "motion/react";

export default function GeometricBackground() {
  const shapes = [
    { type: "circle", color: "bg-mint", size: "w-32 h-32", top: "10%", left: "5%" },
    { type: "square", color: "bg-coral", size: "w-24 h-24", top: "40%", left: "80%" },
    { type: "triangle", color: "bg-lemon", size: "w-20 h-20", top: "70%", left: "15%" },
    { type: "circle", color: "bg-coral", size: "w-16 h-16", top: "20%", left: "60%" },
    { type: "square", color: "bg-mint", size: "w-40 h-40", top: "85%", left: "75%" },
  ];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-lavender bg-pattern opacity-30">
      {shapes.map((shape, i) => (
        <motion.div
          key={i}
          className={`absolute ${shape.size} ${shape.color} border-4 border-black`}
          style={{
            top: shape.top,
            left: shape.left,
            borderRadius: shape.type === "circle" ? "50%" : shape.type === "triangle" ? "0" : "0",
            clipPath: shape.type === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" : "none",
          }}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
