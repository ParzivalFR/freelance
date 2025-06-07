"use client";

import { updateClient } from "@/app/actions/clients";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "sonner";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  isProfessional: boolean;
  subject?: string | null;
  internalNote?: string | null;
}

interface EditClientDialogProps {
  client: Client;
  children?: React.ReactNode;
}

const initialState = {
  message: "",
  errors: {},
};

export function EditClientDialog({ client, children }: EditClientDialogProps) {
  const [open, setOpen] = useState(false);
  const [isProfessional, setIsProfessional] = useState(client.isProfessional);
  const formRef = useRef<HTMLFormElement>(null);

  // Créer une fonction bound pour ce client spécifique
  const updateClientWithId = updateClient.bind(null, client.id);
  const [state, dispatch] = useFormState(updateClientWithId, initialState);

  // Gérer la fermeture et le toast de succès
  useEffect(() => {
    if (state?.message && !state?.errors) {
      toast.success(state.message);
      setOpen(false);
    }
  }, [state?.message]);

  // Réinitialiser le formulaire quand on ouvre la dialog
  useEffect(() => {
    if (open) {
      setIsProfessional(client.isProfessional);
      // Reset form state
      if (formRef.current) {
        formRef.current.reset();
      }
    }
  }, [open, client.isProfessional]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le client</DialogTitle>
          <DialogDescription>
            Modifiez les informations de {client.firstName} {client.lastName}
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={dispatch} className="space-y-6">
          {/* Informations personnelles */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                Prénom <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                defaultValue={client.firstName}
                required
                aria-describedby="firstName-error"
              />
              {state?.errors?.firstName && (
                <div id="firstName-error" className="text-sm text-red-500">
                  {state.errors.firstName.map((error: string) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Nom <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                defaultValue={client.lastName}
                required
                aria-describedby="lastName-error"
              />
              {state?.errors?.lastName && (
                <div id="lastName-error" className="text-sm text-red-500">
                  {state.errors.lastName.map((error: string) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={client.email}
                required
                aria-describedby="email-error"
              />
              {state?.errors?.email && (
                <div id="email-error" className="text-sm text-red-500">
                  {state.errors.email.map((error: string) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={client.phone || ""}
                aria-describedby="phone-error"
              />
              {state?.errors?.phone && (
                <div id="phone-error" className="text-sm text-red-500">
                  {state.errors.phone.map((error: string) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Type de client */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isProfessional"
              name="isProfessional"
              checked={isProfessional}
              onCheckedChange={(checked) =>
                setIsProfessional(checked as boolean)
              }
            />
            <Label
              htmlFor="isProfessional"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Client professionnel
            </Label>
          </div>

          {/* Adresse */}
          <div className="space-y-2">
            <Label htmlFor="address">
              Adresse{" "}
              {isProfessional && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="address"
              name="address"
              type="text"
              defaultValue={client.address || ""}
              required={isProfessional}
              aria-describedby="address-error"
            />
            {state?.errors?.address && (
              <div id="address-error" className="text-sm text-red-500">
                {state.errors.address.map((error: string) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            )}
          </div>

          {/* Objet de la discussion */}
          <div className="space-y-2">
            <Label htmlFor="subject">Objet de la discussion</Label>
            <Input
              id="subject"
              name="subject"
              type="text"
              defaultValue={client.subject || ""}
              aria-describedby="subject-error"
            />
            {state?.errors?.subject && (
              <div id="subject-error" className="text-sm text-red-500">
                {state.errors.subject.map((error: string) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            )}
          </div>

          {/* Note interne */}
          <div className="space-y-2">
            <Label htmlFor="internalNote">Note interne</Label>
            <Textarea
              id="internalNote"
              name="internalNote"
              defaultValue={client.internalNote || ""}
              className="min-h-[100px]"
              aria-describedby="internalNote-error"
            />
            {state?.errors?.internalNote && (
              <div id="internalNote-error" className="text-sm text-red-500">
                {state.errors.internalNote.map((error: string) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            )}
          </div>

          {/* Message d'erreur global */}
          {state?.message && state?.errors && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{state.message}</div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit">
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
