"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Upload, User, Sparkles } from "lucide-react";

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
    avatarType: "dicebear" as "dicebear" | "upload",
    avatarUrl: "",
    avatarSeed: clientName.toLowerCase().replace(/\s+/g, ""),
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
          avatarUrl: formData.avatarType === "dicebear" 
            ? `https://api.dicebear.com/7.x/initials/svg?seed=${formData.avatarSeed}&backgroundColor=3b82f6,ef4444,10b981,f59e0b,8b5cf6&textColor=ffffff`
            : formData.avatarUrl,
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
    if (file && file.type.startsWith('image/')) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        setFormData(prev => ({ ...prev, avatarUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateNewAvatar = () => {
    const newSeed = Math.random().toString(36).substring(7);
    setFormData(prev => ({ ...prev, avatarSeed: newSeed }));
  };

  const getCurrentAvatarUrl = () => {
    if (formData.avatarType === "upload" && formData.avatarUrl) {
      return formData.avatarUrl;
    }
    return `https://api.dicebear.com/7.x/initials/svg?seed=${formData.avatarSeed}&backgroundColor=3b82f6,ef4444,10b981,f59e0b,8b5cf6&textColor=ffffff`;
  };

  return (
    <div className="space-y-8">
      {/* Header avec avatar preview */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Avatar className="h-24 w-24 ring-4 ring-primary/10">
            <AvatarImage src={getCurrentAvatarUrl()} alt={formData.name} />
            <AvatarFallback className="text-2xl font-semibold">
              {formData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Partagez votre expérience
          </h1>
          {projectName && (
            <Badge variant="secondary" className="mb-2">
              <Sparkles className="w-3 h-3 mr-1" />
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
              <Label className="text-base font-semibold">Choisir votre avatar</Label>
              <Tabs 
                value={formData.avatarType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, avatarType: value as "dicebear" | "upload" }))}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="dicebear" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Avatar généré
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Télécharger
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="dicebear" className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={getCurrentAvatarUrl()} alt="Avatar généré" />
                        <AvatarFallback>{formData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Avatar automatique</p>
                        <p className="text-sm text-muted-foreground">Généré à partir de vos initiales</p>
                      </div>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={generateNewAvatar}>
                      <Sparkles className="w-4 h-4 mr-1" />
                      Nouveau
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="upload" className="space-y-3">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      {avatarPreview && (
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={avatarPreview} alt="Avatar téléchargé" />
                          <AvatarFallback>{formData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFileChange}
                          className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                        />
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG jusqu'à 5MB</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label className="text-base font-semibold">Votre évaluation *</Label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-muted/50 rounded-lg">
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
                  <Badge variant={formData.rating >= 4 ? "default" : formData.rating >= 3 ? "secondary" : "destructive"}>
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
              <Label htmlFor="review" className="text-base font-semibold">Votre témoignage *</Label>
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
                  <p className={`transition-colors ${formData.review.length >= 20 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {formData.review.length >= 20 ? '✓ Parfait !' : `Minimum 20 caractères (${formData.review.length}/20)`}
                  </p>
                  <p className="text-muted-foreground">
                    {formData.review.length}/500
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Publication publique
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Votre témoignage pourra être affiché sur notre site web pour témoigner de la qualité de nos services. Vos informations personnelles restent confidentielles.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || formData.review.length < 20}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Envoi en cours...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
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