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

type CardDataProps = {
  id: number;
  title: string;
  content: string;
  image?: string;
  video?: string;
  link: string;
};

const cardData: CardDataProps[] = [
  {
    id: 1,
    title: "Jazz En Barque",
    content:
      "Jazz En Barque est un festival en sologne qui a lieu chaque année.",
    image:
      "https://syuntuolmcrumibzzxrl.supabase.co/storage/v1/object/public/bucket-oasis/Images/jazz-en-barque-compress.webp",
    link: "https://jazz-en-barque.vercel.app",
  },
  {
    id: 2,
    title: "Stagey",
    content: "Trouve ton stage idéal Facilement et Gratuitement.",
    image:
      "https://syuntuolmcrumibzzxrl.supabase.co/storage/v1/object/public/bucket-oasis/Images/stagey-compress.webp",
    link: "https://stagey.fr",
  },
  {
    id: 3,
    title: "Kitilib",
    content: "Essential Tools for Developers and Designers",
    image:
      "https://syuntuolmcrumibzzxrl.supabase.co/storage/v1/object/public/bucket-oasis/Images/kitilib-compress.webp",
    link: "https://kitilib.com",
  },
  {
    id: 4,
    title: "Portfolio Personnel",
    content:
      "Portfolio personnel pour présenter mes projets et mes compétences.",
    image:
      "https://syuntuolmcrumibzzxrl.supabase.co/storage/v1/object/public/bucket-oasis/Images/portfolio-compress.webp",
    link: "https://www.gael-dev.fr",
  },
];

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

  const carouselRef = useRef<HTMLUListElement>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.5,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isInView) {
        setCurrentIndex(0);
      } else {
        setCurrentIndex(-1);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isInView]);

  useEffect(() => {
    cardData.forEach((item) => {
      if (item.image) {
        const img = new Image();
        img.src = item.image;
      }
    });
  }, []);

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
    const timer = setInterval(() => {
      if (!isChanging) {
        setIsChanging(true);
        setCurrentIndex((prevIndex) =>
          prevIndex !== undefined ? (prevIndex + 1) % cardData.length : 0
        );
        setTimeout(() => setIsChanging(false), 500); // Correspond à la durée de la transition
      }
    }, collapseDelay);

    return () => clearInterval(timer);
  }, [collapseDelay, currentIndex, isChanging]);

  useEffect(() => {
    const handleAutoScroll = () => {
      if (!isChanging) {
        const nextIndex =
          (currentIndex !== undefined ? currentIndex + 1 : 0) % cardData.length;
        scrollToIndex(nextIndex);
      }
    };

    const autoScrollTimer = setInterval(handleAutoScroll, collapseDelay);

    return () => clearInterval(autoScrollTimer);
  }, [collapseDelay, currentIndex, isChanging]);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      const handleScroll = () => {
        const scrollLeft = carousel.scrollLeft;
        const cardWidth = carousel.querySelector(".card")?.clientWidth || 0;
        const newIndex = Math.min(
          Math.floor(scrollLeft / cardWidth),
          cardData.length - 1
        );
        setCurrentIndex(newIndex);
      };

      carousel.addEventListener("scroll", handleScroll);
      return () => carousel.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <section ref={ref} id="features">
      <div className="py-14">
        <div className="container flex w-full flex-col items-center justify-center p-4">
          <div className="mx-auto max-w-5xl text-center">
            <h4 className="text-xl font-bold tracking-tight text-black dark:text-white">
              Features
            </h4>
            <h2 className="text-4xl font-bold tracking-tight text-black dark:text-white sm:text-6xl">
              Blazingly fast to help your business grow
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
                {cardData.map((item, index) => (
                  <AccordionItem
                    key={item.id}
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
                      {item.title}
                    </AccordionTrigger>
                    <AccordionContent>{item.content}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion.Root>
            </div>
            <div
              className={`col-span-5 my-auto size-auto  min-h-[200px] md:col-span-3 ${
                ltr && "md:order-1"
              }`}
            >
              <AnimatePresence mode="wait">
                {cardData[currentIndex]?.image ? (
                  <motion.img
                    key={cardData[currentIndex].id}
                    src={cardData[currentIndex].image}
                    alt="feature"
                    className="size-full rounded-xl border border-neutral-300/50 object-cover p-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                ) : cardData[currentIndex]?.video ? (
                  <motion.video
                    key={cardData[currentIndex].id}
                    preload="auto"
                    src={cardData[currentIndex].video}
                    className="aspect-auto size-full rounded-lg object-cover"
                    autoPlay
                    loop
                    muted
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
              {cardData.map((item, index) => (
                <div
                  key={item.id}
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
                  <h2 className="text-xl font-bold">{item.title}</h2>
                  <p className="mx-0 max-w-sm text-balance text-sm">
                    {item.content}
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

export function FeatureSection() {
  return <Feature collapseDelay={5000} linePosition="left" ltr />;
}
