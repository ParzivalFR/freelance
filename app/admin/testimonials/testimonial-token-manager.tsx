"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Copy, ExternalLink, Mail, Send } from "lucide-react";

interface TokenData {
  id: string;
  token: string;
  clientEmail: string;
  clientName: string;
  projectName?: string;
  isUsed: boolean;
  expiresAt: string;
  createdAt: string;
  usedAt?: string;
}

export default function TestimonialTokenManager() {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    clientEmail: "",
    clientName: "",
    projectName: "",
    sendEmail: true, // Envoi automatique par défaut
  });

  const fetchTokens = async () => {
    try {
      const response = await fetch("/api/admin/testimonial-tokens");
      if (response.ok) {
        const data = await response.json();
        setTokens(data);
      }
    } catch (error) {
      console.error("Error fetching tokens:", error);
      toast.error("Erreur lors du chargement des tokens");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const response = await fetch("/api/admin/testimonial-tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        
        // Copier automatiquement le lien
        await navigator.clipboard.writeText(result.url);
        toast.success("Lien copié dans le presse-papiers !");
        
        // Reset form
        setFormData({
          clientEmail: "",
          clientName: "",
          projectName: "",
          sendEmail: true,
        });
        
        // Refresh tokens
        fetchTokens();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erreur lors de la génération");
      }
    } catch (error) {
      console.error("Error generating token:", error);
      toast.error("Erreur lors de la génération du token");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copié dans le presse-papiers !");
    } catch (error) {
      toast.error("Erreur lors de la copie");
    }
  };

  const sendEmailManually = async (tokenId: string) => {
    try {
      const response = await fetch("/api/admin/testimonial-tokens/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tokenId }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Email envoyé avec succès !");
      } else {
        const error = await response.json();
        toast.error(error.error || "Erreur lors de l'envoi");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Erreur lors de l'envoi de l'email");
    }
  };

  const isExpired = (expiresAt: string) => new Date() > new Date(expiresAt);

  return (
    <div className="space-y-6">
      {/* Formulaire de génération */}
      <Card>
        <CardHeader>
          <CardTitle>Générer un nouveau lien</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nom du client *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, clientName: e.target.value }))
                  }
                  required
                  placeholder="John Doe"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email du client *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, clientEmail: e.target.value }))
                  }
                  required
                  placeholder="john@example.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="projectName">Nom du projet (optionnel)</Label>
              <Input
                id="projectName"
                value={formData.projectName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, projectName: e.target.value }))
                }
                placeholder="Site e-commerce"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendEmail"
                checked={formData.sendEmail}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, sendEmail: !!checked }))
                }
              />
              <Label htmlFor="sendEmail" className="text-sm font-normal">
                Envoyer automatiquement l'email au client
              </Label>
            </div>

            <Button type="submit" disabled={isGenerating} className="w-full">
              {isGenerating ? "Génération en cours..." : 
               formData.sendEmail ? "Générer et envoyer" : "Générer le lien"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Liste des tokens */}
      <Card>
        <CardHeader>
          <CardTitle>Liens générés</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : tokens.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun lien généré
            </div>
          ) : (
            <div className="space-y-4">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">{token.clientName}</div>
                      <div className="text-sm text-muted-foreground">
                        {token.clientEmail}
                      </div>
                      {token.projectName && (
                        <div className="text-sm text-muted-foreground">
                          Projet: {token.projectName}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      {token.isUsed ? (
                        <Badge variant="secondary">Utilisé</Badge>
                      ) : isExpired(token.expiresAt) ? (
                        <Badge variant="destructive">Expiré</Badge>
                      ) : (
                        <Badge variant="default">Actif</Badge>
                      )}
                      
                      <div className="text-xs text-muted-foreground text-right">
                        Créé: {new Date(token.createdAt).toLocaleDateString()}
                        <br />
                        Expire: {new Date(token.expiresAt).toLocaleDateString()}
                        {token.usedAt && (
                          <>
                            <br />
                            Utilisé: {new Date(token.usedAt).toLocaleDateString()}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          `${window.location.origin}/testimonial/${token.token}`
                        )
                      }
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copier lien
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `${window.location.origin}/testimonial/${token.token}`,
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Ouvrir
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendEmailManually(token.id)}
                      disabled={token.isUsed || isExpired(token.expiresAt)}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Envoyer par email
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}