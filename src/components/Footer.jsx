import { MapPin, MessageCircle } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "./BrandIcons";
import { BRAND } from "../data/content";

export default function Footer() {
  return (
    <footer className="bg-ink text-white px-5 sm:px-8 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
          <div>
            <p className="font-display font-bold text-lg">{BRAND.name}</p>
            <p className="text-white/50 text-sm mt-1">{BRAND.tagline}</p>
          </div>

          <div className="flex gap-3">
            <SocialLink href={BRAND.instagramUrl} label="Instagram">
              <InstagramIcon size={18} />
            </SocialLink>
            <SocialLink href={`https://maps.google.com/?q=${encodeURIComponent(BRAND.address)}`} label="Google Maps">
              <MapPin size={18} />
            </SocialLink>
            <SocialLink href={BRAND.whatsappUrl} label="WhatsApp">
              <MessageCircle size={18} />
            </SocialLink>
            <SocialLink href={BRAND.facebookUrl} label="Facebook">
              <FacebookIcon size={18} />
            </SocialLink>
          </div>
        </div>

        <div className="h-px bg-white/10 mb-6" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-white/45">
          <div className="flex gap-5">
            <a href="#" className="hover:text-white/70 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white/70 transition-colors">Terms &amp; Conditions</a>
          </div>
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
    >
      {children}
    </a>
  );
}
