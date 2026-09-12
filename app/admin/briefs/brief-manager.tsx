"use client";

import { useEffect, useState } from "react";
import {
  CheckCheck,
  ClipboardList,
  Copy,
  Hourglass,
  Loader2,
  Mail,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/admin/empty-state";
import { SectionTitle } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BRIEF_SECTIONS } from "@/lib/brief-questions";

interface Brief {
  id: string;
  token: string;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  company: string | null;
  answers: Record<string, string | string[]> | null;
  expiresAt: string;
  emailSentAt: string | null;
  submittedAt: string | null;
  createdAt: string;
}

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
};

export default function BriefManager() {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [opened, setOpened] = useState<Brief | null>(null);

  async function load() {
    try {
      const response = await fetch("/api/admin/briefs");
      if (!response.ok) throw new Error();
      setBriefs(await response.json());
    } catch {
      toast.error("Impossible de charger les briefs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(sendEmail: boolean) {
    if (!form.firstName.trim() || !form.email.trim()) {
      toast.error("Le prénom et l'email sont nécessaires.");
      return;
    }
    setCreating(true);
    try {
      const response = await fetch("/api/admin/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sendEmail }),
      });
      const created = await response.json();
      if (!response.ok) throw new Error(created?.error ?? "Création impossible");

      if (created.emailError) {
        toast.warning(
          "Lien créé, mais l'email n'est pas parti. Copiez-le et envoyez-le à la main.",
        );
      } else {
        toast.success(sendEmail ? "Lien envoyé par email." : "Lien créé.");
      }
      setForm(EMPTY_FORM);
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Création impossible.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function resend(brief: Brief) {
    setBusyId(brief.id);
    try {
      const response = await fetch(`/api/admin/briefs/${brief.id}`, {
        method: "POST",
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error ?? "Envoi impossible");
      toast.success("Email renvoyé.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Envoi impossible.");
    } finally {
      setBusyId(null);
    }
  }

  /** Le lien a été transmis à la main : on l'enregistre sans rien envoyer. */
  async function markSent(brief: Brief) {
    setBusyId(brief.id);
    try {
      const response = await fetch(`/api/admin/briefs/${brief.id}`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error();
      toast.success("Marqué comme envoyé.");
      await load();
    } catch {
      toast.error("Impossible de mettre à jour la fiche.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(brief: Brief) {
    if (
      !confirm(
        `Supprimer le brief de ${brief.firstName} ${brief.lastName} ? Le lien cessera de fonctionner${brief.status === "submitted" ? " et ses réponses seront perdues" : ""}.`,
      )
    ) {
      return;
    }
    setBusyId(brief.id);
    try {
      const response = await fetch(`/api/admin/briefs/${brief.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error();
      toast.success("Brief supprimé.");
      await load();
    } catch {
      toast.error("Suppression impossible.");
    } finally {
      setBusyId(null);
    }
  }

  async function copyLink(brief: Brief) {
    const link = `${window.location.origin}/brief/${brief.token}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Lien copié.");
    } catch {
      // Le presse-papier est refusé hors HTTPS ou sans permission.
      toast.info(link);
    }
  }

  const submitted = briefs.filter((brief) => brief.status === "submitted");
  const waiting = briefs.filter((brief) => brief.status !== "submitted");

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Briefs complétés"
          value={submitted.length}
          sub="prêts à chiffrer"
          icon={ClipboardList}
          highlight={submitted.length > 0}
        />
        <StatCard
          label="En attente de réponse"
          value={waiting.length}
          sub="liens envoyés ou à envoyer"
          icon={Hourglass}
        />
        <StatCard label="Total" value={briefs.length} icon={Mail} />
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <SectionTitle>Nouveau lien</SectionTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Le prospect reçoit un lien personnel, valable 30 jours. Ses réponses
          sont enregistrées au fur et à mesure : il peut s&apos;interrompre et
          reprendre plus tard.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            placeholder="Prénom *"
            value={form.firstName}
            onChange={(event) =>
              setForm({ ...form, firstName: event.target.value })
            }
          />
          <Input
            placeholder="Nom"
            value={form.lastName}
            onChange={(event) =>
              setForm({ ...form, lastName: event.target.value })
            }
          />
          <Input
            type="email"
            placeholder="Email *"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
          />
          <Input
            placeholder="Téléphone"
            value={form.phone}
            onChange={(event) =>
              setForm({ ...form, phone: event.target.value })
            }
          />
          <Input
            placeholder="Entreprise"
            value={form.company}
            onChange={(event) =>
              setForm({ ...form, company: event.target.value })
            }
          />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            onClick={() => create(true)}
            disabled={creating}
            className="bg-[#7158ff] hover:bg-[#5f47e0]"
          >
            {creating ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Send className="mr-2 size-4" />
            )}
            Créer et envoyer par email
          </Button>
          <Button
            variant="outline"
            onClick={() => create(false)}
            disabled={creating}
          >
            <Plus className="mr-2 size-4" />
            Créer le lien seulement
          </Button>
        </div>
      </div>

      <div>
        <SectionTitle>Les briefs</SectionTitle>
        <div className="mt-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : briefs.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Aucun brief pour l'instant"
              description="Créez un lien au-dessus et envoyez-le à votre prochain prospect."
            />
          ) : (
            <div className="space-y-3">
              {briefs.map((brief) => {
                const done = brief.status === "submitted";
                const expired = new Date(brief.expiresAt) < new Date();
                return (
                  <div
                    key={brief.id}
                    className={`rounded-2xl border bg-card p-5 ${
                      done ? "border-[#7158ff]/40" : ""
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-foreground">
                          {brief.firstName} {brief.lastName}
                          {brief.company && (
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                              {brief.company}
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {brief.email}
                          {brief.phone && ` — ${brief.phone}`}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {done
                            ? `Complété le ${formatDate(brief.submittedAt)}`
                            : expired
                              ? `Lien expiré le ${formatDate(brief.expiresAt)}`
                              : brief.emailSentAt
                                ? `Envoyé le ${formatDate(brief.emailSentAt)}, en attente de réponse`
                                : "Lien créé, pas encore envoyé"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {done ? (
                          <Button
                            size="sm"
                            className="bg-[#7158ff] hover:bg-[#5f47e0]"
                            onClick={() => setOpened(brief)}
                          >
                            Voir les réponses
                          </Button>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyLink(brief)}
                            >
                              <Copy className="mr-2 size-3.5" />
                              Copier le lien
                            </Button>
                            {!brief.emailSentAt && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busyId === brief.id}
                                onClick={() => markSent(brief)}
                                title="Vous avez envoyé le lien vous-même"
                              >
                                <CheckCheck className="mr-2 size-3.5" />
                                Déjà envoyé
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busyId === brief.id}
                              onClick={() => resend(brief)}
                            >
                              {busyId === brief.id ? (
                                <Loader2 className="mr-2 size-3.5 animate-spin" />
                              ) : (
                                <Mail className="mr-2 size-3.5" />
                              )}
                              {brief.emailSentAt ? "Relancer" : "Envoyer"}
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busyId === brief.id}
                          onClick={() => remove(brief)}
                        >
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AnswersDialog brief={opened} onClose={() => setOpened(null)} />
    </div>
  );
}

function AnswersDialog({
  brief,
  onClose,
}: {
  brief: Brief | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={Boolean(brief)} onOpenChange={(open) => !open && onClose()}>
      {/* flex + min-h-0 sur le corps : sans ça le conteneur en grille de Radix */}
      {/* empêche le défilement interne des contenus longs. */}
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {brief?.firstName} {brief?.lastName}
          </DialogTitle>
          <DialogDescription>
            {brief?.company ? `${brief.company} — ` : ""}
            {brief?.email}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
          {BRIEF_SECTIONS.map((section) => {
            const rows = section.questions
              .map((question) => {
                const value = brief?.answers?.[question.id];
                const text = Array.isArray(value) ? value.join(", ") : value;
                if (!text || !String(text).trim()) return null;
                return { question, text: String(text) };
              })
              .filter(Boolean) as { question: { label: string }; text: string }[];

            if (rows.length === 0) return null;

            return (
              <div key={section.id}>
                <SectionTitle className="text-xl">{section.title}</SectionTitle>
                <div className="mt-2 space-y-3">
                  {rows.map((row) => (
                    <div key={row.question.label}>
                      <p className="text-sm font-medium text-foreground">
                        {row.question.label}
                      </p>
                      <p className="mt-0.5 whitespace-pre-wrap text-sm text-muted-foreground">
                        {row.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
