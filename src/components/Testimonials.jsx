import { motion } from "framer-motion";
import { TESTIMONIALS } from "../data/content";

export default function Testimonials() {
  return (
    <section id="reviews" className="px-5 sm:px-8 py-16 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-3xl text-ink">What Customers Say</h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="bg-bg border border-hairline rounded-2xl p-6"
            >
              <div className="text-amber-500 text-sm mb-3">{"★".repeat(t.rating)}</div>
              <p className="text-ink/70 text-sm leading-relaxed mb-4">"{t.text}"</p>
              <p className="font-display font-semibold text-ink text-sm">{t.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
