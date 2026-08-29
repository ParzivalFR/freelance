"use client";

import { PageHeader, SectionTitle } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  BACKGROUNDS,
  FORMATS,
  renderSocialCard,
  type BackgroundId,
  type FormatId,
  type FrameId,
  type LayoutId,
} from "@/lib/social-canvas";
import { Download, ImageUp, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Project {
  id: string;
  title: string;
  category: string | null;
  technologies: string[];
}

const BACKGROUND_IDS = Object.keys(BACKGROUNDS) as BackgroundId[];
const FORMAT_IDS = Object.keys(FORMATS) as FormatId[];

const FRAMES: { id: FrameId; label: string; hint: string }[] = [
  { id: "navigateur", label: "Navigateur", hint: "Pour un site web" },
  { id: "aucun", label: "Aucun", hint: "Pour une app mobile" },
];

const LAYOUTS: { id: LayoutId; label: string; hint: string }[] = [
  { id: "titre-haut", label: "Titre en haut", hint: "On lit d'abord" },
  { id: "titre-bas", label: "Titre en bas", hint: "On voit d'abord" },
];

export default function SocialGeneratorPage() {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const displayProbe = useRef<HTMLSpanElement>(null);
  const bodyProbe = useRef<HTMLSpanElement>(null);
  const handProbe = useRef<HTMLSpanElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState("");
  const [note, setNote] = useState("");
  const [format, setFormat] = useState<FormatId>("post");
  const [background, setBackground] = useState<BackgroundId>("violet");
  const [frame, setFrame] = useState<FrameId>("navigateur");
  const [layout, setLayout] = useState<LayoutId>("titre-haut");
  const [hasImage, setHasImage] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => setProjects(Array.isArray(data) ? data : (data?.projects ?? [])))
      .catch(() => {});
  }, []);

  // next/font génère un nom de famille unique par build : on le lit sur des
  // sondes cachées plutôt que de coder en dur un nom qui n'existe pas.
  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !displayProbe.current || !bodyProbe.current || !handProbe.current) return;
    renderSocialCard(canvas, {
      image: imageRef.current,
      format,
      title,
      subtitle,
      badge,
      note,
      background,
      frame,
      layout,
      displayFont: getComputedStyle(displayProbe.current).fontFamily,
      bodyFont: getComputedStyle(bodyProbe.current).fontFamily,
      handFont: getComputedStyle(handProbe.current).fontFamily,
    });
  }, [title, subtitle, badge, note, format, background, frame, layout]);

  useEffect(() => {
    if (fontsReady) draw();
  }, [draw, fontsReady]);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Fichier non pris en charge", description: "Déposez une image (PNG ou JPG).", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        setHasImage(true);
        draw();
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const applyProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    setTitle(project.title);
    setSubtitle((project.technologies ?? []).slice(0, 4).join(" · "));
    // Une app mobile n'a pas de barre de navigateur.
    setFrame(project.category === "mobile" ? "aucun" : "navigateur");
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const slug = (title || "post").toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug || "post"}-instagram.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      {/* Sondes cachées : servent uniquement à résoudre les noms de police. */}
      <span ref={displayProbe} aria-hidden className="pointer-events-none absolute opacity-0 font-[family-name:var(--font-display)]" />
      <span ref={bodyProbe} aria-hidden className="pointer-events-none absolute opacity-0 font-[family-name:var(--font-body)]" />
      <span ref={handProbe} aria-hidden className="pointer-events-none absolute opacity-0 font-[family-name:var(--font-handwriting)]" />

      <PageHeader
        eyebrow="Alimenter Instagram"
        title="Visuels "
        titleAccent="projets"
        description="Déposez une capture, réglez en quelques clics, récupérez le visuel aux couleurs du site — post, story ou carré. Le décor se pose derrière la capture, jamais dessus : elle reste nette et lisible en vignette."
        actions={
          <Button onClick={download} disabled={!hasImage} className="ring-4 ring-[#7158ff]/20">
            <Download className="mr-2 size-4" />
            Télécharger
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        {/* Aperçu */}
        <div className="space-y-3">
          <SectionTitle>Aperçu</SectionTitle>
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFile(e.dataTransfer.files?.[0]);
            }}
            className="relative block cursor-pointer overflow-hidden rounded-2xl border bg-card transition-colors hover:border-[#7158ff]/40"
          >
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <canvas ref={canvasRef} className="block h-auto w-full" />
            {!hasImage && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/85 text-center">
                {fontsReady ? (
                  <ImageUp className="size-10 text-[#7158ff]" />
                ) : (
                  <Loader2 className="size-8 animate-spin text-[#7158ff]" />
                )}
                <p className="font-semibold text-foreground">Déposez votre capture</p>
                <p className="max-w-xs text-sm text-muted-foreground">
                  Le mockup shots.so, ou directement une capture d&apos;écran. Rien n&apos;est
                  envoyé sur le serveur, tout est calculé ici.
                </p>
              </div>
            )}
          </label>
        </div>

        {/* Réglages */}
        <div className="space-y-6">
          <SectionTitle>Réglages</SectionTitle>

          <div className="space-y-2">
            <Label>Reprendre un projet</Label>
            <Select onValueChange={applyProject}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir dans le portfolio…" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="social-title">Titre</Label>
            <Input
              id="social-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Fleetly"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social-subtitle">Sous-titre</Label>
            <Input
              id="social-subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Expo · React Native · Supabase"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social-badge">Pastille</Label>
            <Input
              id="social-badge"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="Sur l'App Store"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social-note">Annotation manuscrite</Label>
            <Input
              id="social-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="essaie-moi, je suis vivante !"
            />
          </div>

          <div className="space-y-2">
            <Label>Format</Label>
            <div className="flex gap-2">
              {FORMAT_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFormat(id)}
                  className={`flex-1 rounded-xl border p-3 text-left transition-colors ${
                    format === id
                      ? "border-[#7158ff] ring-4 ring-[#7158ff]/15"
                      : "hover:border-[#7158ff]/40"
                  }`}
                >
                  <span className="block text-xs font-semibold text-foreground">
                    {FORMATS[id].label}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {FORMATS[id].hint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Fond</Label>
            <div className="flex gap-2">
              {BACKGROUND_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setBackground(id)}
                  className={`flex-1 rounded-xl border p-2 text-xs font-medium transition-colors ${
                    background === id
                      ? "border-[#7158ff] ring-4 ring-[#7158ff]/15"
                      : "hover:border-[#7158ff]/40"
                  }`}
                >
                  <span
                    className="mb-1.5 block h-8 w-full rounded-lg border"
                    style={{
                      background: `linear-gradient(135deg, ${BACKGROUNDS[id].from}, ${BACKGROUNDS[id].to})`,
                    }}
                  />
                  {BACKGROUNDS[id].label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cadre</Label>
            <div className="flex gap-2">
              {FRAMES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFrame(f.id)}
                  className={`flex-1 rounded-xl border p-3 text-left transition-colors ${
                    frame === f.id
                      ? "border-[#7158ff] ring-4 ring-[#7158ff]/15"
                      : "hover:border-[#7158ff]/40"
                  }`}
                >
                  <span className="block text-xs font-semibold text-foreground">{f.label}</span>
                  <span className="block text-[11px] text-muted-foreground">{f.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Composition</Label>
            <div className="flex gap-2">
              {LAYOUTS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLayout(l.id)}
                  className={`flex-1 rounded-xl border p-3 text-left transition-colors ${
                    layout === l.id
                      ? "border-[#7158ff] ring-4 ring-[#7158ff]/15"
                      : "hover:border-[#7158ff]/40"
                  }`}
                >
                  <span className="block text-xs font-semibold text-foreground">{l.label}</span>
                  <span className="block text-[11px] text-muted-foreground">{l.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="rounded-xl border border-dashed p-3 text-xs leading-relaxed text-muted-foreground">
            Gardez le même fond sur plusieurs posts d&apos;affilée, ou alternez violet et
            sombre : c&apos;est la répétition qui fait qu&apos;une grille paraît soignée, pas
            la variété.
          </p>
        </div>
      </div>
    </div>
  );
}
