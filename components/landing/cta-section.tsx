"use client";

import Marquee from "@/components/magicui/marquee";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, HeartHandshake, UserIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useSWR from "swr";

// const review = [
//   {
//     name: "Jack",
//     name: "@jack",
//     review: "I've never seen anything like this before. It's amazing. I love it.",
//     imgUrl: "https://avatar.vercel.sh/jack",
//   },
//   {
//     name: "Jill",
//     name: "@jill",
//     review: "I don't know what to say. I'm speechless. This is amazing.",
//     imgUrl: "https://avatar.vercel.sh/jill",
//   },
//   {
//     name: "John",
//     name: "@john",
//     review: "I'm at a loss for words. This is amazing. I love it.",
//     imgUrl: "https://avatar.vercel.sh/john",
//   },
//   {
//     name: "Jane",
//     name: "@jane",
//     review: "I'm at a loss for words. This is amazing. I love it.",
//     imgUrl: "https://avatar.vercel.sh/jane",
//   },
//   {
//     name: "Jenny",
//     name: "@jenny",
//     review: "I'm at a loss for words. This is amazing. I love it.",
//     imgUrl: "https://avatar.vercel.sh/jenny",
//   },
//   {
//     name: "James",
//     name: "@james",
//     review: "I'm at a loss for words. This is amazing. I love it.",
//     imgUrl: "https://avatar.vercel.sh/james",
//   },
// ];

interface Review {
  imgUrl: string;
  name: string;
  review: React.ReactNode | string;
}

const ReviewCard = ({ imgUrl, name, review }: Review) => {
  return (
    <figure
      className={cn(
        "relative w-64 cursor-pointer overflow-hidden rounded-[2rem] border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
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
          <div className="flex size-8 items-center justify-center rounded-full bg-primary">
            <UserIcon className="size-6 text-background" />
          </div>
        )}

        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
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
          <div className="relative flex w-full max-w-[1000px] flex-col items-center justify-center overflow-hidden rounded-[2rem] border p-10 py-14">
            <div className="absolute rotate-[35deg]">
              <Marquee pauseOnHover className="[--duration:30s]" repeat={3}>
                {review.map((review: Review) => (
                  <ReviewCard key={review.name} {...review} />
                ))}
              </Marquee>
              <Marquee
                reverse
                pauseOnHover
                className="[--duration:35s]"
                repeat={3}
              >
                {review.map((review: Review) => (
                  <ReviewCard key={review.name} {...review} />
                ))}
              </Marquee>
              <Marquee pauseOnHover className="[--duration:40s]" repeat={3}>
                {review.map((review: Review) => (
                  <ReviewCard key={review.name} {...review} />
                ))}
              </Marquee>
              <Marquee
                reverse
                pauseOnHover
                className="[--duration:25s]"
                repeat={3}
              >
                {review.map((review: Review) => (
                  <ReviewCard key={review.name} {...review} />
                ))}
              </Marquee>
              <Marquee pauseOnHover className="[--duration:50s]" repeat={3}>
                {review.map((review: Review) => (
                  <ReviewCard key={review.name} {...review} />
                ))}
              </Marquee>
              <Marquee
                reverse
                pauseOnHover
                className="[--duration:35s]"
                repeat={3}
              >
                {review.map((review: Review) => (
                  <ReviewCard key={review.name} {...review} />
                ))}
              </Marquee>
            </div>
            <div className="shadow-2xl z-10 mx-auto size-24 rounded-[2rem] border bg-white/10 p-3 backdrop-blur-md dark:bg-black/10 lg:size-32">
              <HeartHandshake className="mx-auto size-16 text-black dark:text-white lg:size-24" />
            </div>
            <div className="z-10 mt-4 flex flex-col items-center text-center text-black dark:text-white">
              <h1 className="text-3xl font-bold lg:text-4xl">
                Confiez moi votre projet !
              </h1>
              <p className="mt-2">
                Je vais vous aider à concrétiser vos idées avec des solutions
                sur mesure adaptées à vos besoins.
              </p>
              <Button
                className="group mt-6 flex items-center rounded-[2rem] px-6 ring-4 ring-primary/20"
                onClick={() => handleRedirect()}
              >
                Allons-y
                <ArrowRight className="ml-1 size-4 transition-all duration-300 ease-out group-hover:translate-x-3" />
              </Button>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-b from-transparent to-white to-90% dark:to-black" />
          </div>
        </div>
      </div>
    </section>
  );
}
