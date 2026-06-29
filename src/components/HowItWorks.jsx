import { motion } from "framer-motion";
import { QrCode, Trophy, RotateCcw, Gift } from "lucide-react";
import { HOW_IT_WORKS } from "../data/content";

const ICONS = [QrCode, Trophy, RotateCcw, Gift];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-5 sm:px-8 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-3xl text-ink mb-2">How It Works</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {HOW_IT_WORKS.map((item, i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="relative bg-white border border-hairline rounded-2xl p-6 text-center"
              >
                <span className="absolute top-4 right-5 font-display font-bold text-3xl text-ink/[0.06]">
                  0{item.step}
                </span>
                <div className="w-12 h-12 rounded-xl bg-amber-soft/50 flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-amber-600" />
                </div>
                <p className="font-display font-semibold text-ink mb-1.5">{item.title}</p>
                <p className="text-ink/50 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
