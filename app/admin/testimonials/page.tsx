import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TestimonialTokenManager from "./testimonial-token-manager";
import { Skeleton } from "@/components/ui/skeleton";

export default async function TestimonialsAdminPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect("/signin");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des Témoignages</h1>
        <p className="text-muted-foreground">
          Générez des liens uniques pour collecter des avis clients
        </p>
      </div>

      <Suspense fallback={<TestimonialsSkeleton />}>
        <TestimonialTokenManager />
      </Suspense>
    </div>
  );
}

function TestimonialsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}