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
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface QuoteFormProps {
  clients: Client[];
}

const initialState = {
  message: "",
  errors: {},
};

export function QuoteForm({ clients }: QuoteFormProps) {
  const [state, dispatch] = useFormState(createQuote, initialState);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [items, setItems] = useState<QuoteItem[]>([
    { description: "", quantity: 1, unitPrice: 0, totalPrice: 0 },
  ]);
  const [vatRate, setVatRate] = useState(20);
  const formRef = useRef<HTMLFormElement>(null);

  // Calculer les totaux
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const vatAmount = (subtotal * vatRate) / 100;
  const totalAmount = subtotal + vatAmount;

  // Afficher le toast de succès et réinitialiser le formulaire
  useEffect(() => {
    if (state?.message && !state?.errors) {
      toast.success(state.message);
      formRef.current?.reset();
      setSelectedClient("");
      setItems([{ description: "", quantity: 1, unitPrice: 0, totalPrice: 0 }]);
      setVatRate(20);
    }
  }, [state?.message]);

  // Ajouter un item
  const addItem = () => {
    setItems([
      ...items,
      { description: "", quantity: 1, unitPrice: 0, totalPrice: 0 },
    ]);
  };

  // Supprimer un item
  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Mettre à jour un item
  const updateItem = (
    index: number,
    field: keyof QuoteItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculer le total pour cet item si quantity ou unitPrice change
    if (field === "quantity" || field === "unitPrice") {
      newItems[index].totalPrice =
        newItems[index].quantity * newItems[index].unitPrice;
    }

    setItems(newItems);
  };

  // Générer la date de validité par défaut (30 jours)
  const defaultValidUntil = new Date();
  defaultValidUntil.setDate(defaultValidUntil.getDate() + 30);
  const defaultValidUntilString = defaultValidUntil.toISOString().split("T")[0];

  const handleSubmit = (formData: FormData) => {
    // Ajouter les items au FormData
    formData.append("items", JSON.stringify(items));
    dispatch(formData);
  };

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Nouveau Devis</CardTitle>
        <CardDescription>Créer un nouveau devis pour un client</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleSubmit} className="space-y-6">
          {/* Sélection du client */}
          <div className="space-y-2">
            <Label htmlFor="clientId">
              Client <span className="text-red-500">*</span>
            </Label>
            <Select
              name="clientId"
              value={selectedClient}
              onValueChange={setSelectedClient}
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

          {/* Items du devis */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>
                Prestations <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                onClick={addItem}
                variant="outline"
                size="sm"
              >
                <Plus className="mr-2 size-4" />
                Ajouter une ligne
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 items-end gap-3 rounded-lg border p-3"
                >
                  <div className="col-span-5">
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Input
                      id={`description-${index}`}
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, "description", e.target.value)
                      }
                      placeholder="Description de la prestation"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor={`quantity-${index}`}>Quantité</Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 1
                        )
                      }
                      min="1"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor={`unitPrice-${index}`}>
                      Prix unitaire (€)
                    </Label>
                    <Input
                      id={`unitPrice-${index}`}
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "unitPrice",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      min="0"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Total (€)</Label>
                    <Input
                      value={item.totalPrice.toFixed(2)}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="col-span-1">
                    <Button
                      type="button"
                      onClick={() => removeItem(index)}
                      variant="destructive"
                      size="sm"
                      disabled={items.length === 1}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Paramètres du devis */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vatRate">Taux de TVA (%)</Label>
              <Input
                id="vatRate"
                name="vatRate"
                type="number"
                step="0.1"
                value={vatRate}
                onChange={(e) => setVatRate(parseFloat(e.target.value) || 20)}
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil">
                Valide jusqu'au <span className="text-red-500">*</span>
              </Label>
              <Input
                id="validUntil"
                name="validUntil"
                type="date"
                defaultValue={defaultValidUntilString}
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes additionnelles</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Conditions particulières, modalités de paiement..."
              className="min-h-[100px]"
            />
          </div>

          {/* Récapitulatif */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <h3 className="mb-3 font-semibold">Récapitulatif</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Sous-total HT :</span>
                <span>{subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span>TVA ({vatRate}%) :</span>
                <span>{vatAmount.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-lg font-semibold">
                <span>Total TTC :</span>
                <span>{totalAmount.toFixed(2)} €</span>
              </div>
            </div>
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
        </form>
      </CardContent>
    </Card>
  );
}
