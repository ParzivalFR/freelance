import { PageHeader } from "@/components/admin/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import TestimonialTokenManager from "./testimonial-token-manager";

export default async function TestimonialsAdminPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/signin");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <PageHeader
        eyebrow="La parole aux clients"
        title="Témoi"
        titleAccent="gnages"
        description="Générez un lien unique par client : il dépose son avis lui-même, vous n'avez plus qu'à le publier."
      />

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
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}
