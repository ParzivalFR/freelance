"use client";

import Marquee from "@/components/magicui/marquee";
import { cn } from "@/lib/utils";
import { ReviewCardProps } from "@/types/ReviewCardTypes";
import { useOpenModal } from "@/zustand/state-form-testimonials";
import { Star, UserIcon } from "lucide-react";
import Image from "next/image";
import useSWR from "swr";
import AvatarCircles from "../magicui/avatar-circle";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import AddTestimonialsForm from "./form-add-testimonials";
import Modal from "./modal";
import { StarFilledIcon } from "@radix-ui/react-icons";

const ReviewCard = ({
  name,
  role,
  imgUrl,
  review,
  className,
  createdAt,
  ...props
}: ReviewCardProps) => {
  return (
    <figure
      className={cn(
        "relative w-96 flex flex-col justify-between cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
        className
      )}
      {...props}
    >
      <div className="flex flex-row items-center gap-2">
        {imgUrl ? (
          <Image
            className="rounded-full aspect-square"
            width="32"
            height="32"
            alt=""
            src={imgUrl}
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-background" />
          </div>
        )}
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{role}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm flex-grow">{review}</blockquote>
      {createdAt && (
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Créé le {new Date(createdAt).toLocaleDateString()}
        </p>
      )}
    </figure>
  );
};

const SkeletonTestimonialCard = () => (
  <div className="mb-4 flex w-full h-auto min-w-96 min-h-[200px] flex-col items-center justify-between gap-6 rounded-xl p-4 border border-neutral-200 bg-white dark:bg-black dark:[border:1px_solid_rgba(255,255,255,.1)]">
    <div className="w-full">
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <div className="flex w-full items-center justify-start gap-5">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  </div>
);

const SkeletonAvatarCircles = ({ count }: { count: number }) => {
  return (
    <div className="z-10 flex -space-x-4 rtl:space-x-reverse">
      {[...Array(count)].map((_, index) => (
        <Skeleton key={index} className="h-10 w-10 rounded-full" />
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
          <h3 className="text-center uppercase text-xl font-semibold text-foreground">
            Témoignages
          </h3>
          <h2 className="text-center text-4xl font-bold text-neutral-900 dark:text-neutral-100 mt-2">
            Des projets réussis, des clients satisfaits
          </h2>
          <p className="text-center text-lg text-neutral-500 dark:text-neutral-400 mt-4">
            En tant que développeur freelance passionné, je m'efforce de fournir
            un travail de qualité et une expérience client exceptionnelle. Voici
            quelques retours de mes clients récents.
          </p>
          <div className="relative flex h-auto min-h-[300px] w-full flex-col items-center justify-center overflow-hidden mt-4">
            <Marquee
              pauseOnHover
              className="[--duration:30s] sm:[--duration:50s] flex items-stretch"
            >
              {reviews &&
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
              className="[--duration:20s] sm:[--duration:30s] flex items-stretch"
            >
              {reviews &&
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
          <div className="flex justify-center items-center mt-4">
            <div className="flex flex-col justify-center items-center gap-2 mt-4">
              {isLoading ? (
                <SkeletonAvatarCircles count={5} />
              ) : (
                reviews &&
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
                <StarFilledIcon className="text-yellow-500 ml-2 h-4 w-4" />
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
