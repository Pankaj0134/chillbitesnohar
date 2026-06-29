import { motion } from "framer-motion";
import { BRAND } from "../data/content";

export default function GoogleReviews() {
  return (
    <section className="px-5 sm:px-8 py-16 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto rounded-3xl bg-bg border border-hairline p-8 sm:p-10 text-center"
      >
        <h2 className="font-display font-bold text-3xl text-ink mb-2">⭐ Love Our Food?</h2>
        <p className="text-ink/60 max-w-md mx-auto mb-6">
          Your review helps local businesses grow. We'd love to hear about
          your experience at {BRAND.name}.
        </p>

        <div className="flex flex-col items-center gap-1 mb-7">
          <div className="flex gap-1 text-amber-500 text-2xl">
            {"★★★★★".split("").map((s, i) => (
              <span key={i}>{s}</span>
            ))}
          </div>
          <p className="font-display font-bold text-xl text-ink">4.9 Rating</p>
          <p className="text-ink/50 text-sm">100+ Happy Customers</p>
        </div>

        <a
          href={BRAND.googleReviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-ink text-white font-semibold px-7 py-3.5 rounded-full hover:bg-ink-soft transition-colors hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          <GoogleG />
          Leave a Google Review
        </a>
      </motion.div>
    </section>
  );
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#fff"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.85 2.08-1.81 2.72v2.26h2.92c1.71-1.57 2.69-3.89 2.69-6.62z"
      />
      <path
        fill="#fff"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.55-1.84.87-3.04.87-2.34 0-4.32-1.58-5.03-3.71H.96v2.33C2.44 15.98 5.48 18 9 18z"
      />
      <path
        fill="#fff"
        opacity=".7"
        d="M3.97 10.72c-.18-.55-.28-1.13-.28-1.72s.1-1.17.28-1.72V4.95H.96A8.97 8.97 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"
      />
      <path
        fill="#fff"
        opacity=".85"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}
