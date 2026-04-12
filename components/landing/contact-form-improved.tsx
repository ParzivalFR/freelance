"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Loader2, Lock, Send } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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
  { value: "e-commerce", label: "E-commerce" },
  { value: "application-web", label: "Application web" },
  { value: "refonte", label: "Refonte de site" },
  { value: "maintenance", label: "Maintenance" },
  { value: "autre", label: "Autre" },
];

const budgetRanges = [
  { value: "500-1500", label: "500€ - 1 500€" },
  { value: "1500-3000", label: "1 500€ - 3 000€" },
  { value: "3000-5000", label: "3 000€ - 5 000€" },
  { value: "5000+", label: "5 000€ +" },
  { value: "a-discuter", label: "À discuter" },
];

const perks = [
  { icon: Clock, text: "Réponse sous 24h garantie" },
  { icon: CheckCircle, text: "Devis gratuit et sans engagement" },
  { icon: Lock, text: "Vos données restent confidentielles" },
];

export default function ContactFormImproved() {
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
      toast.success("Message envoyé avec succès ! Je vous recontacte rapidement.");
      form.reset();
    } catch (error) {
      toast.error("Erreur lors de l'envoi. Veuillez réessayer.");
    }
  }

  return (
    <section id="contact" className="py-16">
      <div className="container mx-auto px-4">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <p className="font-[family-name:var(--font-handwriting)] text-2xl text-[#7158ff]">
            Contact
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3.5rem)] uppercase leading-none text-foreground">
            Parlons de votre projet
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Décrivez-moi votre vision. Je vous réponds sous 24h avec une proposition claire.
          </p>
        </motion.div>

        {/* 2-col layout */}
        <div className="mx-auto max-w-5xl grid grid-cols-1 gap-12 lg:grid-cols-5">

          {/* Left — infos */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex flex-col gap-8 lg:col-span-2"
          >
            <div>
              <p className="font-[family-name:var(--font-display)] text-2xl uppercase leading-none text-foreground">
                Une idee ?<br />
                <span className="text-[#7158ff]">Ecrivons-la.</span>
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Que ce soit une landing page, une appli web ou une refonte complète — dis-moi ce que tu as en tête. Pas de jargon, pas de prise de tête.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {perks.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#7158ff]/10">
                    <Icon className="size-4 text-[#7158ff]" />
                  </div>
                  <span className="text-sm text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5 rounded-2xl border p-8"
              >
                {/* Nom + Prénom */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom *</FormLabel>
                        <FormControl>
                          <Input placeholder="Jean" {...field} className="focus-visible:ring-[#7158ff]" />
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
                        <FormLabel>Nom *</FormLabel>
                        <FormControl>
                          <Input placeholder="Dupont" {...field} className="focus-visible:ring-[#7158ff]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Email + Entreprise */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="jean@exemple.fr" {...field} className="focus-visible:ring-[#7158ff]" />
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
                        <FormLabel>Entreprise <span className="text-muted-foreground">(optionnel)</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Mon Entreprise" {...field} className="focus-visible:ring-[#7158ff]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Type + Budget */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="projectType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de projet *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="focus:ring-[#7158ff]">
                              <SelectValue placeholder="Sélectionnez" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {projectTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget envisagé *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="focus:ring-[#7158ff]">
                              <SelectValue placeholder="Sélectionnez" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {budgetRanges.map((range) => (
                              <SelectItem key={range.value} value={range.value}>
                                {range.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Message */}
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Décrivez votre projet *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Parlez-moi de votre vision, vos objectifs, vos contraintes techniques, délais souhaités..."
                          className="min-h-[120px] focus-visible:ring-[#7158ff]"
                          {...field}
                        />
                      </FormControl>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <FormMessage />
                        <span>{field.value?.length || 0}/1000</span>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isMutating}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#7158ff] text-base font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-50"
                >
                  {isMutating ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      Envoyer ma demande
                    </>
                  )}
                </button>
              </form>
            </Form>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
