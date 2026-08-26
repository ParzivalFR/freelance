import { PageHeader } from "@/components/admin/page-header";
import DevisGenerator from "@/components/ui/DevisGenerator";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import Link from "next/link";

export default function DevisPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <PageHeader
        eyebrow="Chiffrer une mission"
        title="Nouveau "
        titleAccent="devis"
        description="Composez le devis ligne par ligne, puis générez le PDF prêt à envoyer au client."
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/devis/list">
              <FileText className="mr-2 size-4" />
              Devis existants
            </Link>
          </Button>
        }
      />
      <DevisGenerator />
    </div>
  );
}
