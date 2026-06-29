import { motion } from "framer-motion";
import { InstagramIcon } from "./BrandIcons";
import { BRAND } from "../data/content";

export default function InstagramSection() {
  return (
    <section className="px-5 sm:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto rounded-3xl p-8 sm:p-10 text-center text-white relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #F59E0B 0%, #ef4444 50%, #8b5cf6 100%)",
        }}
      >
        <div className="absolute inset-0 bg-ink/30" />

        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mx-auto mb-4">
            <InstagramIcon size={28} />
          </div>

          <p className="font-display font-bold text-lg mb-1">{BRAND.instagramHandle}</p>
          <p className="text-white/85 max-w-md mx-auto mb-7">
            Follow us to discover new menu items, exciting offers, giveaways,
            and behind-the-scenes content.
          </p>

          <a
            href={BRAND.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white text-ink font-semibold px-7 py-3.5 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            <InstagramIcon size={18} />
            Follow on Instagram
          </a>
        </div>
      </motion.div>
    </section>
  );
}
