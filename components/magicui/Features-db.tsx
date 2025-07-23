"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { AnimatePresence, motion, useInView } from "framer-motion";
import React, {
  forwardRef,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

type AccordionItemProps = {
  children: React.ReactNode;
  className?: string;
} & Accordion.AccordionItemProps;

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Item
      className={cn(
        "mt-px overflow-hidden focus-within:relative focus-within:z-10",
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      {children}
    </Accordion.Item>
  )
);

AccordionItem.displayName = "AccordionItem";

type AccordionTriggerProps = {
  children: React.ReactNode;
  className?: string;
};

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Header className="flex">
      <Accordion.Trigger
        className={cn(
          "group flex h-[45px] flex-1 cursor-pointer items-center justify-between px-5 text-[15px] leading-none outline-none",
          className
        )}
        {...props}
        ref={forwardedRef}
      >
        {children}
      </Accordion.Trigger>
    </Accordion.Header>
  )
);

AccordionTrigger.displayName = "AccordionTrigger";

type AccordionContentProps = {
  children: ReactNode;
  className?: string;
} & Accordion.AccordionContentProps;

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Content
      className={cn(
        "overflow-hidden text-[15px] font-medium data-[state=closed]:animate-slide-up data-[state=open]:animate-slide-down",
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      <div className="px-5 py-2">{children}</div>
    </Accordion.Content>
  )
);

AccordionContent.displayName = "AccordionContent";

type Project = {
  id: string;
  title: string;
  description: string;
  image: string;
  url: string;
  technologies: string[];
  category: string;
  isPublished: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

type FeatureProps = {
  collapseDelay?: number;
  ltr?: boolean;
  linePosition?: "left" | "right";
};

const Feature = ({
  collapseDelay = 5000,
  ltr = false,
  linePosition = "left",
}: FeatureProps) => {
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isChanging, setIsChanging] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const carouselRef = useRef<HTMLUListElement>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.5,
  });

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects");
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        // Fallback to empty array or show error
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isInView && projects.length > 0) {
        setCurrentIndex(0);
      } else {
        setCurrentIndex(-1);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isInView, projects]);

  useEffect(() => {
    projects.forEach((project) => {
      if (project.image) {
        const img = new Image();
        img.src = project.image;
      }
    });
  }, [projects]);

  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const card = carouselRef.current.querySelectorAll(".card")[index];
      if (card) {
        const cardRect = card.getBoundingClientRect();
        const carouselRect = carouselRef.current.getBoundingClientRect();
        const offset =
          cardRect.left -
          carouselRect.left -
          (carouselRect.width - cardRect.width) / 2;

        carouselRef.current.scrollTo({
          left: carouselRef.current.scrollLeft + offset,
          behavior: "smooth",
        });
      }
    }
  };

  useEffect(() => {
    if (projects.length === 0) return;

    const timer = setInterval(() => {
      if (!isChanging) {
        setIsChanging(true);
        setCurrentIndex((prevIndex) =>
          prevIndex !== undefined ? (prevIndex + 1) % projects.length : 0
        );
        setTimeout(() => setIsChanging(false), 500);
      }
    }, collapseDelay);

    return () => clearInterval(timer);
  }, [collapseDelay, currentIndex, isChanging, projects.length]);

  useEffect(() => {
    const handleAutoScroll = () => {
      if (!isChanging && projects.length > 0) {
        const nextIndex =
          (currentIndex !== undefined ? currentIndex + 1 : 0) % projects.length;
        scrollToIndex(nextIndex);
      }
    };

    const autoScrollTimer = setInterval(handleAutoScroll, collapseDelay);

    return () => clearInterval(autoScrollTimer);
  }, [collapseDelay, currentIndex, isChanging, projects.length]);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel && projects.length > 0) {
      const handleScroll = () => {
        const scrollLeft = carousel.scrollLeft;
        const cardWidth = carousel.querySelector(".card")?.clientWidth || 0;
        const newIndex = Math.min(
          Math.floor(scrollLeft / cardWidth),
          projects.length - 1
        );
        setCurrentIndex(newIndex);
      };

      carousel.addEventListener("scroll", handleScroll);
      return () => carousel.removeEventListener("scroll", handleScroll);
    }
  }, [projects.length]);

  if (isLoading) {
    return (
      <section ref={ref} id="features">
        <div className="py-14">
          <div className="container flex w-full flex-col items-center justify-center p-4">
            <div className="mx-auto max-w-5xl text-center">
              <h4 className="text-xl font-bold tracking-tight text-black dark:text-white">
                Créations
              </h4>
              <h2 className="text-4xl font-bold tracking-tight text-black dark:text-white sm:text-6xl">
                Découvrez les projets réalisés
              </h2>
            </div>
            <div className="mx-auto my-12 grid h-full max-w-5xl grid-cols-5 gap-x-10">
              <div className="col-span-2 hidden justify-start md:flex">
                <Skeleton className="h-[400px] w-[300px] rounded-xl" />
              </div>
              <div className="col-span-5 my-auto md:col-span-3">
                <Skeleton className="h-[400px] w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section ref={ref} id="features">
        <div className="py-14">
          <div className="container flex w-full flex-col items-center justify-center p-4">
            <div className="mx-auto max-w-5xl text-center">
              <h4 className="text-xl font-bold tracking-tight text-black dark:text-white">
                Créations
              </h4>
              <h2 className="text-4xl font-bold tracking-tight text-black dark:text-white sm:text-6xl">
                Découvrez les projets réalisés
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Les projets seront bientôt disponibles...
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} id="features">
      <div className="py-14">
        <div className="container flex w-full flex-col items-center justify-center p-4">
          <div className="mx-auto max-w-5xl text-center">
            <h4 className="text-xl font-bold tracking-tight text-black dark:text-white">
              Créations
            </h4>
            <h2 className="text-4xl font-bold tracking-tight text-black dark:text-white sm:text-6xl">
              Découvrez les projets réalisés
            </h2>
          </div>
          <div className="mx-auto my-12 grid h-full max-w-5xl grid-cols-5 gap-x-10">
            <div
              className={`col-span-2 hidden md:flex ${
                ltr ? "md:order-2 md:justify-end" : "justify-start"
              }`}
            >
              <Accordion.Root
                className="w-[300px]"
                type="single"
                defaultValue={`item-${currentIndex}`}
                value={`item-${currentIndex}`}
                onValueChange={(value) =>
                  setCurrentIndex(Number(value.split("-")[1]))
                }
              >
                {projects.map((project, index) => (
                  <AccordionItem
                    key={project.id}
                    className="relative mb-8 last:mb-0"
                    value={`item-${index}`}
                  >
                    <div
                      className={`absolute inset-y-0 h-full w-0.5 overflow-hidden rounded-lg bg-neutral-300/50 dark:bg-neutral-300/30 ${
                        linePosition === "right"
                          ? "left-auto right-0"
                          : "left-0 right-auto"
                      }`}
                    >
                      <div
                        className={`absolute left-0 top-0 w-full ${
                          currentIndex === index ? "h-full" : "h-0"
                        } origin-top bg-neutral-500 transition-all ease-linear dark:bg-white`}
                        style={{
                          transitionDuration:
                            currentIndex === index
                              ? `${collapseDelay}ms`
                              : "0s",
                        }}
                      ></div>
                    </div>
                    <AccordionTrigger className="text-xl font-bold">
                      {project.title}
                    </AccordionTrigger>
                    <AccordionContent>{project.description}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion.Root>
            </div>
            <div
              className={`col-span-5 my-auto size-auto min-h-[200px] md:col-span-3 ${
                ltr && "md:order-1"
              }`}
            >
              <AnimatePresence mode="wait">
                {projects[currentIndex]?.image ? (
                  <motion.img
                    key={projects[currentIndex].id}
                    src={projects[currentIndex].image}
                    alt="feature"
                    className="size-full rounded-xl border border-neutral-300/50 object-cover p-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                ) : (
                  <div className="relative w-full pb-[56.25%]">
                    <Skeleton className="absolute inset-0 size-full rounded-xl" />
                  </div>
                )}
              </AnimatePresence>
            </div>

            <ul
              ref={carouselRef}
              className="col-span-5 flex h-full snap-x snap-mandatory flex-nowrap overflow-x-auto py-10 [-ms-overflow-style:none] [-webkit-mask-image:linear-gradient(90deg,transparent,black_20%,white_80%,transparent)] [mask-image:linear-gradient(90deg,transparent,black_20%,white_80%,transparent)] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
              style={{
                padding: "50px calc(50%)",
              }}
            >
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className="card relative mr-8 grid h-full max-w-60 shrink-0 items-start justify-center py-4 last:mr-0"
                  onClick={() => setCurrentIndex(index)}
                  style={{
                    scrollSnapAlign: "center",
                  }}
                >
                  <div className="absolute inset-y-0 left-0 right-auto h-0.5 w-full overflow-hidden rounded-lg bg-neutral-300/50 dark:bg-neutral-300/30">
                    <div
                      className={`absolute left-0 top-0 h-full ${
                        currentIndex === index ? "w-full" : "w-0"
                      } origin-top bg-neutral-500 transition-all ease-linear dark:bg-white`}
                      style={{
                        transitionDuration:
                          currentIndex === index ? `${collapseDelay}ms` : "0s",
                      }}
                    ></div>
                  </div>
                  <h2 className="text-xl font-bold">{project.title}</h2>
                  <p className="mx-0 max-w-sm text-balance text-sm">
                    {project.description}
                  </p>
                </div>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export function FeatureSectionDB() {
  return <Feature collapseDelay={5000} linePosition="left" ltr />;
}
