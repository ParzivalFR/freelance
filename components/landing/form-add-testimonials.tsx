"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { mutate } from "swr";
import { z } from "zod";
import InputFile from "../input-file";
import Loader from "../loader";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

const TestimonialSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(30, "Le nom ne doit pas dépasser 30 caractères"),
  role: z
    .string()
    .min(2, "Le rôle doit contenir au moins 2 caractères")
    .max(50, "Le rôle ne doit pas dépasser 50 caractères"),
  img: z.any().optional(),
  review: z
    .string()
    .min(10, "Le témoignage doit contenir au moins 10 caractères"),
});

const fetcher = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error("An error occurred while fetching the data.");
  return res.json();
};

export default function AddTestimonialsForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof TestimonialSchema>>({
    resolver: zodResolver(TestimonialSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      role: "",
      review: "",
    },
  });

  const onSubmit = useCallback(
    async (values: z.infer<typeof TestimonialSchema>) => {
      setIsSubmitting(true);

      const uploadImage = async (img: File) => {
        const formData = new FormData();
        formData.append("file", img);
        const imageData = await fetcher("/api/avatar", {
          method: "POST",
          body: formData,
        });
        return imageData.url;
      };

      try {
        let imageUrl = "";
        if (values.img instanceof File) {
          imageUrl = await uploadImage(values.img);
        }

        const testimonialData = {
          name: values.name,
          role: values.role,
          img: imageUrl,
          review: values.review,
        };

        await mutate(
          "/api/testimonials",
          async (currentData: any) => {
            const response = await fetcher("/api/testimonials", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(testimonialData),
            });
            return [...(currentData || []), response];
          },
          {
            optimisticData: (currentData) => [
              ...(currentData || []),
              testimonialData,
            ],
            rollbackOnError: true,
            populateCache: true,
            revalidate: false,
          }
        );

        toast.success("Témoignage ajouté avec succès !");
        form.reset();
      } catch (error) {
        toast.error("Erreur lors de l'ajout du témoignage");
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [form]
  );

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          form.handleSubmit(onSubmit)();
        }}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <span className="text-red-500">*</span> Nom / Prénom
              </FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <span className="text-red-500">*</span> Rôle
              </FormLabel>
              <FormControl>
                <Input placeholder="CEO" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="img"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar</FormLabel>
              <FormControl>
                <InputFile onChange={(file) => field.onChange(file)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="review"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <span className="text-red-500">*</span> Témoignage
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Cet entretien a été très intéressant et j'ai apprécié le travail de l'équipe."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="mt-2 flex justify-end">
          <Button
            type="submit"
            className="flex items-center gap-2 ring-4 ring-primary/20 duration-300 ease-in-out hover:bg-foreground/70"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader /> Envoi en cours...
              </>
            ) : (
              "Envoyer"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
