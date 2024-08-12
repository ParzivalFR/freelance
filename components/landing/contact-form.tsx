"use client";

import { zodResolver } from "@hookform/resolvers/zod";
// import { useState } from "react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Loader from "../loader";
import { BorderBeam } from "../magicui/border-beam";
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

const formSchema = z.object({
  firstName: z
    .string()
    .min(3, { message: "Votre prénom doit contenir au moins 3 caractères." }),
  lastName: z
    .string()
    .min(3, { message: "Votre nom doit contenir au moins 3 caractères." }),
  email: z
    .string()
    .email({ message: "Veuillez entrer une adresse email valide." }),
  message: z.string().min(10, {
    message: "Votre message doit contenir au moins 10 caractères.",
  }),
  files: z.array(z.instanceof(File)).optional(),
});

export default function ContactForm() {
  const ref = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      message: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        ref.current?.reset();
        toast.success("Votre message a bien été envoyé !");
        setSubmitting(false);
      } else {
        toast.error("Une erreur s'est produite. Veuillez réessayer.");
      }
    } catch (error) {
      toast.error("Une erreur s'est produite. Veuillez réessayer.");
    }
  }

  return (
    <section id="contact">
      <div className="px-4 py-14">
        <div className="mx-auto max-w-5xl text-center">
          <h4 className="text-xl font-bold tracking-tight text-black dark:text-white">
            Contact
          </h4>
          <h2 className="text-4xl font-bold tracking-tight text-black dark:text-white sm:text-6xl">
            Discutons ensemble
          </h2>
          <p className="mt-6 text-xl leading-8 text-black/80 dark:text-white">
            Vous avez une question ou une demande particulière ? N'hésitez pas à
            me contacter en remplissant le formulaire ci-dessous.
          </p>
        </div>
        <div className="relative mx-auto my-12 flex w-full max-w-xl flex-col items-center justify-center rounded-md bg-secondary/20 p-8">
          <BorderBeam className="z-[-100] " />
          <Form {...form}>
            <form
              ref={ref}
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-6"
            >
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="text-red-500">*</span> Prénom
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-1/2">
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="text-red-500">*</span> Nom
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className="text-red-500">*</span> Email
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className="text-red-500">*</span> Message
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="Votre message ..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-end">
                {submitting ? (
                  <Button
                    type="button"
                    className="space-x-2 ring-4 ring-primary/20 transition duration-300 hover:bg-foreground/70"
                  >
                    <Loader />
                    <span>Envoi en cours...</span>
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="ring-4 ring-primary/20 transition duration-300 hover:bg-foreground/70"
                  >
                    Envoyer
                  </Button>
                )}
              </div>
              <div className="text-end text-xs italic text-muted-foreground">
                <span className="text-red-500">*</span> Champs obligatoires pour
                le traitement de votre demande. Les informations collectées sont
                à usage exclusif et ne seront en aucun cas transmises à des
                tiers.
              </div>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}
