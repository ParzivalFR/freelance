"use client";

import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

const spring = { stiffness: 120, damping: 20, mass: 0.7 };

// Étiquettes qui flottent autour du logo, chacune à sa profondeur.
const notes = [
  { text: "// vos projets", pos: "left-[8%] top-[18%]", depth: 140, rotate: -6 },
  { text: "// vos devis", pos: "right-[10%] top-[28%]", depth: 60, rotate: 5 },
  { text: "// vos bots", pos: "left-[14%] bottom-[24%]", depth: 90, rotate: 4 },
  { text: "// tout au même endroit", pos: "right-[16%] bottom-[20%]", depth: 170, rotate: -3 },
];

// Panneau sombre de la page de connexion : le logo se dessine trait par trait,
// puis toute la scène s'incline en 3D en suivant la souris.
export default function AuthVisual() {
  const still = useReducedMotion() ?? false;
  const mx = useSpring(0, spring);
  const my = useSpring(0, spring);
  const rotateY = useTransform(mx, (v) => v * 26);
  const rotateX = useTransform(my, (v) => v * -20);
  const gx = useTransform(mx, (v) => 50 + v * 70);
  const gy = useTransform(my, (v) => 50 + v * 70);
  const glow = useMotionTemplate`radial-gradient(520px circle at ${gx}% ${gy}%, rgba(218,223,207,0.22), transparent 70%)`;

  return (
    <div
      className="relative hidden w-1/2 overflow-hidden bg-[#1e1f24] text-white [perspective:1200px] lg:block"
      onPointerMove={(e) => {
        if (still || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      {/* Trame de points */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: "radial-gradient(#dadfcf 1px, transparent 1.2px)",
          backgroundSize: "26px 26px",
        }}
      />
      {/* Lueur qui suit la souris */}
      <motion.div aria-hidden className="absolute inset-0" style={{ background: glow }} />

      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={still ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        <div
          className="absolute left-1/2 top-[46%] w-[44%] max-w-[300px]"
          style={{ transform: "translate(-50%, -50%) translateZ(40px)" }}
        >
          <svg viewBox="0 0 100 100" fill="none" className="w-full overflow-visible">
            <motion.path
              d="M82 22 H36 Q20 22 20 38 V62 Q20 78 36 78 H82 V52 H70"
              stroke="#ffffff"
              strokeWidth="13"
              initial={still ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: [0.65, 0, 0.35, 1], delay: 0.15 }}
            />
            <motion.path
              d="M42.5 66 V41 H58"
              stroke="#dadfcf"
              strokeWidth="10"
              initial={still ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1], delay: 1.5 }}
            />
          </svg>
        </div>

        {notes.map((n, i) => (
          <motion.span
            key={n.text}
            className={`absolute whitespace-nowrap rounded-lg bg-[#dadfcf] px-3 py-1.5 font-[family-name:var(--font-jetbrains)] text-[13px] text-[#4a5a3a] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.7)] ${n.pos}`}
            style={{ z: n.depth, rotate: n.rotate }}
            initial={still ? false : { scale: 0.6, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", ...spring, delay: 1.9 + i * 0.12 }}
          >
            {n.text}
          </motion.span>
        ))}
      </motion.div>

      <p className="absolute bottom-10 left-10 max-w-[18ch] font-[family-name:var(--font-bricolage)] text-[clamp(1.6rem,2.6vw,2.4rem)] font-bold leading-[1.1] tracking-tight">
        Votre projet, suivi de près.
      </p>
    </div>
  );
}
