"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  });

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
          ...formData,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Votre témoignage</CardTitle>
        {projectName && (
          <p className="text-sm text-muted-foreground">
            Projet : {projectName}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Votre nom complet"
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
              placeholder="Ex: Directeur Marketing, Entrepreneur, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">Note sur 5 *</Label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`text-2xl transition-colors ${
                    star <= formData.rating
                      ? "text-yellow-500"
                      : "text-gray-300"
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, rating: star }))
                  }
                >
                  ★
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {formData.rating}/5
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review">Votre avis *</Label>
            <Textarea
              id="review"
              name="review"
              value={formData.review}
              onChange={handleInputChange}
              required
              rows={6}
              placeholder="Partagez votre expérience avec nous..."
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              Minimum 20 caractères ({formData.review.length}/20)
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Note :</strong> En soumettant cet avis, vous acceptez qu'il puisse être affiché publiquement sur notre site web pour témoigner de la qualité de nos services.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || formData.review.length < 20}
            className="w-full"
          >
            {isSubmitting ? "Envoi en cours..." : "Envoyer mon avis"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}