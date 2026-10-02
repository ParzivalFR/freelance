"use client";

import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useState } from "react";

export type HeroShot = { id: string; title: string; image: string; url: string };

// Place, inclinaison et profondeur de chaque capture dans l'éventail.
const layout = [
  { pos: "left-0 top-[4%] w-[74%]", rotate: -5, depth: 20 },
  { pos: "right-0 top-[30%] w-[66%]", rotate: 4, depth: 70 },
  { pos: "bottom-0 left-[10%] w-[58%]", rotate: -2, depth: 120 },
];

const spring = { stiffness: 140, damping: 18, mass: 0.6 };

function Shot({
  shot,
  index,
  mx,
  my,
  hovered,
  setHovered,
  still,
}: {
  shot: HeroShot;
  index: number;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  hovered: number | null;
  setHovered: (i: number | null) => void;
  still: boolean;
}) {
  const { pos, rotate, depth } = layout[index];
  // Plus une capture est proche, plus elle glisse quand la souris bouge.
  const x = useTransform(mx, (v) => v * depth * 0.45);
  const y = useTransform(my, (v) => v * depth * 0.45);
  // Reflet qui suit la souris.
  const gx = useTransform(mx, (v) => 50 + v * 90);
  const gy = useTransform(my, (v) => 50 + v * 90);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.5), transparent 55%)`;
  const isHovered = hovered === index;

  return (
    <motion.a
      href={shot.url || undefined}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={shot.title}
      className={`absolute block rounded-2xl bg-card p-2 shadow-[0_22px_50px_-26px_rgba(30,31,36,0.5)] ${pos}`}
      style={still ? { rotate } : { x, y, z: depth, transformStyle: "preserve-3d" }}
      initial={still ? false : { y: 60, rotate: rotate * 3, scale: 0.9 }}
      animate={{
        filter:
          hovered === null || isHovered
            ? "saturate(1) contrast(1)"
            : "saturate(0.3) contrast(0.75)",
        rotate: isHovered ? 0 : rotate,
        scale: isHovered ? 1.08 : 1,
        z: isHovered ? depth + 110 : depth,
        y: 0,
      }}
      transition={{ type: "spring", ...spring, delay: hovered === null ? index * 0.02 : 0 }}
      onHoverStart={() => setHovered(index)}
      onHoverEnd={() => setHovered(null)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={shot.image}
        alt=""
        className="block aspect-[16/10] w-full rounded-[10px] object-cover object-top"
      />
      {!still && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-2 rounded-[10px] mix-blend-soft-light"
          style={{ background: glare }}
        />
      )}
    </motion.a>
  );
}

export default function HeroFan({ shots }: { shots: HeroShot[] }) {
  const still = useReducedMotion() ?? false;
  const [hovered, setHovered] = useState<number | null>(null);
  // Position de la souris dans la scène, de -0.5 à 0.5.
  const mx = useSpring(0, spring);
  const my = useSpring(0, spring);
  const rotateY = useTransform(mx, (v) => v * 22);
  const rotateX = useTransform(my, (v) => v * -16);

  return (
    <div
      className="relative aspect-[1/0.92] w-full max-w-[520px] [perspective:1100px] md:max-w-none"
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
      <motion.div
        className="absolute inset-0"
        style={still ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        {shots.slice(0, layout.length).map((s, i) => (
          <Shot
            key={s.id}
            shot={s}
            index={i}
            mx={mx}
            my={my}
            hovered={hovered}
            setHovered={setHovered}
            still={still}
          />
        ))}
        <span
          className="note note-comment absolute bottom-[7%] right-0 -rotate-[5deg]"
          style={{ transform: "translateZ(150px) rotate(-5deg)" }}
        >
          tout est en ligne
        </span>
      </motion.div>
    </div>
  );
}
