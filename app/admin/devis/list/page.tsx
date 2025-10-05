'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileText, Search, Eye, Download, Calendar, Euro, ExternalLink, User, Building2, MapPin, Phone, Mail, Send, Check, X, Clock, Receipt, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface DevisItem {
  id: string;
  devisNumber: string;
  status: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientCompany?: string;
  total: number;
  tvaApplicable: boolean;
  date: string;
  validUntil: string;
  createdAt: string;
  sentAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
}

const statusColors = {
  draft: 'bg-gray-500',
  sent: 'bg-blue-500',
  accepted: 'bg-green-500',
  rejected: 'bg-red-500',
  expired: 'bg-orange-500',
};

const statusLabels = {
  draft: 'Brouillon',
  sent: 'Envoyé',
  accepted: 'Accepté',
  rejected: 'Refusé',
  expired: 'Expiré',
};

export default function DevisListPage() {
  const [devis, setDevis] = useState<DevisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedDevis, setSelectedDevis] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [devisToDelete, setDevisToDelete] = useState<DevisItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchDevis = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/devis?${params}`);
      const data = await response.json();
      
      setDevis(data.devis);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('Erreur lors du chargement des devis:', error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchDevis();
  }, [page, statusFilter, fetchDevis]);

  const filteredDevis = devis.filter(d => 
    search === '' || 
    d.devisNumber.toLowerCase().includes(search.toLowerCase()) ||
    `${d.clientFirstName} ${d.clientLastName}`.toLowerCase().includes(search.toLowerCase()) ||
    d.clientEmail.toLowerCase().includes(search.toLowerCase()) ||
    (d.clientCompany && d.clientCompany.toLowerCase().includes(search.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const handleViewDevis = async (devis: DevisItem) => {
    try {
      const response = await fetch(`/api/devis/${devis.id}`);
      const fullDevis = await response.json();
      
      setSelectedDevis(fullDevis);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Erreur lors du chargement du devis:', error);
      alert('Erreur lors du chargement du devis');
    }
  };

  const handleOpenPDFInNewTab = async (devisId: string) => {
    const url = `/api/devis/${devisId}/pdf`;
    window.open(url, '_blank');
  };

  const handleStatusChange = async (devisId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/devis/${devisId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      // Rafraîchir la liste
      await fetchDevis();
      
      // Mettre à jour le devis sélectionné si ouvert
      if (selectedDevis && selectedDevis.id === devisId) {
        const updatedResponse = await fetch(`/api/devis/${devisId}`);
        const updatedDevis = await updatedResponse.json();
        setSelectedDevis(updatedDevis);
      }

      toast.success(`Statut mis à jour : ${statusLabels[newStatus as keyof typeof statusLabels]}`);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDownloadPDF = async (devis: DevisItem) => {
    try {
      // Utiliser l'API dédiée pour générer le PDF depuis les données en base
      const response = await fetch(`/api/devis/${devis.id}/pdf`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la génération du PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `devis-${devis.devisNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  const handleSendEmail = async (devisId: string) => {
    try {
      const response = await fetch(`/api/devis/${devisId}/send-email`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi');
      }

      // Rafraîchir la liste et la modal
      await fetchDevis();
      
      if (selectedDevis && selectedDevis.id === devisId) {
        const updatedResponse = await fetch(`/api/devis/${devisId}`);
        const updatedDevis = await updatedResponse.json();
        setSelectedDevis(updatedDevis);
      }

      toast.success('Email envoyé avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'envoi de l\'email');
    }
  };

  const handleConvertToFacture = async (devisId: string) => {
    try {
      const response = await fetch(`/api/devis/${devisId}/convert-to-facture`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la conversion');
      }

      const result = await response.json();

      toast.success(
        `Facture ${result.facture.factureNumber} créée avec succès !`,
        {
          action: {
            label: 'Voir les factures',
            onClick: () => {
              // TODO: Rediriger vers la liste des factures
              console.log('Redirection vers factures');
            }
          }
        }
      );

      // Fermer la modal
      setIsModalOpen(false);

    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la conversion en facture');
    }
  };

  const handleDeleteDevis = async () => {
    if (!devisToDelete) return;

    try {
      const response = await fetch(`/api/devis/${devisToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      toast.success(`Devis ${devisToDelete.devisNumber} supprimé avec succès`);

      // Fermer la modal de détail si elle est ouverte
      if (selectedDevis?.id === devisToDelete.id) {
        setIsModalOpen(false);
      }

      // Rafraîchir la liste
      await fetchDevis();

    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression du devis');
    } finally {
      setIsDeleteDialogOpen(false);
      setDevisToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full size-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement des devis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes Devis</h1>
          <p className="text-muted-foreground">
            Gérez tous vos devis depuis cette interface
          </p>
        </div>
        <Link href="/admin/devis">
          <Button>
            <FileText className="size-4 mr-2" />
            Nouveau devis
          </Button>
        </Link>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="size-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro, client..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillons</SelectItem>
                <SelectItem value="sent">Envoyés</SelectItem>
                <SelectItem value="accepted">Acceptés</SelectItem>
                <SelectItem value="rejected">Refusés</SelectItem>
                <SelectItem value="expired">Expirés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des devis */}
      <div className="grid gap-4">
        {filteredDevis.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="size-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun devis trouvé</h3>
              <p className="text-muted-foreground text-center max-w-md">
                {search || statusFilter !== 'all' 
                  ? "Aucun devis ne correspond à vos critères de recherche."
                  : "Vous n'avez pas encore créé de devis."}
              </p>
              {(!search && statusFilter === 'all') && (
                <Link href="/admin/devis" className="mt-4">
                  <Button>
                    <FileText className="size-4 mr-2" />
                    Créer votre premier devis
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredDevis.map((devis) => (
            <Card key={devis.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <FileText className="size-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-lg">{devis.devisNumber}</h3>
                        <Badge 
                          className={`${statusColors[devis.status as keyof typeof statusColors]} text-white`}
                        >
                          {statusLabels[devis.status as keyof typeof statusLabels]}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium">{devis.clientFirstName} {devis.clientLastName}</p>
                        {devis.clientCompany && (
                          <p>{devis.clientCompany}</p>
                        )}
                        <p>{devis.clientEmail}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <Euro className="size-4 text-muted-foreground" />
                      <span className="text-lg font-semibold">
                        {formatCurrency(devis.total)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {devis.tvaApplicable ? 'TTC' : 'HT'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="size-3" />
                      <span>Créé le {formatDate(devis.createdAt)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Valid jusqu'au {formatDate(devis.validUntil)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDevis(devis)}
                    >
                      <Eye className="size-4 mr-2" />
                      Voir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPDF(devis)}
                    >
                      <Download className="size-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDevisToDelete(devis);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination simple */}
      {filteredDevis.length > 0 && (
        <div className="flex justify-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Précédent
          </Button>
          <span className="flex items-center px-4 py-2 text-sm">
            Page {page}
          </span>
          <Button 
            variant="outline" 
            onClick={() => setPage(p => p + 1)}
            disabled={devis.length < 10}
          >
            Suivant
          </Button>
        </div>
      )}

      {/* Modal de détail du devis */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Devis {selectedDevis?.devisNumber}</span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleOpenPDFInNewTab(selectedDevis?.id)}
                >
                  <ExternalLink className="size-4 mr-2" />
                  Ouvrir PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownloadPDF({
                    id: selectedDevis?.id,
                    devisNumber: selectedDevis?.devisNumber,
                  } as DevisItem)}
                >
                  <Download className="size-4 mr-2" />
                  Télécharger
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleSendEmail(selectedDevis?.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Mail className="size-4 mr-2" />
                  Envoyer par email
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedDevis && (
            <div className="space-y-6">
              {/* Statut et actions */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <Badge className={`${statusColors[selectedDevis.status as keyof typeof statusColors]} text-white`}>
                    {statusLabels[selectedDevis.status as keyof typeof statusLabels]}
                  </Badge>
                  
                  {/* Boutons d'actions selon le statut */}
                  <div className="flex gap-2">
                    {selectedDevis.status === 'draft' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusChange(selectedDevis.id, 'sent')}
                        className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                      >
                        <Send className="size-4 mr-1" />
                        Marquer envoyé
                      </Button>
                    )}
                    
                    {selectedDevis.status === 'sent' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusChange(selectedDevis.id, 'accepted')}
                          className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                        >
                          <Check className="size-4 mr-1" />
                          Accepté
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusChange(selectedDevis.id, 'rejected')}
                          className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                        >
                          <X className="size-4 mr-1" />
                          Refusé
                        </Button>
                      </>
                    )}

                    {selectedDevis.status === 'accepted' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleConvertToFacture(selectedDevis.id)}
                        className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                      >
                        <Receipt className="size-4 mr-1" />
                        Convertir en facture
                      </Button>
                    )}

                    {(selectedDevis.status === 'accepted' || selectedDevis.status === 'rejected') && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusChange(selectedDevis.id, 'sent')}
                        className="bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                      >
                        <Clock className="size-4 mr-1" />
                        Remettre en attente
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="text-right text-sm text-muted-foreground">
                  <p>Créé le {formatDate(selectedDevis.createdAt)}</p>
                  <p>Valide jusqu'au {formatDate(selectedDevis.validUntil)}</p>
                  {selectedDevis.sentAt && <p>Envoyé le {formatDate(selectedDevis.sentAt)}</p>}
                  {selectedDevis.acceptedAt && <p>Accepté le {formatDate(selectedDevis.acceptedAt)}</p>}
                  {selectedDevis.rejectedAt && <p>Refusé le {formatDate(selectedDevis.rejectedAt)}</p>}
                </div>
              </div>

              {/* Informations client et entreprise */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="size-5" />
                      Client
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-muted-foreground" />
                      <span className="font-medium">
                        {selectedDevis.clientFirstName} {selectedDevis.clientLastName}
                      </span>
                    </div>
                    {selectedDevis.clientCompany && (
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4 text-muted-foreground" />
                        <span>{selectedDevis.clientCompany}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Mail className="size-4 text-muted-foreground" />
                      <span>{selectedDevis.clientEmail}</span>
                    </div>
                    {selectedDevis.clientPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="size-4 text-muted-foreground" />
                        <span>{selectedDevis.clientPhone}</span>
                      </div>
                    )}
                    {selectedDevis.clientAddress && (
                      <div className="flex items-start gap-2">
                        <MapPin className="size-4 text-muted-foreground mt-1" />
                        <span className="whitespace-pre-line">{selectedDevis.clientAddress}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="size-5" />
                      Entreprise
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="size-4 text-muted-foreground" />
                      <span className="font-medium">{selectedDevis.companyName}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="size-4 text-muted-foreground mt-1" />
                      <span className="whitespace-pre-line">{selectedDevis.companyAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="size-4 text-muted-foreground" />
                      <span>{selectedDevis.companyPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="size-4 text-muted-foreground" />
                      <span>{selectedDevis.companyEmail}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      SIRET: {selectedDevis.companySiret}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Prestations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Prestations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedDevis.items?.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-start p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} × {formatCurrency(item.unitPrice)}
                          </p>
                          <p className="font-medium">{formatCurrency(item.total)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totaux */}
                  <div className="mt-6 pt-4 border-t space-y-2">
                    <div className="flex justify-between">
                      <span>Sous-total HT:</span>
                      <span>{formatCurrency(selectedDevis.subtotal)}</span>
                    </div>
                    {selectedDevis.tvaApplicable && (
                      <div className="flex justify-between">
                        <span>TVA ({selectedDevis.tvaRate}%):</span>
                        <span>{formatCurrency(selectedDevis.tvaAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>{selectedDevis.tvaApplicable ? 'Total TTC:' : 'Total HT:'}</span>
                      <span>{formatCurrency(selectedDevis.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedDevis.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line">{selectedDevis.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le devis <strong>{devisToDelete?.devisNumber}</strong> ?
              <br />
              Client : <strong>{devisToDelete?.clientFirstName} {devisToDelete?.clientLastName}</strong>
              <br />
              <br />
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDevisToDelete(null)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDevis}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}