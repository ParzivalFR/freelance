"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ClipboardList, Plus, Trash2, Power, Send, Check, X, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { PageHeader, LoadingScreen, CyberInput } from "@/components/dashboard/cyber-ui";
import { useBotConfig } from "@/hooks/use-bot-config";
import { ChannelSelect, RoleSelect } from "@/components/dashboard/discord-select";
import { useDiscordUsers } from "@/hooks/use-discord-users";

interface Question {
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  style?: "short" | "paragraph";
}

interface ApplicationForm {
  id: string;
  title: string;
  description: string | null;
  questions: Question[];
  reviewChannelId: string | null;
  acceptRoleId: string | null;
  acceptDmMessage: string | null;
  rejectDmMessage: string | null;
  color: string | null;
  maxSubmissions: number;
  enabled: boolean;
  createdAt: string;
}

interface Submission {
  id: string;
  formId: string;
  userId: string;
  status: string;
  createdAt: string;
  answers: Array<{ label: string; answer: string }>;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function ApplicationsPage() {
  const params = useParams();
  const botId = params?.botId as string;
  const { config } = useBotConfig();

  const [forms, setForms] = useState<ApplicationForm[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [postingForm, setPostingForm] = useState<string | null>(null);
  const [postChannelId, setPostChannelId] = useState("");
  const [postMessage, setPostMessage] = useState<string | null>(null);
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reviewChannelId, setReviewChannelId] = useState("");
  const [acceptRoleId, setAcceptRoleId] = useState("");
  const [acceptDmMessage, setAcceptDmMessage] = useState("");
  const [rejectDmMessage, setRejectDmMessage] = useState("");
  const [color, setColor] = useState("#5865f2");
  const [maxSubmissions, setMaxSubmissions] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([
    { id: uid(), label: "", placeholder: "", required: true, style: "short" },
  ]);

  const fetchData = async () => {
    if (!botId) return;
    setLoading(true);
    const res = await fetch(`/api/bot/applications?botId=${botId}`);
    if (res.ok) {
      const data = await res.json();
      setForms(data.forms ?? []);
      setSubmissions(data.submissions ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [botId]);

  const userIds = Array.from(new Set(submissions.map((s) => s.userId)));
  const { users } = useDiscordUsers(botId, userIds);

  const addQuestion = () => {
    if (questions.length >= 5) return;
    setQuestions([...questions, { id: uid(), label: "", placeholder: "", required: true, style: "short" }]);
  };

  const updateQuestion = (index: number, patch: Partial<Question>) => {
    setQuestions(questions.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setReviewChannelId("");
    setAcceptRoleId("");
    setAcceptDmMessage("");
    setRejectDmMessage("");
    setColor("#5865f2");
    setMaxSubmissions(0);
    setQuestions([{ id: uid(), label: "", placeholder: "", required: true, style: "short" }]);
  };

  const submit = async () => {
    if (!title.trim()) return;
    const validQuestions = questions.filter((q) => q.label.trim());
    if (validQuestions.length === 0) return;

    const res = await fetch("/api/bot/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        botId,
        title,
        description: description || null,
        questions: validQuestions,
        reviewChannelId: reviewChannelId || null,
        acceptRoleId: acceptRoleId || null,
        acceptDmMessage: acceptDmMessage || null,
        rejectDmMessage: rejectDmMessage || null,
        color,
        maxSubmissions,
      }),
    });
    if (res.ok) {
      resetForm();
      setShowCreate(false);
      await fetchData();
    }
  };

  const toggleEnabled = async (form: ApplicationForm) => {
    await fetch("/api/bot/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: form.id, enabled: !form.enabled }),
    });
    await fetchData();
  };

  const deleteForm = async (id: string) => {
    if (!confirm("Supprimer ce formulaire et toutes ses candidatures ?")) return;
    await fetch(`/api/bot/applications?id=${id}`, { method: "DELETE" });
    await fetchData();
  };

  const postForm = async (formId: string) => {
    if (!postChannelId) return;
    setPostMessage(null);
    const res = await fetch("/api/bot/applications/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formId, channelId: postChannelId }),
    });
    const data = await res.json();
    if (res.ok) {
      setPostMessage("✅ " + data.message);
      setPostingForm(null);
      setPostChannelId("");
      setTimeout(() => setPostMessage(null), 5000);
    } else {
      setPostMessage("❌ " + (data.error ?? "Erreur"));
    }
  };

  const reviewSubmission = async (submissionId: string, action: "accept" | "reject") => {
    await fetch("/api/bot/applications/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId, action }),
    });
    await fetchData();
  };

  if (!config) return <LoadingScreen />;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<ClipboardList className="size-4" />}
        title="Candidatures"
        subtitle="Formulaires de candidature avec questions personnalisées"
        status={config.status}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-dashed bg-card p-4">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">formulaires</p>
          <p className="font-mono text-2xl font-bold text-foreground">{forms.length}</p>
        </div>
        <div className="rounded-xl border border-dashed bg-card p-4">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">candidatures totales</p>
          <p className="font-mono text-2xl font-bold text-foreground">{submissions.length}</p>
        </div>
        <div className="rounded-xl border border-dashed bg-card p-4">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">en attente</p>
          <p className="font-mono text-2xl font-bold text-yellow-500">
            {submissions.filter((s) => s.status === "pending").length}
          </p>
        </div>
      </div>

      {/* Bouton créer */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 rounded-lg border border-dashed bg-blue-500/10 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-blue-400 transition hover:bg-blue-500/20"
        >
          <Plus className="size-3.5" />
          {showCreate ? "annuler" : "créer un formulaire"}
        </button>
      </div>

      {/* Formulaire de création */}
      {showCreate && (
        <div className="rounded-xl border border-dashed bg-card p-4 space-y-4">
          <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— nouveau formulaire —</p>

          <CyberInput label="titre" value={title} onChange={setTitle} placeholder="ex: Candidature Staff" />
          <CyberInput label="description" value={description} onChange={setDescription} placeholder="Optionnel — affiché dans l'embed" />

          <div className="grid gap-3 sm:grid-cols-2">
            <ChannelSelect botId={botId} label="salon_de_review" value={reviewChannelId} onChange={setReviewChannelId} filter="text" />
            <RoleSelect botId={botId} label="role_si_accepte" value={acceptRoleId} onChange={setAcceptRoleId} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <CyberInput label="dm_acceptation" value={acceptDmMessage} onChange={setAcceptDmMessage} placeholder="✅ Ta candidature a été acceptée !" />
            <CyberInput label="dm_refus" value={rejectDmMessage} onChange={setRejectDmMessage} placeholder="❌ Ta candidature a été refusée." />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <CyberInput label="couleur_embed" value={color} onChange={setColor} placeholder="#5865f2" />
            <CyberInput label="max_candidatures_par_user (0=illimité)" type="number" value={String(maxSubmissions)} onChange={(v) => setMaxSubmissions(parseInt(v) || 0)} />
          </div>

          {/* Questions */}
          <div className="space-y-3 pt-2">
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">questions (max 5)</p>
            {questions.map((q, i) => (
              <div key={q.id} className="rounded-lg border border-dashed bg-background p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground">Q{i + 1}</span>
                  <button
                    onClick={() => removeQuestion(i)}
                    disabled={questions.length <= 1}
                    className="ml-auto text-red-400 hover:text-red-300 disabled:opacity-30"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
                <CyberInput label="label" value={q.label} onChange={(v) => updateQuestion(i, { label: v })} placeholder="Quel est ton âge ?" />
                <CyberInput label="placeholder" value={q.placeholder ?? ""} onChange={(v) => updateQuestion(i, { placeholder: v })} placeholder="Ton âge en chiffres" />
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={q.required !== false}
                      onChange={(e) => updateQuestion(i, { required: e.target.checked })}
                    />
                    obligatoire
                  </label>
                  <select
                    value={q.style ?? "short"}
                    onChange={(e) => updateQuestion(i, { style: e.target.value as "short" | "paragraph" })}
                    className="font-mono text-[10px] bg-background border border-dashed rounded px-2 py-1"
                  >
                    <option value="short">court (1 ligne)</option>
                    <option value="paragraph">long (paragraphe)</option>
                  </select>
                </div>
              </div>
            ))}
            <button
              onClick={addQuestion}
              disabled={questions.length >= 5}
              className="flex items-center gap-2 rounded border border-dashed bg-background px-3 py-1.5 font-mono text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <Plus className="size-3" />
              ajouter une question
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={submit}
              className="rounded-lg border border-dashed bg-green-500/10 px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-green-400 transition hover:bg-green-500/20"
            >
              créer le formulaire
            </button>
          </div>
        </div>
      )}

      {/* Message après post */}
      {postMessage && (
        <div className="rounded-lg border border-dashed bg-card p-3">
          <p className="font-mono text-[11px] text-foreground">{postMessage}</p>
        </div>
      )}

      {/* Liste des formulaires */}
      <div className="space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">formulaires existants</p>
        {loading ? (
          <p className="font-mono text-[10px] text-muted-foreground/60">Chargement...</p>
        ) : forms.length === 0 ? (
          <p className="font-mono text-[10px] text-muted-foreground/60">Aucun formulaire pour le moment.</p>
        ) : (
          forms.map((form) => {
            const submissionsForForm = submissions.filter((s) => s.formId === form.id);
            const isPosting = postingForm === form.id;
            return (
              <div key={form.id} className="rounded-xl border border-dashed bg-card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="size-2 rounded-full" style={{ background: form.enabled ? "#22c55e" : "#71717a" }} />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-bold text-foreground truncate">{form.title}</p>
                    <div className="flex gap-3 mt-1 font-mono text-[10px] text-muted-foreground/70">
                      <span>{form.questions.length} question(s)</span>
                      <span>{submissionsForForm.length} candidature(s)</span>
                      <span className={form.enabled ? "text-green-500" : "text-muted-foreground/50"}>
                        {form.enabled ? "actif" : "désactivé"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setPostingForm(isPosting ? null : form.id);
                      setPostChannelId("");
                    }}
                    className="flex items-center gap-1.5 rounded border border-dashed bg-blue-500/10 px-3 py-1.5 font-mono text-[10px] text-blue-400 hover:bg-blue-500/20"
                  >
                    <Send className="size-3" />
                    Poster
                  </button>
                  <button onClick={() => toggleEnabled(form)} className="text-muted-foreground hover:text-foreground" title="Activer/désactiver">
                    <Power className="size-3.5" />
                  </button>
                  <button onClick={() => deleteForm(form.id)} className="text-red-400 hover:text-red-300" title="Supprimer">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                {isPosting && (
                  <div className="space-y-2 pt-3 border-t border-dashed">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      poster ce formulaire dans un salon
                    </p>
                    <ChannelSelect
                      botId={botId}
                      label="salon_de_postage"
                      value={postChannelId}
                      onChange={setPostChannelId}
                      filter="text"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => postForm(form.id)}
                        disabled={!postChannelId}
                        className="flex items-center gap-1.5 rounded border border-dashed bg-green-500/10 px-3 py-1.5 font-mono text-[10px] text-green-400 hover:bg-green-500/20 disabled:opacity-30"
                      >
                        <Send className="size-3" />
                        Confirmer l'envoi
                      </button>
                      <button
                        onClick={() => setPostingForm(null)}
                        className="rounded border border-dashed bg-background px-3 py-1.5 font-mono text-[10px] text-muted-foreground hover:text-foreground"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Candidatures */}
      {submissions.length > 0 && (
        <div className="space-y-3">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">candidatures</p>
          <div className="rounded-xl border border-dashed bg-card divide-y divide-dashed">
            {submissions.map((s) => {
              const form = forms.find((f) => f.id === s.formId);
              const user = users[s.userId];
              const isExpanded = expandedSubmission === s.id;
              return (
                <div key={s.id} className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-2 shrink-0 rounded-full ${
                        s.status === "accepted" ? "bg-green-500" : s.status === "rejected" ? "bg-red-500" : "bg-yellow-500"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[11px] font-bold text-foreground truncate" title={s.userId}>
                        {user?.displayName ?? s.userId}
                      </p>
                      <p className="font-mono text-[9px] text-muted-foreground/60">
                        {form?.title ?? "—"} · {new Date(s.createdAt).toLocaleString("fr-FR")}
                      </p>
                    </div>
                    <span
                      className={`font-mono text-[9px] uppercase tracking-widest ${
                        s.status === "accepted" ? "text-green-500" : s.status === "rejected" ? "text-red-400" : "text-yellow-500"
                      }`}
                    >
                      {s.status === "pending" ? "en attente" : s.status === "accepted" ? "acceptée" : "refusée"}
                    </span>
                    <button
                      onClick={() => setExpandedSubmission(isExpanded ? null : s.id)}
                      className="rounded border border-dashed bg-background p-1.5 text-muted-foreground hover:text-foreground"
                    >
                      {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 ml-5 space-y-3 border-l-2 border-dashed border-blue-500/30 pl-4">
                      {(s.answers ?? []).map((a, i) => (
                        <div key={i}>
                          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70">
                            {a.label}
                          </p>
                          <p className="font-mono text-[11px] text-foreground/80 mt-0.5 whitespace-pre-wrap">
                            {a.answer || "—"}
                          </p>
                        </div>
                      ))}

                      {s.status === "pending" && (
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => reviewSubmission(s.id, "accept")}
                            className="flex items-center gap-1.5 rounded border border-dashed bg-green-500/10 px-3 py-1.5 font-mono text-[10px] text-green-400 hover:bg-green-500/20"
                          >
                            <Check className="size-3" /> Accepter
                          </button>
                          <button
                            onClick={() => reviewSubmission(s.id, "reject")}
                            className="flex items-center gap-1.5 rounded border border-dashed bg-red-500/10 px-3 py-1.5 font-mono text-[10px] text-red-400 hover:bg-red-500/20"
                          >
                            <X className="size-3" /> Refuser
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
