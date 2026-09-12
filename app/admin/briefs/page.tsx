import { PageHeader } from "@/components/admin/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import BriefManager from "./brief-manager";

export default async function BriefsAdminPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <PageHeader
        eyebrow="Avant le devis"
        title="Brie"
        titleAccent="fs client"
        description="Envoyez un lien privé à un prospect : il décrit son projet lui-même, en français simple, et vous récupérez de quoi chiffrer sans passer une heure au téléphone."
      />

      <Suspense fallback={<BriefsSkeleton />}>
        <BriefManager />
      </Suspense>
    </div>
  );
}

function BriefsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}
