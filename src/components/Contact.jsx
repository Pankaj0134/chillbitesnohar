import { motion } from "framer-motion";
import { MapPin, Phone, Clock, MessageCircle } from "lucide-react";
import { BRAND } from "../data/content";

export default function Contact() {
  return (
    <section id="contact" className="px-5 sm:px-8 py-16 bg-white">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display font-bold text-3xl text-ink mb-6">Visit Us</h2>

          <div className="space-y-4 mb-7">
            <div className="flex gap-3">
              <MapPin size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-ink/70">{BRAND.address}</p>
            </div>
            <div className="flex gap-3">
              <Phone size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-ink/70">{BRAND.phoneNumber}</p>
            </div>
            <div className="flex gap-3">
              <Clock size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-ink/70">{BRAND.hours}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={BRAND.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-success text-white font-semibold px-5 py-3 rounded-full hover:opacity-90 transition-opacity"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>
            <a
              href={`tel:${BRAND.phoneNumber.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 bg-ink text-white font-semibold px-5 py-3 rounded-full hover:bg-ink-soft transition-colors"
            >
              <Phone size={18} />
              Call Now
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl overflow-hidden border border-hairline h-72 md:h-auto"
        >
          <iframe
            title="Chill Bites Nohar location"
            src={BRAND.mapsEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: "280px" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>
      </div>
    </section>
  );
}
