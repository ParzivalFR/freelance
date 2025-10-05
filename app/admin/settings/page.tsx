"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Building2,
  Globe,
  Mail,
  Phone,
  User,
  Palette,
  Bell,
  Loader2,
  Save
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Settings {
  fullName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  companyName?: string;
  companyAddress?: string;
  companySiret?: string;
  companyTva?: string;
  emailSignature?: string;
  hourlyRate?: number;
  defaultTvaRate?: number;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  favicon?: string;
  primaryColor?: string;
  notificationEmail?: string;
  emailNewContact?: boolean;
  emailNewTestimonial?: boolean;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Erreur lors du chargement des paramètres");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success("Paramètres sauvegardés avec succès !");
      } else {
        toast.error("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof Settings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="border-b border-border/40 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
            <p className="mt-2 text-muted-foreground">
              Configurez les paramètres de votre application
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Profil & Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            Profil & Contact
          </CardTitle>
          <CardDescription>
            Informations personnelles et coordonnées de contact
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input
                id="fullName"
                value={settings.fullName || ""}
                onChange={(e) => updateSetting("fullName", e.target.value)}
                placeholder="Gael Richard"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.email || ""}
                onChange={(e) => updateSetting("email", e.target.value)}
                placeholder="contact@exemple.fr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={settings.phone || ""}
                onChange={(e) => updateSetting("phone", e.target.value)}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profileImage">URL Photo de profil</Label>
              <Input
                id="profileImage"
                value={settings.profileImage || ""}
                onChange={(e) => updateSetting("profileImage", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Biographie</Label>
            <Textarea
              id="bio"
              value={settings.bio || ""}
              onChange={(e) => updateSetting("bio", e.target.value)}
              placeholder="Développeur freelance passionné..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Liens sociaux */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="size-5" />
            Liens sociaux
          </CardTitle>
          <CardDescription>
            Vos profils sur les réseaux sociaux
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn</Label>
              <Input
                id="linkedinUrl"
                value={settings.linkedinUrl || ""}
                onChange={(e) => updateSetting("linkedinUrl", e.target.value)}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub</Label>
              <Input
                id="githubUrl"
                value={settings.githubUrl || ""}
                onChange={(e) => updateSetting("githubUrl", e.target.value)}
                placeholder="https://github.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitterUrl">Twitter/X</Label>
              <Input
                id="twitterUrl"
                value={settings.twitterUrl || ""}
                onChange={(e) => updateSetting("twitterUrl", e.target.value)}
                placeholder="https://twitter.com/..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations Business */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-5" />
            Informations Business
          </CardTitle>
          <CardDescription>
            Informations de votre entreprise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nom de l'entreprise</Label>
              <Input
                id="companyName"
                value={settings.companyName || ""}
                onChange={(e) => updateSetting("companyName", e.target.value)}
                placeholder="Ma Société"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companySiret">SIRET</Label>
              <Input
                id="companySiret"
                value={settings.companySiret || ""}
                onChange={(e) => updateSetting("companySiret", e.target.value)}
                placeholder="123 456 789 00012"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyTva">Numéro TVA</Label>
              <Input
                id="companyTva"
                value={settings.companyTva || ""}
                onChange={(e) => updateSetting("companyTva", e.target.value)}
                placeholder="FR12345678901"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Taux horaire (€)</Label>
              <Input
                id="hourlyRate"
                type="number"
                value={settings.hourlyRate || ""}
                onChange={(e) => updateSetting("hourlyRate", parseFloat(e.target.value))}
                placeholder="80"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyAddress">Adresse complète</Label>
            <Textarea
              id="companyAddress"
              value={settings.companyAddress || ""}
              onChange={(e) => updateSetting("companyAddress", e.target.value)}
              placeholder="123 Rue de la Paix, 75001 Paris"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailSignature">Signature email</Label>
            <Textarea
              id="emailSignature"
              value={settings.emailSignature || ""}
              onChange={(e) => updateSetting("emailSignature", e.target.value)}
              placeholder="Cordialement,&#10;Gael Richard&#10;Développeur Freelance"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* SEO & Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="size-5" />
            SEO & Branding
          </CardTitle>
          <CardDescription>
            Optimisation SEO et identité visuelle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Titre du site (SEO)</Label>
              <Input
                id="metaTitle"
                value={settings.metaTitle || ""}
                onChange={(e) => updateSetting("metaTitle", e.target.value)}
                placeholder="Mon Site - Développeur Freelance"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Couleur principale</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={settings.primaryColor || "#3b82f6"}
                  onChange={(e) => updateSetting("primaryColor", e.target.value)}
                  className="w-20"
                />
                <Input
                  value={settings.primaryColor || "#3b82f6"}
                  onChange={(e) => updateSetting("primaryColor", e.target.value)}
                  placeholder="#3b82f6"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaDescription">Description du site (SEO)</Label>
            <Textarea
              id="metaDescription"
              value={settings.metaDescription || ""}
              onChange={(e) => updateSetting("metaDescription", e.target.value)}
              placeholder="Description de votre site pour les moteurs de recherche"
              rows={2}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ogImage">Image Open Graph (URL)</Label>
              <Input
                id="ogImage"
                value={settings.ogImage || ""}
                onChange={(e) => updateSetting("ogImage", e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="favicon">Favicon (URL)</Label>
              <Input
                id="favicon"
                value={settings.favicon || ""}
                onChange={(e) => updateSetting("favicon", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configurez vos préférences de notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notificationEmail">Email de notification</Label>
            <Input
              id="notificationEmail"
              type="email"
              value={settings.notificationEmail || ""}
              onChange={(e) => updateSetting("notificationEmail", e.target.value)}
              placeholder="notifications@exemple.fr"
            />
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNewContact">Nouveaux contacts</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir un email lors d'un nouveau message de contact
                </p>
              </div>
              <Switch
                id="emailNewContact"
                checked={settings.emailNewContact ?? true}
                onCheckedChange={(checked) => updateSetting("emailNewContact", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNewTestimonial">Nouveaux témoignages</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir un email lors d'un nouveau témoignage
                </p>
              </div>
              <Switch
                id="emailNewTestimonial"
                checked={settings.emailNewTestimonial ?? true}
                onCheckedChange={(checked) => updateSetting("emailNewTestimonial", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bouton de sauvegarde en bas */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="mr-2 size-4" />
              Enregistrer tous les paramètres
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
