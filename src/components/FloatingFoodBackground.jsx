import { motion } from "framer-motion";

const ITEMS = [
  { emoji: "☕", top: "12%", left: "8%", size: "text-4xl", duration: 7, delay: 0 },
  { emoji: "🍔", top: "22%", left: "85%", size: "text-5xl", duration: 8, delay: 0.5 },
  { emoji: "🍟", top: "70%", left: "10%", size: "text-4xl", duration: 6.5, delay: 1 },
  { emoji: "🍕", top: "78%", left: "82%", size: "text-4xl", duration: 9, delay: 0.3 },
  { emoji: "🍰", top: "8%", left: "55%", size: "text-3xl", duration: 7.5, delay: 1.5 },
  { emoji: "🥤", top: "55%", left: "92%", size: "text-3xl", duration: 6, delay: 0.8 },
  { emoji: "🍩", top: "85%", left: "45%", size: "text-3xl", duration: 8.5, delay: 1.2 },
];

export default function FloatingFoodBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Soft animated gradient blobs */}
      <motion.div
        className="absolute -top-32 -left-32 w-80 h-80 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(245,158,11,0.25), transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-24 w-96 h-96 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.18), transparent 70%)" }}
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      {ITEMS.map((item, i) => (
        <motion.span
          key={i}
          className={`absolute ${item.size} opacity-25 select-none`}
          style={{ top: item.top, left: item.left }}
          animate={{
            y: [0, -18, 0],
            rotate: [0, 6, -6, 0],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {item.emoji}
        </motion.span>
      ))}
    </div>
  );
}
