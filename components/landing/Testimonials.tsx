"use client";

import Marquee from "@/components/magicui/marquee";
import { cn } from "@/lib/utils";
import { ReviewCardProps } from "@/types/ReviewCardTypes";
import { useOpenModal } from "@/zustand/state-form-testimonials";
import { StarFilledIcon } from "@radix-ui/react-icons";
import { UserIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import useSWR from "swr";
import AvatarCircles from "../magicui/avatar-circle";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import AddTestimonialsForm from "./form-add-testimonials";
import Modal from "./modal";

const ReviewCard = ({
  name,
  role,
  imgUrl,
  review,
  className,
  createdAt,
  ...props
}: ReviewCardProps) => {
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    if (createdAt) {
      const date = new Date(createdAt);
      setFormattedDate(
        `${date.toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`
      );
    }
  }, [createdAt]);

  return (
    <figure
      className={cn(
        "relative w-96 flex flex-col justify-between cursor-pointer overflow-hidden rounded-xl border p-4 transition-all duration-500 ease-in-out",
        // styles par défaut
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
        className
      )}
      {...props}
    >
      <div className="flex flex-row items-center gap-2">
        {imgUrl ? (
          <Image
            className="aspect-square rounded-full"
            width="32"
            height="32"
            alt=""
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
          <p className="text-xs font-medium dark:text-white/40">{role}</p>
        </div>
      </div>

      {/* Review text with animation */}
      <blockquote className="mt-2 max-h-24 overflow-hidden text-sm transition-all duration-500 ease-in-out hover:max-h-64">
        {review}
      </blockquote>

      {createdAt && (
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Créé le {formattedDate}
        </p>
      )}
    </figure>
  );
};

const SkeletonTestimonialCard = () => (
  <div className="mb-4 flex h-auto min-h-[200px] w-full min-w-96 flex-col items-center justify-between gap-6 rounded-xl border border-neutral-200 bg-white p-4 dark:bg-black dark:[border:1px_solid_rgba(255,255,255,.1)]">
    <div className="w-full">
      <Skeleton className="mb-2 h-4 w-full" />
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <div className="flex w-full items-center justify-start gap-5">
      <Skeleton className="size-10 rounded-full" />
      <div>
        <Skeleton className="mb-2 h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  </div>
);

const SkeletonAvatarCircles = ({ count }: { count: number }) => {
  return (
    <div className="z-10 flex -space-x-4 rtl:space-x-reverse">
      {[...Array(count)].map((_, index) => (
        <Skeleton key={index} className="size-10 rounded-full" />
      ))}
    </div>
  );
};

export function Testimonials() {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const {
    data: reviews,
    isLoading,
    error,
  } = useSWR("/api/testimonials", fetcher);
  const { toggleModal } = useOpenModal();

  return (
    <section id="testimonials">
      <div className="py-14">
        <div className="container mx-auto px-4 md:px-8">
          <h3 className="text-center text-xl font-semibold uppercase text-foreground">
            Témoignages
          </h3>
          <h2 className="mt-2 text-center text-4xl font-bold text-neutral-900 dark:text-neutral-100">
            Des projets réussis, des clients satisfaits
          </h2>
          <p className="mt-4 text-center text-lg text-neutral-500 dark:text-neutral-400">
            En tant que développeur freelance passionné, je m'efforce de fournir
            un travail de qualité et une expérience client exceptionnelle. Voici
            quelques retours de mes clients récents.
          </p>
          <div className="relative mt-4 flex h-auto min-h-[300px] w-full flex-col items-center justify-center overflow-hidden">
            <Marquee
              pauseOnHover
              className="flex items-stretch [--duration:30s] sm:[--duration:50s]"
            >
              {reviews &&
                Array.isArray(reviews) &&
                reviews.map((review: ReviewCardProps) => (
                  <ReviewCard key={review.id} {...review} />
                ))}
              {isLoading &&
                [...Array(5)].map((_, i) => (
                  <SkeletonTestimonialCard key={i} />
                ))}
            </Marquee>
            <Marquee
              reverse
              pauseOnHover
              className="flex items-stretch [--duration:20s] sm:[--duration:30s]"
            >
              {reviews &&
                Array.isArray(reviews) &&
                reviews.map((review: ReviewCardProps) => (
                  <ReviewCard key={review.id} {...review} />
                ))}
              {isLoading &&
                [...Array(5)].map((_, i) => (
                  <SkeletonTestimonialCard key={i} />
                ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
          </div>
          <div className="mt-4 flex items-center justify-center">
            <div className="mt-4 flex flex-col items-center justify-center gap-2">
              {isLoading ? (
                <SkeletonAvatarCircles count={5} />
              ) : (
                reviews &&
                Array.isArray(reviews) &&
                reviews.length > 0 && (
                  <AvatarCircles
                    avatarUrls={reviews.map((review: ReviewCardProps) =>
                      review.imgUrl && review.imgUrl !== ""
                        ? review.imgUrl
                        : null
                    )}
                    numPeople={reviews.length}
                  />
                )
              )}
              <Button onClick={() => toggleModal()}>
                Laisser un avis
                <StarFilledIcon className="ml-2 size-4 text-yellow-500" />
              </Button>
              <Modal
                title="Ajouter un témoignage"
                subtitle="Merci pour votre confiance et j'espère que vous avez apprécié le travail fourni."
              >
                <AddTestimonialsForm />
              </Modal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
