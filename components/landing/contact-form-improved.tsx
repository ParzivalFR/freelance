"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Loader2,
  Mail,
  MessageCircle,
  Send,
  User,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWRMutation from "swr/mutation";
import { z } from "zod";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
import { Separator } from "../ui/separator";
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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

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
      toast.success(
        "Message envoyé avec succès ! Je vous recontacte rapidement."
      );
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
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <Badge variant="outline" className="mb-4">
            <Mail className="mr-2 size-4" />
            Contact
          </Badge>
          <h2 className="mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
            Parlons de votre projet
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Décrivez-moi votre vision et vos objectifs. Je vous répondrai sous
            24h avec une proposition personnalisée.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl"
        >
          <Card className="shadow-lg">
            <CardHeader className="pb-8 text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <MessageCircle className="size-5 text-primary" />
                Formulaire de contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Informations personnelles */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <User className="size-4" />
                      Informations personnelles
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prénom *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Jean"
                                {...field}
                                className="transition-all duration-200 focus:scale-[1.02]"
                              />
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
                              <Input
                                placeholder="Dupont"
                                {...field}
                                className="transition-all duration-200 focus:scale-[1.02]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="jean.dupont@exemple.fr"
                                {...field}
                                className="transition-all duration-200 focus:scale-[1.02]"
                              />
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
                            <FormLabel>Entreprise</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Mon Entreprise (optionnel)"
                                {...field}
                                className="transition-all duration-200 focus:scale-[1.02]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Détails du projet */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <MessageCircle className="size-4" />
                      Détails du projet
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="projectType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type de projet *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionnez un type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {projectTypes.map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
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
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionnez un budget" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {budgetRanges.map((range) => (
                                  <SelectItem
                                    key={range.value}
                                    value={range.value}
                                  >
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
                            className="min-h-[120px] transition-all duration-200 focus:scale-[1.01]"
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

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isMutating}
                      className="h-12 w-full text-base font-semibold transition-all duration-200 hover:scale-[1.02] disabled:scale-100"
                    >
                      {isMutating ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 size-4" />
                          Envoyer ma demande
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Footer note */}
                  <div className="border-t pt-4 text-center text-xs text-muted-foreground">
                    <CheckCircle className="mr-1 inline size-3 text-green-500" />
                    Réponse garantie sous 24h • Vos données restent
                    confidentielles
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
