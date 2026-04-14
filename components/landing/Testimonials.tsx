"use client";

import { cn } from "@/lib/utils";
import { ReviewCardProps } from "@/types/ReviewCardTypes";
import { AnimatePresence, motion } from "framer-motion";
import { UserIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";

const DELAY = 5000;

const Avatar = ({ imgUrl, name }: { imgUrl?: string; name: string }) => {
  const [err, setErr] = useState(false);
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#7158ff]/15 overflow-hidden">
      {imgUrl && !err ? (
        <Image
          className="size-full object-cover"
          src={imgUrl}
          alt={name}
          width={40}
          height={40}
          onError={() => setErr(true)}
        />
      ) : (
        <UserIcon className="size-4 text-[#7158ff]" />
      )}
    </div>
  );
};

export function Testimonials() {
  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const { data } = useSWR("/api/testimonials", fetcher);
  const reviews: ReviewCardProps[] = data && Array.isArray(data) ? data : [];

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (i: number) => {
    setIdx(i);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setIdx((prev) => (prev + 1) % reviews.length);
    }, DELAY);
  };

  useEffect(() => {
    if (reviews.length === 0) return;
    if (paused) return;
    intervalRef.current = setInterval(() => {
      setIdx((prev) => (prev + 1) % reviews.length);
    }, DELAY);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [reviews.length, paused]);

  const current = reviews[idx];

  return (
    <section id="testimonials" className="py-20">
      <div className="mx-auto max-w-4xl px-6 md:px-8">

        <div className="mb-16 text-center">
          <p className="font-[family-name:var(--font-handwriting)] text-2xl text-[#7158ff]">
            Temoignages
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3.5rem)] uppercase leading-none text-foreground">
            Ils m'ont fait confiance
          </h2>
        </div>

        {current && (
          <div
            className="relative flex flex-col items-center text-center"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative max-w-2xl px-10"
              >
                {/* Guillemet ouverture */}
                <span
                  aria-hidden
                  className="pointer-events-none select-none absolute -top-8 -left-4 font-[family-name:var(--font-display)] text-[9rem] leading-none text-[#7158ff]/25"
                >
                  "
                </span>

                <blockquote className="relative z-10 text-xl leading-relaxed text-foreground md:text-2xl font-[family-name:var(--font-serif)]">
                  {current.review}
                </blockquote>

                {/* Guillemet fermeture */}
                <span
                  aria-hidden
                  className="pointer-events-none select-none absolute -bottom-14 -right-4 font-[family-name:var(--font-display)] text-[9rem] leading-none text-[#7158ff]/25 rotate-180"
                >
                  "
                </span>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={`author-${idx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="mt-16 flex flex-col items-center gap-2"
              >
                <Avatar imgUrl={current.imgUrl} name={current.name} />
                <p className="text-sm font-semibold text-foreground">{current.name}</p>
                <p className="text-xs text-[#7158ff]/80">{current.role}</p>
              </motion.div>
            </AnimatePresence>

            {reviews.length > 1 && (
              <div className="mt-8 flex items-center gap-2">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={cn(
                      "rounded-full transition-all duration-300",
                      i === idx
                        ? "bg-[#7158ff] w-5 h-1.5"
                        : "bg-muted-foreground/25 hover:bg-muted-foreground/50 size-1.5"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {reviews.length === 0 && (
          <div className="flex flex-col items-center gap-4">
            <div className="size-10 rounded-full bg-muted animate-pulse" />
            <div className="h-4 w-64 rounded bg-muted animate-pulse" />
            <div className="h-4 w-48 rounded bg-muted animate-pulse" />
          </div>
        )}
      </div>
    </section>
  );
}
