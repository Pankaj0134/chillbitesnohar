import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";
import { GALLERY } from "../data/content";

export default function Gallery() {
  const [active, setActive] = useState(null);

  return (
    <section id="gallery" className="px-5 sm:px-8 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-3xl text-ink">Gallery</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {GALLERY.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              onClick={() => setActive(item)}
              className="relative group rounded-2xl overflow-hidden aspect-square focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <img
                src={item.url}
                alt={item.category}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <span className="text-white text-sm font-semibold">{item.category}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-ink/90 flex items-center justify-center p-6"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={active.url}
                alt={active.category}
                className="w-full rounded-2xl max-h-[80vh] object-cover"
              />
              <p className="text-white text-center mt-3 font-medium">{active.category}</p>
              <button
                onClick={() => setActive(null)}
                aria-label="Close preview"
                className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-white flex items-center justify-center"
              >
                <X size={18} className="text-ink" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
