"use client";

import { createClient } from "@/app/actions/clients";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "sonner";

const initialState = {
  message: "",
  errors: {},
};

export function ClientForm() {
  const [state, dispatch] = useFormState(createClient, initialState);
  const [isProfessional, setIsProfessional] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Afficher le toast de succès et réinitialiser le formulaire
  useEffect(() => {
    if (state?.message && !state?.errors) {
      toast.success(state.message);
      formRef.current?.reset();
      setIsProfessional(false);
    }
  }, [state?.message]);

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Nouveau Client</CardTitle>
        <CardDescription>
          Ajouter un nouveau client à votre portefeuille
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                placeholder="John"
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
                placeholder="Doe"
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
                placeholder="john.doe@example.com"
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
                placeholder="+33 6 12 34 56 78"
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

          {/* Adresse (obligatoire si professionnel) */}
          <div className="space-y-2">
            <Label htmlFor="address">
              Adresse{" "}
              {isProfessional && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="address"
              name="address"
              type="text"
              placeholder="123 Rue de la Paix, 75001 Paris"
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
              placeholder="Site vitrine, application web, refonte..."
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
              placeholder="Notes personnelles, remarques, historique..."
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

          {/* Bouton de soumission */}
          <div className="flex justify-end">
            <Button type="submit" className="w-full sm:w-auto">
              Créer le client
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
