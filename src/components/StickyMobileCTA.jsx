import { motion } from "framer-motion";

export default function StickyMobileCTA() {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="md:hidden fixed bottom-0 inset-x-0 z-40 p-3 glass border-t border-white/40"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <a
        href="#loyalty"
        className="block text-center bg-ink text-white font-semibold py-3 rounded-full shadow-token"
      >
        🎁 Claim Today's Token
      </a>
    </motion.div>
  );
}
