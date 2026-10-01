"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef } from "react";

export type LandingReview = {
  id: string;
  name: string;
  role: string;
  review: string;
};

export default function ReviewsSection({ reviews }: { reviews: LandingReview[] }) {
  const track = useRef<HTMLDivElement>(null);

  if (reviews.length === 0) return null;

  const slide = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("figure");
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 320) + 18), behavior: "smooth" });
  };

  return (
    <section id="avis" className="scroll-mt-24 pb-16 md:pb-28">
      <div className="mx-auto max-w-[1120px] px-5">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-[clamp(1.9rem,4.4vw,3rem)] font-bold leading-[1.08]">
            Ils en parlent <span className="hl">mieux que moi</span>
          </h2>
          {reviews.length > 3 && (
            <div className="flex gap-2">
              <button
                onClick={() => slide(-1)}
                aria-label="Avis précédents"
                className="grid size-11 place-items-center rounded-full border bg-card transition-colors hover:bg-muted"
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                onClick={() => slide(1)}
                aria-label="Avis suivants"
                className="grid size-11 place-items-center rounded-full border bg-card transition-colors hover:bg-muted"
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* La piste déborde jusqu'au bord de l'écran, alignée sur la colonne de contenu */}
      <div
        ref={track}
        className="flex snap-x snap-mandatory gap-[18px] overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:px-[max(1.25rem,calc((100vw-1120px)/2+1.25rem))] [&::-webkit-scrollbar]:hidden"
      >
        {reviews.map((r) => (
          <figure
            key={r.id}
            className="flex w-[84vw] max-w-[360px] shrink-0 snap-start flex-col justify-between gap-5 rounded-[22px] border bg-card p-6"
          >
            <blockquote className="whitespace-pre-line text-[1.02rem] font-medium leading-relaxed">
              « {r.review.trim()} »
            </blockquote>
            <figcaption className="text-sm">
              <b className="block font-semibold">{r.name.trim()}</b>
              <span className="text-muted-foreground">{r.role.trim()}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
