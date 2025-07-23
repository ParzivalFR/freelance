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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

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
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isChanging, setIsChanging] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Auto-rotation des projets
  useEffect(() => {
    if (projects.length === 0) return;

    const timer = setInterval(() => {
      if (!isChanging) {
        setIsChanging(true);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
        setTimeout(() => setIsChanging(false), 500);
      }
    }, collapseDelay);

    return () => clearInterval(timer);
  }, [collapseDelay, currentIndex, isChanging, projects.length]);


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
          
          <div className="mx-auto my-12 w-full max-w-5xl">
            {/* Image en haut */}
            <div className="mb-8 flex justify-center">
              <div className="relative w-full max-w-3xl">
                <AnimatePresence mode="wait">
                  {projects[currentIndex]?.image ? (
                    <motion.img
                      key={projects[currentIndex].id}
                      src={projects[currentIndex].image}
                      alt={projects[currentIndex].title}
                      className="aspect-video w-full rounded-xl border border-neutral-300/50 object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                  ) : (
                    <div className="aspect-video w-full">
                      <Skeleton className="size-full rounded-xl" />
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Carousel Shadcn avec accordéons */}
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {projects.map((project, index) => (
                  <CarouselItem key={project.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                    <Accordion.Root
                      type="single"
                      value={currentIndex === index ? `item-${index}` : ""}
                      onValueChange={(value) => {
                        if (value) {
                          const idx = Number(value.split("-")[1]);
                          setCurrentIndex(idx);
                        }
                      }}
                    >
                      <AccordionItem
                        className="relative cursor-pointer rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors shadow-sm"
                        value={`item-${index}`}
                        onClick={() => setCurrentIndex(index)}
                      >
                        <div
                          className="absolute left-0 top-0 h-1 w-full overflow-hidden rounded-t-lg bg-neutral-300/50 dark:bg-neutral-300/30"
                        >
                          <div
                            className={`absolute left-0 top-0 h-full ${
                              currentIndex === index ? "w-full" : "w-0"
                            } bg-primary transition-all ease-linear`}
                            style={{
                              transitionDuration:
                                currentIndex === index ? `${collapseDelay}ms` : "0s",
                            }}
                          ></div>
                        </div>
                        
                        <AccordionTrigger className="text-left text-lg font-bold hover:no-underline [&[data-state=open]>svg]:rotate-180">
                          {project.title}
                        </AccordionTrigger>
                        
                        <AccordionContent className="pt-2">
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                            {project.description}
                          </p>
                          
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {project.technologies.slice(0, 3).map((tech, techIndex) => (
                                <span
                                  key={techIndex}
                                  className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                                >
                                  {tech}
                                </span>
                              ))}
                              {project.technologies.length > 3 && (
                                <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                                  +{project.technologies.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                          
                          {project.url && (
                            <a
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 inline-flex items-center text-xs text-primary hover:text-primary/80 transition-colors"
                            >
                              Voir le projet →
                            </a>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion.Root>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};

export function FeatureSectionDB() {
  return <Feature collapseDelay={5000} linePosition="left" ltr />;
}
