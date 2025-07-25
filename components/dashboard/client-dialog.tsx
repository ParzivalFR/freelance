"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const clientSchema = z.object({
  firstName: z.string().min(1, "Le prénom est obligatoire"),
  lastName: z.string().min(1, "Le nom est obligatoire"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  address: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url("URL invalide").optional().or(z.literal("")),
  isProfessional: z.boolean().default(false),
  status: z
    .enum(["prospect", "active", "inactive", "archived"])
    .default("prospect"),
  subject: z.string().optional(),
  internalNote: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  website?: string;
  isProfessional: boolean;
  status: string;
  subject?: string;
  internalNote?: string;
}

interface ClientDialogProps {
  client?: Client;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function ClientDialog({
  client,
  onSuccess,
  trigger,
}: ClientDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEditing = !!client;

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      company: "",
      website: "",
      isProfessional: false,
      status: "prospect",
      subject: "",
      internalNote: "",
    },
  });

  // Remplir le formulaire avec les données du client en mode édition
  useEffect(() => {
    if (client && open) {
      form.reset({
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone || "",
        address: client.address || "",
        company: client.company || "",
        website: client.website || "",
        isProfessional: client.isProfessional,
        status: client.status as any,
        subject: client.subject || "",
        internalNote: client.internalNote || "",
      });
    } else if (!client && open) {
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        company: "",
        website: "",
        isProfessional: false,
        status: "prospect",
        subject: "",
        internalNote: "",
      });
    }
  }, [client, open, form]);

  const onSubmit = async (data: ClientFormData) => {
    setLoading(true);
    try {
      const url = isEditing
        ? `/api/admin/clients/${client.id}`
        : "/api/admin/clients";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la sauvegarde");
      }

      setOpen(false);
      onSuccess();
      form.reset();
    } catch (error: any) {
      console.error("Erreur:", error);
      alert(error.message || "Erreur lors de la sauvegarde du client");
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button>
      <Plus className="mr-2 size-4" />
      Nouveau Client
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier le client" : "Nouveau client"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Informations personnelles
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom *</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
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
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john.doe@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="+33 1 23 45 67 89" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un statut" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="prospect">Prospect</SelectItem>
                          <SelectItem value="active">Actif</SelectItem>
                          <SelectItem value="inactive">Inactif</SelectItem>
                          <SelectItem value="archived">Archivé</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="123 Rue de la Paix, 75001 Paris"
                        className="min-h-[60px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Informations professionnelles */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Informations professionnelles
              </h3>

              <FormField
                control={form.control}
                name="isProfessional"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Client professionnel
                      </FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Ce client représente une entreprise ou organisation
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entreprise</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site web</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Informations projet */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Informations projet
              </h3>

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sujet/Objet</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Création d'un site e-commerce"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="internalNote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes internes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notes privées sur ce client..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isEditing ? "Mettre à jour" : "Créer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
