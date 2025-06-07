// components/dashboard/quote-form.tsx
"use client";

import { createQuote } from "@/app/actions/quotes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "sonner";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface QuoteItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unit: string;
}

interface QuoteFormProps {
  clients: Client[];
}

const initialState = {
  message: "",
  errors: {},
};

const defaultItem: Omit<QuoteItem, "id"> = {
  title: "",
  description: "",
  quantity: 1,
  unitPrice: 0,
  unit: "forfait",
};

const units = [
  { value: "forfait", label: "Forfait" },
  { value: "jour", label: "Jour" },
  { value: "heure", label: "Heure" },
  { value: "mois", label: "Mois" },
  { value: "semaine", label: "Semaine" },
  { value: "unité", label: "Unité" },
];

export function QuoteForm({ clients }: QuoteFormProps) {
  const [state, dispatch] = useFormState(createQuote, initialState);
  const [items, setItems] = useState<QuoteItem[]>([
    { id: crypto.randomUUID(), ...defaultItem },
  ]);
  const [taxRate, setTaxRate] = useState(20);
  const [selectedClientId, setSelectedClientId] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Calculs automatiques
  const subtotalHT = items.reduce((sum, item) => {
    return sum + item.quantity * item.unitPrice;
  }, 0);
  const taxAmount = (subtotalHT * taxRate) / 100;
  const totalTTC = subtotalHT + taxAmount;

  // Afficher le toast de succès et réinitialiser le formulaire
  useEffect(() => {
    if (state?.message && !state?.errors) {
      toast.success(state.message);
      formRef.current?.reset();
      setItems([{ id: crypto.randomUUID(), ...defaultItem }]);
      setTaxRate(20);
      setSelectedClientId("");
    }
  }, [state?.message]);

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), ...defaultItem }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = (formData: FormData) => {
    // Ajouter les items et autres données au FormData
    formData.set("items", JSON.stringify(items));
    formData.set("taxRate", taxRate.toString());
    formData.set("clientId", selectedClientId);

    dispatch(formData);
  };

  // Calculer la date de validité par défaut (30 jours)
  const defaultValidUntil = new Date();
  defaultValidUntil.setDate(defaultValidUntil.getDate() + 30);
  const validUntilString = defaultValidUntil.toISOString().split("T")[0];

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Informations générales */}
      <Card>
        <CardHeader>
          <CardTitle>Nouveau Devis</CardTitle>
          <CardDescription>
            Créez un nouveau devis pour un client
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clientId">
                Client <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedClientId}
                onValueChange={setSelectedClientId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.firstName} {client.lastName} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state?.errors?.clientId && (
                <div className="text-sm text-red-500">
                  {state.errors.clientId.map((error: string) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">
                Titre du devis <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Site vitrine pour entreprise"
                required
              />
              {state?.errors?.title && (
                <div className="text-sm text-red-500">
                  {state.errors.title.map((error: string) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Description générale du projet..."
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="validUntil">Date de validité</Label>
              <Input
                id="validUntil"
                name="validUntil"
                type="date"
                defaultValue={validUntilString}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxRate">Taux de TVA (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items du devis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Prestations</CardTitle>
              <CardDescription>
                Détaillez les prestations incluses dans ce devis
              </CardDescription>
            </div>
            <Button type="button" onClick={addItem} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-4 p-4 border rounded-lg"
            >
              <div className="col-span-12 sm:col-span-4">
                <Label>Titre de la prestation *</Label>
                <Input
                  placeholder="Développement frontend"
                  value={item.title}
                  onChange={(e) => updateItem(item.id, "title", e.target.value)}
                  required
                />
              </div>

              <div className="col-span-12 sm:col-span-8">
                <Label>Description</Label>
                <Input
                  placeholder="Développement de l'interface utilisateur..."
                  value={item.description}
                  onChange={(e) =>
                    updateItem(item.id, "description", e.target.value)
                  }
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <Label>Quantité</Label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(
                      item.id,
                      "quantity",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <Label>Unité</Label>
                <Select
                  value={item.unit}
                  onValueChange={(value) => updateItem(item.id, "unit", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-6 sm:col-span-3">
                <Label>Prix unitaire HT (€)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) =>
                    updateItem(
                      item.id,
                      "unitPrice",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <Label>Total HT (€)</Label>
                <Input
                  type="text"
                  value={(item.quantity * item.unitPrice).toFixed(2)}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="col-span-12 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {state?.errors?.items && (
            <div className="text-sm text-red-500">
              {state.errors.items.map((error: string) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Récapitulatif des totaux */}
      <Card>
        <CardHeader>
          <CardTitle>Récapitulatif</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Sous-total HT :</span>
              <span className="font-medium">{subtotalHT.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span>TVA ({taxRate}%) :</span>
              <span className="font-medium">{taxAmount.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg font-bold">
              <span>Total TTC :</span>
              <span>{totalTTC.toFixed(2)} €</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Conditions</CardTitle>
          <CardDescription>
            Spécifiez les conditions de paiement et de livraison
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paymentTerms">Conditions de paiement</Label>
            <Textarea
              id="paymentTerms"
              name="paymentTerms"
              placeholder="Paiement à 30 jours fin de mois..."
              defaultValue="Acompte de 30% à la commande, solde à la livraison."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryTerms">Conditions de livraison</Label>
            <Textarea
              id="deliveryTerms"
              name="deliveryTerms"
              placeholder="Livraison sous 4 semaines..."
              defaultValue="Délai de réalisation : 4 à 6 semaines à compter de la réception de l'acompte."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes additionnelles</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Informations complémentaires..."
              className="min-h-[100px]"
            />
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
              Créer le devis
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
