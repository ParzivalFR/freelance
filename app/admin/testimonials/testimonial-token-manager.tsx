"use client";

import { useState, useEffect } from "react";
import { EmptyState } from "@/components/admin/empty-state";
import { SectionTitle } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Copy, ExternalLink, Link as LinkIcon, Loader2, Send } from "lucide-react";

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

  const activeCount = tokens.filter(
    (t) => !t.isUsed && !isExpired(t.expiresAt)
  ).length;

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <SectionTitle>Générer un lien</SectionTitle>
        <div className="rounded-2xl border bg-card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

            <label
              htmlFor="sendEmail"
              className="flex cursor-pointer items-center gap-2.5 rounded-xl border bg-muted/40 p-3"
            >
              <Checkbox
                id="sendEmail"
                checked={formData.sendEmail}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, sendEmail: !!checked }))
                }
              />
              <span className="text-sm text-muted-foreground">
                Envoyer automatiquement l&apos;email au client
              </span>
            </label>

            <Button
              type="submit"
              disabled={isGenerating}
              className="w-full ring-4 ring-[#7158ff]/20"
            >
              {isGenerating
                ? "Génération en cours…"
                : formData.sendEmail
                  ? "Générer et envoyer"
                  : "Générer le lien"}
            </Button>
          </form>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <SectionTitle>Liens générés</SectionTitle>
          {tokens.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {activeCount} lien{activeCount > 1 ? "s" : ""} encore valable
              {activeCount > 1 ? "s" : ""} sur {tokens.length}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed bg-card p-12 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-[#7158ff]" />
            Chargement des liens…
          </div>
        ) : tokens.length === 0 ? (
          <EmptyState
            icon={LinkIcon}
            title="Aucun lien généré"
            description="Générez un lien ci-dessus : le client dépose son avis lui-même, sans compte à créer."
          />
        ) : (
          <div className="space-y-3">
            {tokens.map((token) => {
              const expired = isExpired(token.expiresAt);
              return (
                <div
                  key={token.id}
                  className="rounded-2xl border bg-card p-5 transition-colors hover:border-[#7158ff]/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-foreground">
                          {token.clientName}
                        </h3>
                        {token.isUsed ? (
                          <Badge className="border-green-300 bg-green-50 text-green-700 hover:bg-green-50 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
                            Avis déposé
                          </Badge>
                        ) : expired ? (
                          <Badge variant="destructive">Expiré</Badge>
                        ) : (
                          <Badge variant="outline">En attente</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm text-muted-foreground md:grid-cols-2">
                        <p>{token.clientEmail}</p>
                        {token.projectName && <p>Projet : {token.projectName}</p>}
                        <p>
                          Créé le {new Date(token.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                        <p>
                          {token.usedAt
                            ? `Complété le ${new Date(token.usedAt).toLocaleDateString("fr-FR")}`
                            : `Expire le ${new Date(token.expiresAt).toLocaleDateString("fr-FR")}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            `${window.location.origin}/testimonial/${token.token}`
                          )
                        }
                      >
                        <Copy className="mr-1.5 size-4" />
                        Copier
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
                        <ExternalLink className="mr-1.5 size-4" />
                        Ouvrir
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendEmailManually(token.id)}
                        disabled={token.isUsed || expired}
                      >
                        <Send className="mr-1.5 size-4" />
                        Relancer
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
