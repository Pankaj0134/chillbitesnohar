import { motion } from "framer-motion";
import { REWARDS } from "../data/content";

export default function Rewards() {
  return (
    <section id="rewards" className="px-5 sm:px-8 py-16 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-3xl text-ink mb-2">Rewards Worth Coming Back For</h2>
          <p className="text-ink/50">Every full card unlocks one of these</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {REWARDS.map((reward, i) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              whileHover={{ y: -6 }}
              className="bg-bg border border-hairline rounded-2xl p-5 text-center hover:shadow-card hover:border-amber-200 transition-shadow"
            >
              <div className="text-4xl mb-3">{reward.emoji}</div>
              <p className="font-display font-semibold text-ink text-sm sm:text-base">{reward.label}</p>
              <p className="text-ink/45 text-xs mt-1">{reward.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
