"use client";

import { Marquee } from "@/components/magicui/marquee";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, HeartHandshake, UserIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useSWR from "swr";

interface Review {
  imgUrl: string;
  name: string;
  review: React.ReactNode | string;
}

const ReviewCard = ({ imgUrl, name, review }: Review) => {
  return (
    <figure
      className={cn(
        "relative w-64 cursor-pointer overflow-hidden rounded-2xl border p-4 transition-all duration-300",
        "border-border bg-card hover:border-[#7158ff]/30"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        {imgUrl ? (
          <Image
            className="rounded-full"
            width={32}
            height={32}
            alt="Image Avatar Vercel"
            src={imgUrl}
          />
        ) : (
          <div className="flex size-8 items-center justify-center rounded-full bg-[#7158ff]/20">
            <UserIcon className="size-4 text-[#7158ff]" />
          </div>
        )}
        <div className="flex flex-col">
          <figcaption className="text-sm font-semibold text-foreground">{name}</figcaption>
        </div>
      </div>
      <blockquote className="mt-2 line-clamp-2 text-sm">{review}</blockquote>
    </figure>
  );
};

export default function CallToActionSection() {
  const router = useRouter();
  const handleRedirect = () => {
    router.push("#contact");
  };

  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const {
    data: review,
    error,
    isLoading,
  } = useSWR("/api/testimonials", fetcher);

  if (!review) return null;

  return (
    <section id="cta">
      <div className="py-14">
        <div className="container flex w-full flex-col items-center justify-center p-4">
          <div className="relative flex w-full max-w-[1000px] flex-col items-center justify-center overflow-hidden rounded-4xl border p-10 py-14">
            <div className="absolute rotate-35">
              <Marquee pauseOnHover className="[--duration:30s]" repeat={3}>
                {review &&
                  Array.isArray(review) &&
                  review.map((review: Review) => (
                    <ReviewCard key={review.name} {...review} />
                  ))}
              </Marquee>
              <Marquee
                reverse
                pauseOnHover
                className="[--duration:35s]"
                repeat={3}
              >
                {Array.isArray(review) &&
                  review.map((review: Review) => (
                    <ReviewCard key={review.name} {...review} />
                  ))}
              </Marquee>
              <Marquee pauseOnHover className="[--duration:40s]" repeat={3}>
                {Array.isArray(review) &&
                  review.map((review: Review) => (
                    <ReviewCard key={review.name} {...review} />
                  ))}
              </Marquee>
              <Marquee
                reverse
                pauseOnHover
                className="[--duration:25s]"
                repeat={3}
              >
                {Array.isArray(review) &&
                  review.map((review: Review) => (
                    <ReviewCard key={review.name} {...review} />
                  ))}
              </Marquee>
              <Marquee pauseOnHover className="[--duration:50s]" repeat={3}>
                {Array.isArray(review) &&
                  review.map((review: Review) => (
                    <ReviewCard key={review.name} {...review} />
                  ))}
              </Marquee>
              <Marquee
                reverse
                pauseOnHover
                className="[--duration:35s]"
                repeat={3}
              >
                {Array.isArray(review) &&
                  review.map((review: Review) => (
                    <ReviewCard key={review.name} {...review} />
                  ))}
              </Marquee>
            </div>
            <div className="z-10 mx-auto size-20 rounded-2xl border border-[#7158ff]/30 bg-[#7158ff]/10 p-3 lg:size-28">
              <HeartHandshake className="mx-auto size-full text-[#7158ff]" />
            </div>
            <div className="z-10 mt-5 flex flex-col items-center text-center">
              <p className="font-[family-name:var(--font-handwriting)] text-xl text-[#7158ff]">
                Travaillons ensemble
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3rem)] uppercase leading-none text-foreground">
                Un projet en tete ?
              </h2>
              <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                Décris-moi ton idée — je te réponds sous 24h avec un retour
                honnête et une estimation claire.
              </p>
              <button
                onClick={() => handleRedirect()}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#7158ff] px-6 py-3 font-semibold text-white transition-opacity hover:opacity-85"
              >
                Prendre contact
                <ArrowRight className="size-4" />
              </button>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-full bg-linear-to-b from-transparent to-white to-90% dark:to-black" />
          </div>
        </div>
      </div>
    </section>
  );
}
