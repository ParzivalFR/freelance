"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWRMutation from "swr/mutation";
import { z } from "zod";
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
    .min(2, { message: "Le prénom doit contenir au moins 2 caractères." })
    .max(50, { message: "Le prénom ne peut pas dépasser 50 caractères." }),
  lastName: z
    .string()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères." })
    .max(50, { message: "Le nom ne peut pas dépasser 50 caractères." }),
  email: z
    .string()
    .email({ message: "Veuillez entrer une adresse email valide." }),
  company: z
    .string()
    .max(100, {
      message: "Le nom de l'entreprise ne peut pas dépasser 100 caractères.",
    })
    .optional(),
  projectType: z
    .string()
    .min(1, { message: "Veuillez sélectionner un type de projet." }),
  budget: z.string().min(1, { message: "Veuillez indiquer votre budget." }),
  message: z
    .string()
    .min(20, { message: "Votre message doit contenir au moins 20 caractères." })
    .max(1000, {
      message: "Votre message ne peut pas dépasser 1000 caractères.",
    }),
});

async function sendContactRequest(
  url: string,
  { arg }: { arg: z.infer<typeof formSchema> }
) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  if (!response.ok) throw new Error("Failed to send message");
  return response.json();
}

const projectTypes = [
  { value: "site-vitrine", label: "Site vitrine" },
  { value: "landing-page", label: "Landing page" },
  { value: "application-web", label: "Application web" },
  { value: "application-mobile", label: "Application mobile" },
  { value: "refonte", label: "Refonte de site" },
  { value: "autre", label: "Autre" },
];

const budgetRanges = [
  { value: "moins-500", label: "Moins de 500 €" },
  { value: "500-1500", label: "500 € - 1 500 €" },
  { value: "1500-3000", label: "1 500 € - 3 000 €" },
  { value: "3000-5000", label: "3 000 € - 5 000 €" },
  { value: "5000+", label: "5 000 € et plus" },
  { value: "a-discuter", label: "À discuter" },
];

// <select> natif : le menu de Radix s'ouvre hors de .landing et prendrait
// les couleurs du mode sombre.
const selectClass =
  "h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function ContactSection() {
  const { trigger, isMutating } = useSWRMutation(
    "/api/contact",
    sendContactRequest
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      projectType: "",
      budget: "",
      message: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      await trigger(data);
      toast.success("Message envoyé ! Je vous recontacte rapidement.");
      form.reset();
    } catch {
      toast.error("Erreur lors de l'envoi. Veuillez réessayer.");
    }
  }

  return (
    <section id="contact" className="scroll-mt-24 pb-16 md:pb-28">
      <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-10 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <h2 className="text-[clamp(2.2rem,5.4vw,3.8rem)] font-extrabold leading-[1.06]">
            Vous avez une idée ? <span className="hl">Racontez-moi.</span>
          </h2>
          <p className="mt-5 max-w-[44ch] text-lg text-muted-foreground">
            Trois lignes suffisent. Pas de jargon, pas de prise de tête.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="note note-comment">réponse sous 24 h</span>
            <span className="note note-comment">devis gratuit</span>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 rounded-[28px] border bg-card p-6 md:p-8"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input autoComplete="given-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input autoComplete="family-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Entreprise{" "}
                      <span className="font-normal text-muted-foreground">(optionnel)</span>
                    </FormLabel>
                    <FormControl>
                      <Input autoComplete="organization" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="projectType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de projet</FormLabel>
                    <FormControl>
                      <select className={selectClass} {...field}>
                        <option value="" disabled>
                          Sélectionnez
                        </option>
                        {projectTypes.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget envisagé</FormLabel>
                    <FormControl>
                      <select className={selectClass} {...field}>
                        <option value="" disabled>
                          Sélectionnez
                        </option>
                        {budgetRanges.map((b) => (
                          <option key={b.value} value={b.value}>
                            {b.label}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Votre projet</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Votre activité, ce que vous attendez du site, votre délai idéal"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <FormMessage />
                    <span className="ml-auto">{field.value?.length || 0}/1000</span>
                  </div>
                </FormItem>
              )}
            />

            <button
              type="submit"
              disabled={isMutating}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isMutating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                "Envoyer ma demande"
              )}
            </button>
          </form>
        </Form>
      </div>
    </section>
  );
}
