import { motion, useScroll, useTransform } from "framer-motion";
import { useState } from "react";

const LINKS = [
  { href: "#rewards", label: "Rewards" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#reviews", label: "Reviews" },
  { href: "#gallery", label: "Gallery" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 80], [0, 0.85]);
  const shadowOpacity = useTransform(scrollY, [0, 80], [0, 0.08]);
  const backgroundColor = useTransform(bgOpacity, (v) => `rgba(248, 250, 252, ${v})`);
  const boxShadow = useTransform(shadowOpacity, (v) => `0 1px 0 rgba(17,24,39,${v})`);

  return (
    <motion.header
      className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl"
      style={{ backgroundColor, boxShadow }}
    >
      <nav className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="font-display font-bold text-lg text-ink tracking-tight">
          Chill Bites <span className="text-amber-500">Nohar</span>
        </a>

        <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-ink/70">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="hover:text-ink transition-colors">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#loyalty"
          className="hidden md:inline-flex items-center gap-1.5 bg-ink text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-ink-soft transition-colors"
        >
          🎁 Claim Token
        </a>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-full"
        >
          <div className="flex flex-col gap-1.5 w-5">
            <motion.span
              className="h-[2px] bg-ink rounded-full"
              animate={{ rotate: open ? 45 : 0, y: open ? 6 : 0 }}
            />
            <motion.span className="h-[2px] bg-ink rounded-full" animate={{ opacity: open ? 0 : 1 }} />
            <motion.span
              className="h-[2px] bg-ink rounded-full"
              animate={{ rotate: open ? -45 : 0, y: open ? -6 : 0 }}
            />
          </div>
        </button>
      </nav>

      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="md:hidden overflow-hidden bg-bg/95 backdrop-blur-lg border-t border-hairline"
      >
        <ul className="flex flex-col px-5 py-3 gap-1">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block py-2.5 text-ink/80 font-medium"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="pt-2">
            <a
              href="#loyalty"
              onClick={() => setOpen(false)}
              className="block text-center bg-ink text-white font-semibold py-2.5 rounded-full"
            >
              🎁 Claim Today's Token
            </a>
          </li>
        </ul>
      </motion.div>
    </motion.header>
  );
}
