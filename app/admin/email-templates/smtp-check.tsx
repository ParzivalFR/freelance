"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, PlugZap } from "lucide-react";
import { useState } from "react";

/** Bouton de vérification du SMTP : ouvre la connexion sans envoyer d'email. */
export function SmtpCheck() {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);

  const runTest = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/admin/email-templates/test", { method: "POST" });
      const data = await res.json();
      toast({
        title: res.ok ? "SMTP opérationnel" : "SMTP injoignable",
        description: data.message ?? data.error,
        variant: res.ok ? undefined : "destructive",
      });
    } catch {
      toast({
        title: "Test impossible",
        description: "La requête n'a pas abouti.",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Button variant="outline" onClick={runTest} disabled={testing}>
      {testing ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Test en cours…
        </>
      ) : (
        <>
          <PlugZap className="mr-2 size-4" />
          Tester la connexion SMTP
        </>
      )}
    </Button>
  );
}
