import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import LoyaltyCard from "./components/LoyaltyCard";
import GoogleReviews from "./components/GoogleReviews";
import InstagramSection from "./components/InstagramSection";
import Rewards from "./components/Rewards";
import HowItWorks from "./components/HowItWorks";
import Testimonials from "./components/Testimonials";
import Gallery from "./components/Gallery";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import StickyMobileCTA from "./components/StickyMobileCTA";
import StaffPanel from "./components/StaffPanel";

function PublicSite() {
  return (
    <div className="min-h-screen bg-bg pb-20 md:pb-0">
      <Navbar />
      <main>
        <Hero />
        <LoyaltyCard />
        <GoogleReviews />
        <InstagramSection />
        <Rewards />
        <HowItWorks />
        <Testimonials />
        <Gallery />
        <Contact />
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* /staff is intentionally not linked anywhere in the public site's
          nav, footer, or any visible UI — staff/owner type the URL
          directly on the counter device. It does NOT use AuthProvider's
          customer phone+password session; it's PIN-gated independently
          inside StaffPanel itself, via the staff_lookup()/staff_redeem()
          RPCs. */}
      <Route path="/staff" element={<StaffPanel />} />
      <Route
        path="/*"
        element={
          <AuthProvider>
            <PublicSite />
          </AuthProvider>
        }
      />
    </Routes>
  );
}
