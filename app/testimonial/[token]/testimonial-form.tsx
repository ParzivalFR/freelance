"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface TestimonialFormProps {
  token: string;
  clientName: string;
  clientEmail: string;
  projectName?: string | null;
}

export default function TestimonialForm({
  token,
  clientName,
  clientEmail,
  projectName,
}: TestimonialFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: clientName,
    role: "",
    review: "",
    rating: 5,
    avatarUrl: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/testimonials/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          name: formData.name,
          role: formData.role,
          review: formData.review,
          rating: formData.rating,
          avatarUrl: formData.avatarUrl,
        }),
      });

      if (response.ok) {
        toast.success("Merci pour votre avis !");
        router.push(`/testimonial/${token}/success`);
      } else {
        const error = await response.json();
        toast.error(error.message || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      toast.error("Une erreur est survenue lors de l'envoi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        setFormData((prev) => ({ ...prev, avatarUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getCurrentAvatarUrl = () => {
    return formData.avatarUrl;
  };

  return (
    <div className="space-y-8">
      {/* Header avec avatar preview */}
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <Avatar className="size-24 ring-4 ring-primary/10">
            <AvatarImage src={getCurrentAvatarUrl()} alt={formData.name} />
            <AvatarFallback className="text-2xl font-semibold">
              {formData.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            Partagez votre expérience
          </h1>
          {projectName && (
            <Badge variant="secondary" className="mb-2">
              <Sparkles className="mr-1 size-3" />
              {projectName}
            </Badge>
          )}
          <p className="text-muted-foreground">
            Votre avis nous aide à améliorer nos services
          </p>
        </div>
      </div>

      <Card className="border-2">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section Avatar */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                Avatar personnalisé (optionnel)
              </Label>
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-4">
                  {avatarPreview && (
                    <Avatar className="size-12">
                      <AvatarImage
                        src={avatarPreview}
                        alt="Avatar téléchargé"
                      />
                      <AvatarFallback>
                        {formData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      PNG, JPG jusqu'à 5MB. Si rien n'est sélectionné, un avatar
                      par défaut sera utilisé.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Votre nom complet"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Fonction/Poste *</Label>
                <Input
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: Directeur Marketing"
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Votre évaluation *
              </Label>
              <div className="flex flex-col gap-4 rounded-lg bg-muted/50 p-4 sm:flex-row sm:items-center">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`text-3xl transition-all duration-200 hover:scale-110 ${
                        star <= formData.rating
                          ? "text-yellow-500 drop-shadow-sm"
                          : "text-gray-300 hover:text-yellow-300"
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, rating: star }))
                      }
                    >
                      ★
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      formData.rating >= 4
                        ? "default"
                        : formData.rating >= 3
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {formData.rating}/5 ⭐
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formData.rating === 5 && "Excellent !"}
                    {formData.rating === 4 && "Très bien"}
                    {formData.rating === 3 && "Correct"}
                    {formData.rating === 2 && "Décevant"}
                    {formData.rating === 1 && "Mauvais"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="review" className="text-base font-semibold">
                Votre témoignage *
              </Label>
              <div className="space-y-2">
                <Textarea
                  id="review"
                  name="review"
                  value={formData.review}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  placeholder="Décrivez votre expérience avec nos services. Qu'est-ce qui vous a le plus marqué ? Recommanderiez-vous nos services ?"
                  className="min-h-[140px] resize-none border-2 focus:border-primary"
                />
                <div className="flex items-center justify-between text-sm">
                  <p
                    className={`transition-colors ${
                      formData.review.length >= 20
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {formData.review.length >= 20
                      ? "✓ Parfait !"
                      : `Minimum 20 caractères (${formData.review.length}/20)`}
                  </p>
                  <p className="text-muted-foreground">
                    {formData.review.length}/500
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500">
                  <svg
                    className="size-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="mb-1 text-sm font-medium text-blue-900 dark:text-blue-100">
                    Publication publique
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Votre témoignage pourra être affiché sur notre site web pour
                    témoigner de la qualité de nos services. Vos informations
                    personnelles restent confidentielles.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || formData.review.length < 20}
                className="h-12 w-full text-base font-semibold"
                size="lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Envoi en cours...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4" />
                    Publier mon témoignage
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
