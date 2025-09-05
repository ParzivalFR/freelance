'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Download, FileText, Building, User } from 'lucide-react';
import { toast } from 'sonner';

interface DevisItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ClientInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
}

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  siret: string;
}

const DevisGenerator: React.FC = () => {
  const [devisNumber, setDevisNumber] = useState(`DEV-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`);
  
  const [client, setClient] = useState<ClientInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
  });
  
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'Gaël RICHARD',
    address: '7 rue du pré de la ramée 44550 Montoir De Bretagne',
    phone: '06 33 36 40 94',
    email: 'hello@gael-dev.fr',
    siret: '93044860000013',
  });
  
  const [items, setItems] = useState<DevisItem[]>([
    {
      id: '1',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    },
  ]);
  
  const [tvaApplicable, setTvaApplicable] = useState(true);
  const [tvaRate, setTvaRate] = useState(20);
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const addItem = () => {
    const newItem: DevisItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof DevisItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tvaAmount = tvaApplicable ? subtotal * (tvaRate / 100) : 0;
  const total = subtotal + tvaAmount;

  const generatePDF = async () => {
    if (!client.firstName || !client.lastName || !client.email || items.some(item => !item.description)) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-devis-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          devisNumber,
          date: new Date().toLocaleDateString('fr-FR'),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
          client,
          companyInfo,
          items: items.filter(item => item.description.trim() !== ''),
          subtotal,
          tvaRate,
          tvaAmount,
          total,
          tvaApplicable,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `devis-${devisNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Devis généré et sauvegardé avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la génération du devis');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Générateur de Devis PDF
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Numéro de devis */}
          <div>
            <Label htmlFor="devisNumber">Numéro de devis *</Label>
            <Input
              id="devisNumber"
              value={devisNumber}
              onChange={(e) => setDevisNumber(e.target.value)}
              placeholder="DEV-2024-001"
            />
          </div>

          {/* Informations entreprise */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="size-5" />
                Informations Entreprise
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                <Input
                  id="companyName"
                  value={companyInfo.name}
                  onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                  placeholder="Votre Entreprise"
                />
              </div>
              <div>
                <Label htmlFor="companyPhone">Téléphone *</Label>
                <Input
                  id="companyPhone"
                  value={companyInfo.phone}
                  onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                  placeholder="01 23 45 67 89"
                />
              </div>
              <div>
                <Label htmlFor="companyEmail">Email *</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  value={companyInfo.email}
                  onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                  placeholder="contact@entreprise.com"
                />
              </div>
              <div>
                <Label htmlFor="companySiret">SIRET *</Label>
                <Input
                  id="companySiret"
                  value={companyInfo.siret}
                  onChange={(e) => setCompanyInfo({...companyInfo, siret: e.target.value})}
                  placeholder="12345678901234"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="companyAddress">Adresse *</Label>
                <Textarea
                  id="companyAddress"
                  value={companyInfo.address}
                  onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                  placeholder="123 Rue Example, 75000 Paris"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Informations client */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="size-5" />
                Informations Client
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientFirstName">Prénom *</Label>
                <Input
                  id="clientFirstName"
                  value={client.firstName}
                  onChange={(e) => setClient({...client, firstName: e.target.value})}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="clientLastName">Nom *</Label>
                <Input
                  id="clientLastName"
                  value={client.lastName}
                  onChange={(e) => setClient({...client, lastName: e.target.value})}
                  placeholder="Doe"
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">Email *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={client.email}
                  onChange={(e) => setClient({...client, email: e.target.value})}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="clientPhone">Téléphone</Label>
                <Input
                  id="clientPhone"
                  value={client.phone}
                  onChange={(e) => setClient({...client, phone: e.target.value})}
                  placeholder="01 23 45 67 89"
                />
              </div>
              <div>
                <Label htmlFor="clientCompany">Entreprise</Label>
                <Input
                  id="clientCompany"
                  value={client.company}
                  onChange={(e) => setClient({...client, company: e.target.value})}
                  placeholder="ACME Corp"
                />
              </div>
              <div>
                <Label htmlFor="clientAddress">Adresse</Label>
                <Textarea
                  id="clientAddress"
                  value={client.address}
                  onChange={(e) => setClient({...client, address: e.target.value})}
                  placeholder="123 Rue Example, 75000 Paris"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuration TVA */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuration TVA</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tvaApplicable"
                  checked={tvaApplicable}
                  onCheckedChange={(checked) => setTvaApplicable(checked as boolean)}
                />
                <Label htmlFor="tvaApplicable">TVA applicable</Label>
              </div>
              {tvaApplicable && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="tvaRate">Taux TVA:</Label>
                  <Select value={tvaRate.toString()} onValueChange={(value) => setTvaRate(parseInt(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5.5">5.5%</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="20">20%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prestations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Prestations</CardTitle>
              <Button onClick={addItem} size="sm" variant="outline">
                <Plus className="size-4 mr-2" />
                Ajouter
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label htmlFor={`description-${item.id}`}>Description *</Label>
                      <Input
                        id={`description-${item.id}`}
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Description de la prestation"
                      />
                    </div>
                    <div className="w-20">
                      <Label htmlFor={`quantity-${item.id}`}>Qté</Label>
                      <Input
                        id={`quantity-${item.id}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="w-32">
                      <Label htmlFor={`unitPrice-${item.id}`}>Prix unit. HT (€)</Label>
                      <Input
                        id={`unitPrice-${item.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="w-32">
                      <Label>Total HT</Label>
                      <div className="h-10 px-3 py-2 border border-input bg-muted rounded-md text-sm">
                        {item.total.toFixed(2)} €
                      </div>
                    </div>
                    <Button
                      onClick={() => removeItem(item.id)}
                      size="sm"
                      variant="outline"
                      disabled={items.length === 1}
                      className="h-10"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Totaux */}
              <div className="mt-6 flex justify-end">
                <div className="w-64 space-y-2 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between">
                    <span>Sous-total HT:</span>
                    <span className="font-medium">{subtotal.toFixed(2)} €</span>
                  </div>
                  {tvaApplicable && (
                    <div className="flex justify-between">
                      <span>TVA ({tvaRate}%):</span>
                      <span className="font-medium">{tvaAmount.toFixed(2)} €</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>{tvaApplicable ? 'Total TTC:' : 'Total HT:'}</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes et conditions</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes additionnelles, conditions particulières, délais de livraison..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              onClick={generatePDF}
              disabled={isGenerating}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                'Génération...'
              ) : (
                <>
                  <Download className="size-4 mr-2" />
                  Générer le PDF
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevisGenerator;