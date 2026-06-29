import { motion, useMotionTemplate, useSpring } from "framer-motion";
import { useRef } from "react";

/**
 * Signature 3D element: a punch-card-styled QR token that tilts in real 3D
 * space following the pointer, using CSS perspective + rotateX/rotateY.
 * No WebGL needed — this is the "lightweight CSS 3D" approach.
 */
export default function StampCard3D() {
  const ref = useRef(null);
  const rotateX = useSpring(0, { stiffness: 150, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 150, damping: 20 });
  const glowX = useSpring(50, { stiffness: 150, damping: 20 });
  const glowY = useSpring(50, { stiffness: 150, damping: 20 });

  function handlePointerMove(e) {
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 22);
    rotateX.set((0.5 - py) * 22);
    glowX.set(px * 100);
    glowY.set(py * 100);
  }

  function handlePointerLeave() {
    rotateX.set(0);
    rotateY.set(0);
    glowX.set(50);
    glowY.set(50);
  }

  const glowBackground = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, rgba(245,158,11,0.35), transparent 60%)`;

  return (
    <div className="perspective-1000 w-full max-w-sm mx-auto">
      <motion.div
        ref={ref}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{ rotateX, rotateY }}
        className="preserve-3d relative rounded-[28px] bg-ink p-7 shadow-card cursor-grab active:cursor-grabbing"
        initial={{ opacity: 0, y: 30, rotateX: 8, rotateY: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Glow that follows pointer, mimicking light hitting a glossy card */}
        <motion.div
          className="absolute inset-0 rounded-[28px] pointer-events-none"
          style={{ background: glowBackground }}
        />

        {/* Floating depth layer 1: subtle grid texture */}
        <div
          className="absolute inset-0 rounded-[28px] opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        <div className="relative flex items-center justify-between mb-5" style={{ transform: "translateZ(20px)" }}>
          <div>
            <p className="text-white/50 text-xs font-medium uppercase tracking-widest">Loyalty Pass</p>
            <p className="text-white font-display font-semibold text-lg">Chill Bites Nohar</p>
          </div>
          <span className="text-2xl">🍔</span>
        </div>

        {/* QR plate, raised in Z-space for parallax depth */}
<motion.div
  className="relative bg-white rounded-2xl p-4 flex items-center justify-center overflow-hidden"
  style={{ transform: "translateZ(40px)" }}
>
  <img
    src="/gallery/1.png"
    alt="QR"
    className="w-full h-auto object-contain rounded-xl select-none pointer-events-none"
    draggable={false}
  />
</motion.div>

        <p
          className="relative text-center text-white/60 text-xs font-medium mt-4 tracking-wide"
          style={{ transform: "translateZ(20px)" }}
        >
         
        </p>
      </motion.div>
    </div>
  );
}
