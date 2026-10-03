"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const MIN = 20;
const MAX = 500;
const ratingLabels = ["", "Mauvais", "Décevant", "Correct", "Très bien", "Excellent"];

export default function TestimonialForm({
  token,
  clientName,
}: {
  token: string;
  clientName: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(clientName);
  const [role, setRole] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/testimonials/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, role, review, rating }),
      });
      if (response.ok) {
        router.push(`/testimonial/${token}/success`);
      } else {
        const error = await response.json();
        toast.error(error.message || "Une erreur est survenue");
      }
    } catch {
      toast.error("Une erreur est survenue lors de l'envoi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const shown = hover || rating;

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-6 rounded-[28px] border bg-card p-6 md:p-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Votre nom</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Votre fonction</Label>
          <Input
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            placeholder="Gérante, président d'association…"
            autoComplete="organization-title"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Votre note</Label>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`${star} sur 5`}
                onMouseEnter={() => setHover(star)}
                onClick={() => setRating(star)}
                className={`px-0.5 text-3xl leading-none transition-colors ${
                  star <= shown ? "text-accent-foreground" : "text-input"
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <span className="note">{shown}/5 · {ratingLabels[shown]}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="review">Votre témoignage</Label>
        <Textarea
          id="review"
          value={review}
          onChange={(e) => setReview(e.target.value.slice(0, MAX))}
          required
          rows={6}
          placeholder="Comment s'est passée la collaboration ? Qu'est-ce qui vous a marqué ? Recommanderiez-vous ?"
          className="min-h-[150px]"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{review.length < MIN ? `Encore ${MIN - review.length} caractères` : "C'est bon"}</span>
          <span>
            {review.length}/{MAX}
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || review.length < MIN}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          "Publier mon avis"
        )}
      </button>
      <p className="text-xs text-muted-foreground">
        Votre e-mail n'est jamais affiché. Vous pouvez me demander de retirer l'avis à tout moment.
      </p>
    </form>
  );
}
