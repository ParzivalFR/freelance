// components/dashboard/pdf-download-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PDFDownloadButtonProps {
  quoteId: string;
  quoteNumber: string;
  clientName: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function PDFDownloadButton({
  quoteId,
  quoteNumber,
  clientName,
  variant = "outline",
  size = "sm",
  className,
}: PDFDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/quotes/${quoteId}/pdf`);

      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement");
      }

      // Récupérer le blob
      const blob = await response.blob();

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${quoteNumber}_${clientName}.pdf`;

      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();

      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("PDF téléchargé avec succès !");
    } catch (error) {
      console.error("Erreur téléchargement PDF:", error);
      toast.error("Erreur lors du téléchargement du PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isDownloading}
      className={className}
    >
      {isDownloading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {size === "icon" ? null : "Génération..."}
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          {size === "icon" ? null : "PDF"}
        </>
      )}
    </Button>
  );
}
