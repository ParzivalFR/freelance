"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  CornerDownLeft,
  Loader2,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import {
  BRIEF_SECTIONS,
  isVisible,
  type BriefQuestion,
} from "@/lib/brief-questions";

type Answers = Record<string, string | string[]>;

interface BriefFormProps {
  token: string;
  firstName: string;
  company: string | null;
}

/** Une question, accompagnée de la section à laquelle elle appartient. */
interface Step {
  question: BriefQuestion;
  sectionTitle: string;
}

/** Lettres affichées à côté des choix, comme raccourci clavier. */
const LETTERS = "ABCDEFGHIJKL".split("");

export default function BriefForm({
  token,
  firstName,
  company,
}: BriefFormProps) {
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(-1); // -1 = écran d'accueil
  const [direction, setDirection] = useState<1 | -1>(1);
  const [shake, setShake] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [restored, setRestored] = useState(false);

  const storageKey = `brief:${token}`;

  // Le questionnaire est long : on le sauvegarde dans le navigateur à chaque
  // frappe, pour qu'une fermeture d'onglet ou un téléphone qui se verrouille
  // ne fasse pas tout recommencer.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setAnswers(JSON.parse(saved));
    } catch {
      // Navigation privée ou stockage bloqué : on repart d'un formulaire vide.
    }
    setRestored(true);
  }, [storageKey]);

  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(answers));
    } catch {
      // Sans sauvegarde locale, le formulaire fonctionne quand même.
    }
  }, [answers, storageKey, restored]);

  // Les questions conditionnelles apparaissent et disparaissent selon les
  // réponses : la liste est donc recalculée à chaque changement.
  const steps = useMemo<Step[]>(
    () =>
      BRIEF_SECTIONS.flatMap((section) =>
        section.questions
          .filter((question) => isVisible(question, answers))
          .map((question) => ({ question, sectionTitle: section.title })),
      ),
    [answers],
  );

  // Revenir en arrière et changer une réponse peut retirer des questions :
  // sans ça, l'index pointerait dans le vide. On tolère `steps.length`, qui
  // est l'écran d'envoi, sinon il devient impossible de terminer.
  useEffect(() => {
    if (index > steps.length) setIndex(steps.length);
  }, [steps.length, index]);

  const step = index >= 0 && index < steps.length ? steps[index] : null;
  const onSummary = index === steps.length;
  const progress =
    steps.length === 0
      ? 0
      : Math.round((Math.max(index, 0) / steps.length) * 100);

  const setAnswer = useCallback((id: string, value: string | string[]) => {
    setAnswers((current) => ({ ...current, [id]: value }));
  }, []);

  // `goNext` est appelé depuis un setTimeout après un choix, pour laisser voir
  // la réponse avant d'avancer. Sans cette référence toujours à jour, il
  // relirait l'état figé au moment du clic — donc sans la réponse qui vient
  // d'être donnée — et refuserait d'avancer sur une question obligatoire.
  const answersRef = useRef(answers);
  answersRef.current = answers;

  /** Une question obligatoire sans réponse bloque l'avancée. */
  const isAnswered = useCallback((question: BriefQuestion) => {
    const value = answersRef.current[question.id];
    return Array.isArray(value)
      ? value.length > 0
      : Boolean(value && String(value).trim());
  }, []);

  const goNext = useCallback(() => {
    if (step && step.question.required && !isAnswered(step.question)) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast.error("Cette réponse est nécessaire pour continuer.");
      return;
    }
    setDirection(1);
    setIndex((current) => Math.min(current + 1, steps.length));
  }, [step, isAnswered, steps.length]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setIndex((current) => Math.max(current - 1, -1));
  }, []);

  async function submit() {
    // On revalide tout : une question obligatoire peut avoir été sautée si
    // elle est réapparue après coup.
    const missing = steps.find(
      ({ question }) => question.required && !isAnswered(question),
    );
    if (missing) {
      const position = steps.indexOf(missing);
      setDirection(-1);
      setIndex(position);
      toast.error("Il manque une réponse.");
      return;
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
      <Screen>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-[#7158ff]/10">
            <Check className="size-8 text-[#7158ff]" />
          </div>
          <h1 className="font-[family-name:var(--font-display)] pt-[0.14em] text-3xl uppercase leading-[1.25] text-foreground">
            Merci {firstName} !
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
            J&apos;ai bien reçu vos réponses. Je les lis et je reviens vers vous
            sous 24 heures avec une proposition claire et chiffrée.
          </p>
          <p className="mt-8 text-sm text-muted-foreground">
            Vous pouvez fermer cette page.
          </p>
        </motion.div>
      </Screen>
    );
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      {/* Progression : discrète mais toujours visible, c'est ce qui évite */}
      {/* l'abandon au milieu. */}
      <div className="fixed inset-x-0 top-0 z-20 h-1 bg-muted">
        <motion.div
          className="h-full bg-[#7158ff]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={index}
          custom={direction}
          initial={{ opacity: 0, y: direction * 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: direction * -40 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="min-h-dvh"
        >
          <Screen>
            <motion.div animate={shake ? { x: [0, -10, 10, -6, 0] } : { x: 0 }}>
              {index === -1 && (
                <Welcome
                  firstName={firstName}
                  company={company}
                  count={steps.length}
                  onStart={goNext}
                />
              )}

              {step && (
                <QuestionScreen
                  step={step}
                  position={index + 1}
                  total={steps.length}
                  value={answers[step.question.id]}
                  onChange={(value) => setAnswer(step.question.id, value)}
                  onNext={goNext}
                />
              )}

              {onSummary && (
                <Summary
                  sending={sending}
                  onSubmit={submit}
                  onReview={() => {
                    setDirection(-1);
                    setIndex(0);
                  }}
                />
              )}
            </motion.div>
          </Screen>
        </motion.div>
      </AnimatePresence>

      {/* Navigation fixe en bas à droite, comme sur les formulaires en ligne */}
      {/* que les gens connaissent déjà. */}
      {index > -1 && (
        <div className="fixed bottom-5 right-5 z-20 flex overflow-hidden rounded-lg border bg-card shadow-sm">
          <button
            type="button"
            onClick={goBack}
            aria-label="Question précédente"
            className="px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronUp className="size-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={onSummary}
            aria-label="Question suivante"
            className="border-l px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
          >
            <ChevronDown className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-20">
      <div className="w-full max-w-xl">{children}</div>
    </div>
  );
}

function Welcome({
  firstName,
  company,
  count,
  onStart,
}: {
  firstName: string;
  company: string | null;
  count: number;
  onStart: () => void;
}) {
  // L'écran d'accueil se passe aussi à la touche Entrée.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Enter") onStart();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onStart]);

  return (
    <div>
      <p className="font-[family-name:var(--font-handwriting)] text-3xl text-[#7158ff]">
        Bonjour {firstName}
      </p>
      <h1 className="mt-2 pt-[0.14em] font-[family-name:var(--font-display)] text-[clamp(2rem,6vw,3rem)] uppercase leading-[1.25] text-foreground">
        Parlons de votre projet
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
        Je vous pose {count} questions, une par une, pour bien comprendre
        votre projet{company ? ` pour ${company}` : ""}. Comptez dix minutes.
      </p>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Aucune question technique. Presque tout est facultatif, et vous pouvez
        répondre « je ne sais pas » sans que ça pose le moindre problème : c&apos;est
        justement mon métier de vous guider ensuite.
      </p>

      <button
        type="button"
        onClick={onStart}
        className="mt-10 inline-flex items-center rounded-lg bg-[#7158ff] px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#5f47e0]"
      >
        Commencer
        <ArrowRight className="ml-2 size-4" />
      </button>
      <p className="mt-4 text-sm text-muted-foreground">
        Vos réponses sont enregistrées au fur et à mesure. Vous pouvez vous
        arrêter et reprendre plus tard avec le même lien.
      </p>
    </div>
  );
}

function QuestionScreen({
  step,
  position,
  total,
  value,
  onChange,
  onNext,
}: {
  step: Step;
  position: number;
  total: number;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  onNext: () => void;
}) {
  const { question } = step;
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const selected = Array.isArray(value) ? value : [];
  const text = typeof value === "string" ? value : "";

  // Le curseur arrive directement dans le champ : une question, une action.
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, [question.id]);

  // Raccourcis lettres sur les listes de choix, comme sur les formulaires
  // auxquels les gens sont habitués.
  useEffect(() => {
    if (question.type !== "choice" && question.type !== "multi") return;

    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "Enter") {
        onNext();
        return;
      }
      const position = LETTERS.indexOf(event.key.toUpperCase());
      const option = question.options?.[position];
      if (position === -1 || !option) return;
      event.preventDefault();

      if (question.type === "choice") {
        onChange(option);
        setTimeout(onNext, 280);
      } else {
        const current = Array.isArray(value) ? value : [];
        onChange(
          current.includes(option)
            ? current.filter((item) => item !== option)
            : [...current, option],
        );
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [question, value, onChange, onNext]);

  function pickChoice(option: string) {
    onChange(option);
    // Petit délai : on laisse voir que le choix est bien pris avant d'avancer.
    setTimeout(onNext, 280);
  }

  function toggleOption(option: string) {
    onChange(
      selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option],
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-3 text-sm">
        <span className="flex items-center gap-1 font-medium text-[#7158ff]">
          {position}
          <ArrowRight className="size-3" />
        </span>
        <span className="text-muted-foreground">
          {step.sectionTitle} · {position} sur {total}
        </span>
      </div>

      <h2 className="text-[clamp(1.4rem,4vw,2rem)] font-semibold leading-snug text-foreground">
        {question.label}
        {!question.required && (
          <span className="ml-2 align-middle text-sm font-normal text-muted-foreground">
            facultatif
          </span>
        )}
      </h2>
      {question.hint && (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {question.hint}
        </p>
      )}

      <div className="mt-8">
        {question.type === "text" && (
          <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type="text"
            value={text}
            placeholder={question.placeholder}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onNext();
              }
            }}
            className="w-full border-0 border-b-2 border-muted-foreground/30 bg-transparent pb-2 text-xl text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-[#7158ff]"
          />
        )}

        {question.type === "long" && (
          <textarea
            ref={inputRef as React.Ref<HTMLTextAreaElement>}
            value={text}
            rows={3}
            placeholder={question.placeholder}
            onChange={(event) => onChange(event.target.value)}
            className="w-full resize-none border-0 border-b-2 border-muted-foreground/30 bg-transparent pb-2 text-xl leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-[#7158ff]"
          />
        )}

        {(question.type === "choice" || question.type === "multi") && (
          <div className="grid gap-2.5">
            {question.options?.map((option, optionIndex) => {
              const active =
                question.type === "choice"
                  ? text === option
                  : selected.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    question.type === "choice"
                      ? pickChoice(option)
                      : toggleOption(option)
                  }
                  className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3.5 text-left text-base transition-all ${
                    active
                      ? "border-[#7158ff] bg-[#7158ff]/10 text-foreground"
                      : "border-border bg-card text-foreground hover:border-[#7158ff]/50 hover:bg-[#7158ff]/5"
                  }`}
                >
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded border text-xs font-semibold ${
                      active
                        ? "border-[#7158ff] bg-[#7158ff] text-white"
                        : "border-muted-foreground/30 text-muted-foreground"
                    }`}
                  >
                    {active ? (
                      <Check className="size-3.5" />
                    ) : (
                      LETTERS[optionIndex]
                    )}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center rounded-lg bg-[#7158ff] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#5f47e0]"
        >
          {question.type === "multi" || question.type === "long"
            ? "Continuer"
            : "OK"}
          <Check className="ml-2 size-4" />
        </button>
        {/* Indice clavier masqué sur mobile, où il n'a aucun sens. */}
        <span className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
          ou appuyez sur <CornerDownLeft className="size-3.5" /> Entrée
        </span>
      </div>
    </div>
  );
}

function Summary({
  sending,
  onSubmit,
  onReview,
}: {
  sending: boolean;
  onSubmit: () => void;
  onReview: () => void;
}) {
  return (
    <div>
      <p className="font-[family-name:var(--font-handwriting)] text-3xl text-[#7158ff]">
        C&apos;est tout !
      </p>
      {/*
        Titres sans capitale accentuee : Black Han Sans dessine ses accents plus
        haut que l'ascendante qu'elle declare, ils se font mordre par la ligne
        du dessus des qu'un titre passe a la ligne.
      */}
      <h2 className="mt-2 pt-[0.14em] font-[family-name:var(--font-display)] text-[clamp(1.8rem,5vw,2.6rem)] uppercase leading-[1.25] text-foreground">
        Merci beaucoup
      </h2>
      <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
        Il ne reste plus qu&apos;à me les envoyer. Je les lis et je reviens vers
        vous sous 24 heures avec une proposition claire et chiffrée.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={sending}
          className="inline-flex items-center rounded-lg bg-[#7158ff] px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#5f47e0] disabled:opacity-60"
        >
          {sending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Send className="mr-2 size-4" />
          )}
          Envoyer mes réponses
        </button>
        <button
          type="button"
          onClick={onReview}
          className="rounded-lg px-4 py-3.5 text-base text-muted-foreground transition-colors hover:text-foreground"
        >
          Relire depuis le début
        </button>
      </div>
    </div>
  );
}
