"use client";

import Marquee from "@/components/magicui/marquee";
import { cn } from "@/lib/utils";
import { useOpenModal } from "@/zustand/state-form-testimonials";
import { StarFilledIcon } from "@radix-ui/react-icons";
import { Star, UserIcon } from "lucide-react";
import Image from "next/image";
import useSWR from "swr";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import AddTestimonialsForm from "./form-add-testimonials";
import Modal from "./modal";

export interface TestimonialCardProps {
  name: string;
  role: string;
  imgUrl?: string;
  review: React.ReactNode;
  className?: string;
  createdAt?: string; // Ajoutez cette ligne
  [key: string]: any;
}

export const TestimonialCard = ({
  review,
  name,
  imgUrl,
  role,
  className,
  createdAt, // Destructurez createdAt ici
  ...props // Capture le reste des props
}: TestimonialCardProps) => (
  <div
    className={cn(
      "mb-4 flex w-full cursor-pointer break-inside-avoid flex-col items-center justify-between gap-6 rounded-xl p-4",
      "border border-neutral-200 bg-white",
      "dark:bg-black dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      className
    )}
    {...props}
  >
    <div className="select-none text-sm font-normal text-neutral-700 dark:text-neutral-400">
      {review}
      <div className="flex flex-row py-1">
        {[...Array(5)].map((_, i) => (
          <StarFilledIcon key={i} className="size-4 text-yellow-500" />
        ))}
      </div>
    </div>

    <div className="flex w-full select-none items-center justify-start gap-5">
      {imgUrl ? (
        <Image
          src={imgUrl}
          className="h-10 w-10 rounded-full ring-1 ring-border ring-offset-4"
          width={40}
          height={40}
          alt={`Photo de ${name}`}
        />
      ) : (
        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
          <UserIcon className="h-6 w-6 text-gray-500" />
        </div>
      )}

      <div>
        <p className="font-medium text-neutral-500">{name}</p>
        <p className="text-xs font-normal text-neutral-400">{role}</p>
        {createdAt && (
          <p className="text-[10px] text-neutral-400">
            Créé le {new Date(createdAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  </div>
);

export default function SocialProofTestimonials() {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const {
    data: testimonials,
    error,
    isLoading,
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
          <div className="relative mt-6 max-h-[650px] overflow-hidden">
            <div className="gap-4 mx-auto sm:columns-2 md:columns-3 xl:columns-5">
              {isLoading || testimonials.length === 0 ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Marquee
                      vertical
                      key={i}
                      className={cn({
                        "[--duration:60s]": i === 1,
                        "[--duration:30s]": i === 2,
                        "[--duration:70s]": i === 3,
                      })}
                    >
                      {Array(3)
                        .fill(0)
                        .map((_, j) => (
                          <SkeletonTestimonialCard key={`skeleton-${i}-${j}`} />
                        ))}
                    </Marquee>
                  ))
              ) : testimonials && testimonials.length > 0 ? (
                // Calculer le nombre de colonnes en fonction du nombre total de témoignages
                Array(Math.min(6, Math.ceil(testimonials.length / 3)))
                  .fill(0)
                  .map((_, i) => (
                    <Marquee
                      vertical
                      key={i}
                      className={cn({
                        "[--duration:60s]": i === 1,
                        "[--duration:30s]": i === 2,
                        "[--duration:70s]": i === 3,
                      })}
                    >
                      {testimonials
                        .filter(
                          (_: TestimonialCardProps, index: number) =>
                            index %
                              Math.min(
                                5,
                                Math.ceil(testimonials.length / 3)
                              ) ===
                            i
                        )
                        .map((testimonial: TestimonialCardProps) => (
                          <TestimonialCard
                            key={testimonial.id}
                            {...testimonial}
                          />
                        ))}
                    </Marquee>
                  ))
              ) : (
                // Afficher un message s'il n'y a pas de témoignages
                <div className="text-center text-lg text-neutral-500 dark:text-neutral-400">
                  Aucun témoignage pour le moment.
                </div>
              )}
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 w-full bg-gradient-to-t from-background from-20%"></div>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 w-full bg-gradient-to-b from-background from-20%"></div>
          </div>
          <div className="flex justify-center items-center">
            <Button onClick={() => toggleModal()}>
              <Star className="mr-2 h-4 w-4" />
              Donner un avis
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
    </section>
  );
}

const SkeletonTestimonialCard = () => (
  <div className="mb-4 flex w-full flex-col items-center justify-between gap-6 rounded-xl p-4 border border-neutral-200 bg-white dark:bg-black dark:[border:1px_solid_rgba(255,255,255,.1)]">
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
