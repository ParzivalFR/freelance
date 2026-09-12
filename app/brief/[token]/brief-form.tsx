"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BRIEF_SECTIONS,
  type BriefQuestion,
} from "@/lib/brief-questions";

type Answers = Record<string, string | string[]>;

interface BriefFormProps {
  token: string;
  firstName: string;
  company: string | null;
}

export default function BriefForm({
  token,
  firstName,
  company,
}: BriefFormProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  // Le questionnaire est long : on le sauvegarde dans le navigateur à chaque
  // frappe, pour qu'une fermeture d'onglet ou un téléphone qui se verrouille
  // ne fasse pas tout recommencer.
  const storageKey = `brief:${token}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setAnswers(JSON.parse(saved));
    } catch {
      // Navigation privée ou stockage bloqué : on repart d'un formulaire vide.
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(answers));
    } catch {
      // Sans sauvegarde locale, le formulaire fonctionne quand même.
    }
  }, [answers, storageKey]);

  const section = BRIEF_SECTIONS[step];
  const isLast = step === BRIEF_SECTIONS.length - 1;
  const progress = useMemo(
    () => Math.round((step / BRIEF_SECTIONS.length) * 100),
    [step],
  );

  function setAnswer(id: string, value: string | string[]) {
    setAnswers((current) => ({ ...current, [id]: value }));
    setErrors((current) => current.filter((error) => error !== id));
  }

  function toggleOption(id: string, option: string) {
    const current = answers[id];
    const list = Array.isArray(current) ? current : [];
    setAnswer(
      id,
      list.includes(option)
        ? list.filter((item) => item !== option)
        : [...list, option],
    );
  }

  /** Les questions obligatoires sont rares, et bloquent uniquement l'étape. */
  function missingOn(target: typeof section): string[] {
    return target.questions
      .filter((question) => {
        if (!question.required) return false;
        const value = answers[question.id];
        return Array.isArray(value)
          ? value.length === 0
          : !value || !String(value).trim();
      })
      .map((question) => question.id);
  }

  function goNext() {
    const missing = missingOn(section);
    if (missing.length > 0) {
      setErrors(missing);
      toast.error("Il manque une réponse sur cette page.");
      return;
    }
    setErrors([]);
    setStep((current) => current + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setErrors([]);
    setStep((current) => current - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    // On revalide tout le questionnaire : on ne peut pas envoyer un brief
    // incomplet juste parce qu'une étape précédente a été survolée.
    for (const [index, candidate] of BRIEF_SECTIONS.entries()) {
      const missing = missingOn(candidate);
      if (missing.length > 0) {
        setStep(index);
        setErrors(missing);
        toast.error(`Il manque une réponse à l'étape « ${candidate.title} ».`);
        return;
      }
    }

    setSending(true);
    try {
      const response = await fetch(`/api/brief/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Envoi impossible");
      }
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // Sans importance : le formulaire est envoyé.
      }
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Envoi impossible, réessayez dans un instant.",
      );
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-6">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-[#7158ff]/10">
            <Check className="size-8 text-[#7158ff]" />
          </div>
          <h1 className="font-[family-name:var(--font-display)] pt-[0.14em] text-3xl uppercase leading-none text-foreground">
            Merci {firstName} !
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            J&apos;ai bien reçu vos réponses. Je les lis et je reviens vers vous
            sous 24 heures avec une proposition claire et chiffrée.
          </p>
          <p className="mt-6 text-sm text-muted-foreground">
            Vous pouvez fermer cette page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Barre de progression collée en haut : savoir où on en est évite */}
      {/* l'abandon au milieu d'un questionnaire long. */}
      <div className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-2xl px-6 py-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Étape {step + 1} sur {BRIEF_SECTIONS.length}
            </span>
            <span>Vos réponses sont enregistrées au fur et à mesure</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[#7158ff] transition-all duration-500"
              style={{ width: `${Math.max(progress, 4)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 pb-16 pt-10">
        {step === 0 && (
          <div className="mb-10">
            <p className="font-[family-name:var(--font-handwriting)] text-2xl text-[#7158ff]">
              Bonjour {firstName}
            </p>
            <h1 className="mt-1 pt-[0.14em] font-[family-name:var(--font-display)] text-[clamp(1.8rem,5vw,2.6rem)] uppercase leading-none text-foreground">
              Parlons de votre projet
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Quelques questions pour bien comprendre ce dont
              {company ? ` ${company}` : " vous"} avez besoin, et vous préparer
              une proposition juste. Comptez dix minutes. Aucune question
              technique, et vous pouvez répondre « je ne sais pas » sans que ça
              pose le moindre problème.
            </p>
          </div>
        )}

        <div>
          <p className="font-[family-name:var(--font-handwriting)] text-2xl text-[#7158ff]">
            {section.title}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {section.intro}
          </p>
        </div>

        <div className="mt-8 space-y-8">
          {section.questions.map((question) => (
            <Question
              key={question.id}
              question={question}
              value={answers[question.id]}
              invalid={errors.includes(question.id)}
              onChange={(value) => setAnswer(question.id, value)}
              onToggle={(option) => toggleOption(question.id, option)}
            />
          ))}
        </div>

        <div className="mt-12 flex items-center justify-between gap-4">
          {step > 0 ? (
            <Button type="button" variant="ghost" onClick={goBack}>
              <ArrowLeft className="mr-2 size-4" />
              Retour
            </Button>
          ) : (
            <span />
          )}

          {isLast ? (
            <Button
              type="button"
              onClick={submit}
              disabled={sending}
              className="bg-[#7158ff] hover:bg-[#5f47e0]"
            >
              {sending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Send className="mr-2 size-4" />
              )}
              Envoyer mes réponses
            </Button>
          ) : (
            <Button
              type="button"
              onClick={goNext}
              className="bg-[#7158ff] hover:bg-[#5f47e0]"
            >
              Continuer
              <ArrowRight className="ml-2 size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Question({
  question,
  value,
  invalid,
  onChange,
  onToggle,
}: {
  question: BriefQuestion;
  value: string | string[] | undefined;
  invalid: boolean;
  onChange: (value: string) => void;
  onToggle: (option: string) => void;
}) {
  const selected = Array.isArray(value) ? value : [];
  const text = typeof value === "string" ? value : "";

  return (
    <div>
      <label
        htmlFor={question.id}
        className="block text-base font-medium text-foreground"
      >
        {question.label}
        {!question.required && (
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            facultatif
          </span>
        )}
      </label>
      {question.hint && (
        <p className="mt-1 text-sm text-muted-foreground">{question.hint}</p>
      )}

      <div className="mt-3">
        {question.type === "text" && (
          <Input
            id={question.id}
            value={text}
            placeholder={question.placeholder}
            onChange={(event) => onChange(event.target.value)}
            className={invalid ? "border-destructive" : undefined}
          />
        )}

        {question.type === "long" && (
          <Textarea
            id={question.id}
            value={text}
            rows={4}
            placeholder={question.placeholder}
            onChange={(event) => onChange(event.target.value)}
            className={invalid ? "border-destructive" : undefined}
          />
        )}

        {question.type === "choice" && (
          <div
            className={`grid gap-2 ${invalid ? "rounded-lg ring-1 ring-destructive" : ""}`}
          >
            {question.options?.map((option) => {
              const active = text === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onChange(option)}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                    active
                      ? "border-[#7158ff] bg-[#7158ff]/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-[#7158ff]/40 hover:text-foreground"
                  }`}
                >
                  <span
                    className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${
                      active ? "border-[#7158ff]" : "border-muted-foreground/40"
                    }`}
                  >
                    {active && (
                      <span className="size-2 rounded-full bg-[#7158ff]" />
                    )}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        )}

        {question.type === "multi" && (
          <div className="grid gap-2 sm:grid-cols-2">
            {question.options?.map((option) => {
              const active = selected.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onToggle(option)}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                    active
                      ? "border-[#7158ff] bg-[#7158ff]/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-[#7158ff]/40 hover:text-foreground"
                  }`}
                >
                  <span
                    className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                      active
                        ? "border-[#7158ff] bg-[#7158ff]"
                        : "border-muted-foreground/40"
                    }`}
                  >
                    {active && <Check className="size-3 text-white" />}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
