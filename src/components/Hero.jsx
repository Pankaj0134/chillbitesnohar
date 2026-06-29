import { motion } from "framer-motion";
import FloatingFoodBackground from "./FloatingFoodBackground";
import StampCard3D from "./StampCard3D";

export default function Hero() {
  return (
    <section id="top" className="relative pt-28 pb-16 px-5 sm:px-8 overflow-hidden">
      <FloatingFoodBackground />

      <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="text-center md:text-left order-2 md:order-1">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-amber-soft/60 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5"
          >
            ✨ {"Eat • Scan • Earn • Repeat"}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-bold text-4xl sm:text-5xl leading-[1.1] tracking-tight text-ink"
          >
            Every Visit Brings You Closer to{" "}
            <span className="text-amber-500">Free Rewards</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 text-ink/60 text-lg max-w-md mx-auto md:mx-0"
          >
            Scan the QR code every time you visit Chill Bites Nohar, collect
            loyalty tokens, and unlock exciting rewards.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center md:justify-start"
          >
            <a
              href="#loyalty"
              className="group relative overflow-hidden inline-flex items-center justify-center gap-2 bg-ink text-white font-semibold px-6 py-3.5 rounded-full shadow-token transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              <span className="relative z-10">🎁 Claim Today's Token</span>
              <span className="absolute inset-0 bg-amber-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </a>
            <a
              href="#rewards"
              className="inline-flex items-center justify-center gap-2 bg-white text-ink font-semibold px-6 py-3.5 rounded-full border border-hairline hover:border-ink/20 transition-colors"
            >
              ⭐ View Rewards
            </a>
          </motion.div>
        </div>

        <div className="order-1 md:order-2">
          <StampCard3D />
        </div>
      </div>
    </section>
  );
}
