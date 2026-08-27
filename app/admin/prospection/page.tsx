"use client";

import { PageHeader, SectionTitle } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
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
  Building2,
  Check,
  ChevronDown,
  Download,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Company {
  siren: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  activity: string;
  creationDate: string;
  status: string;
  distance: number;
  distanceApprox?: boolean;
  website?: string | null; // undefined = pas encore vérifié
  phone?: string | null;
  email?: string | null;
  /** true une fois l'entreprise cherchée dans OpenStreetMap, trouvée ou non. */
  enriched?: boolean;
}

interface City {
  name: string;
  code: string;
  postalCodes: string[];
  coordinates: { lat: number; lon: number } | null;
  display: string;
}

const PAGE_SIZE = 30;

export default function ProspectionPage() {
  const { toast } = useToast();

  const [isSearching, setIsSearching] = useState(false);
  const [allResults, setAllResults] = useState<Company[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [addedSirens, setAddedSirens] = useState<Set<string>>(new Set());
  const [addingSiren, setAddingSiren] = useState<string | null>(null);
  const [isCheckingSites, setIsCheckingSites] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [onlyWithoutSite, setOnlyWithoutSite] = useState(false);
  const [onlyWithPhone, setOnlyWithPhone] = useState(false);
  // Centre géocodé de la recherche : Overpass en a besoin pour cadrer sa zone.
  const [searchCenter, setSearchCenter] = useState<{ lat: number; lon: number } | null>(null);

  const [filters, setFilters] = useState({
    location: "",
    radius: "25",
    sector: "all",
    createdSince: "all",
    companySize: "all",
  });

  const [citySuggestions, setCitySuggestions] = useState<City[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const searchCities = async (query: string) => {
    if (query.length < 2) {
      setCitySuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsLoadingCities(true);
    try {
      const response = await fetch(`/api/admin/cities?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setCitySuggestions(data.cities || []);
        setShowSuggestions(true);
      }
    } catch {
      // Suggestions indisponibles — la saisie libre reste possible
    } finally {
      setIsLoadingCities(false);
    }
  };

  const handleLocationChange = (value: string) => {
    setFilters({ ...filters, location: value });
    if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current);
    suggestionTimeoutRef.current = setTimeout(() => searchCities(value), 300);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async () => {
    if (!filters.location.trim()) {
      toast({ title: "Localisation manquante", description: "Saisissez une ville pour lancer la recherche.", variant: "destructive" });
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch("/api/admin/prospection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        toast({
          title: "Recherche impossible",
          description: data.error ?? "L'API Sirene n'a pas répondu.",
          variant: "destructive",
        });
        return;
      }

      const results: Company[] = data.results || [];
      setAllResults(results);
      setVisibleCount(PAGE_SIZE);
      setTotalAvailable(data.totalAvailable || 0);
      setHasSearched(true);
      setOnlyWithoutSite(false);
      setOnlyWithPhone(false);
      setSearchCenter(
        data.baseCoords ? { lat: data.baseCoords.lat, lon: data.baseCoords.lon } : null
      );

      if (results.length === 0) {
        toast({ title: "Aucun résultat", description: "Élargissez le rayon ou retirez des filtres." });
      } else {
        toast({ title: `${results.length} entreprise${results.length > 1 ? "s" : ""} trouvée${results.length > 1 ? "s" : ""}` });
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      }
    } catch {
      toast({ title: "Erreur réseau", description: "Vérifiez votre connexion et réessayez.", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  // Complète les fiches avec les coordonnées OpenStreetMap (téléphone, site,
  // email). Sirene n'en fournit aucune : c'est la seule source gratuite.
  const enrichContacts = async () => {
    const toEnrich = allResults.slice(0, visibleCount).filter((c) => !c.enriched);
    if (toEnrich.length === 0) {
      toast({ title: "Déjà complété", description: "Les fiches affichées ont toutes été cherchées." });
      return;
    }
    if (!searchCenter) {
      toast({
        title: "Relancez la recherche",
        description: "Le centre de la zone est inconnu, impossible d'interroger OpenStreetMap.",
        variant: "destructive",
      });
      return;
    }

    setIsEnriching(true);
    try {
      const response = await fetch("/api/admin/prospection/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companies: toEnrich.map((c) => ({ siren: c.siren, name: c.name })),
          center: searchCenter,
          radius: Number(filters.radius),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast({ title: "Enrichissement impossible", description: data.error ?? "Réessayez.", variant: "destructive" });
        return;
      }

      type EnrichResult = {
        siren: string;
        phone: string | null;
        email: string | null;
        website: string | null;
        found: boolean;
      };
      const bySiren = new Map<string, EnrichResult>(
        (data.results as EnrichResult[]).map((r) => [r.siren, r])
      );

      setAllResults((prev) =>
        prev.map((c) => {
          const match = bySiren.get(c.siren);
          if (!match) return c;
          return {
            ...c,
            enriched: true,
            phone: match.phone,
            email: match.email,
            // Un site trouvé dans OSM fait autorité ; sinon on garde ce que la
            // détection de domaine avait éventuellement déjà établi.
            website: match.website ?? c.website,
          };
        })
      );

      const found = [...bySiren.values()].filter((r) => r.found).length;
      const withPhone = [...bySiren.values()].filter((r) => r.phone).length;
      toast({
        title: "Coordonnées récupérées",
        description: `${found} fiche${found > 1 ? "s" : ""} complétée${found > 1 ? "s" : ""} sur ${bySiren.size} · ${withPhone} avec téléphone.`,
      });
    } catch {
      toast({ title: "Erreur réseau", description: "OpenStreetMap est injoignable.", variant: "destructive" });
    } finally {
      setIsEnriching(false);
    }
  };

  // Teste les domaines probables des entreprises affichées pour repérer
  // celles qui n'ont pas de site — le coeur de la prospection.
  const detectWebsites = async () => {
    const toCheck = allResults.slice(0, visibleCount).filter((c) => c.website === undefined);
    if (toCheck.length === 0) {
      toast({ title: "Déjà vérifié", description: "Les entreprises affichées ont toutes été analysées." });
      return;
    }

    setIsCheckingSites(true);
    try {
      const response = await fetch("/api/admin/prospection/check-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companies: toCheck.map((c) => ({ siren: c.siren, name: c.name })) }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast({ title: "Détection impossible", description: data.error ?? "Réessayez.", variant: "destructive" });
        return;
      }

      const bySiren = new Map<string, string | null>(
        (data.results as { siren: string; website: string | null }[]).map((r) => [r.siren, r.website])
      );
      setAllResults((prev) =>
        prev.map((c) => (bySiren.has(c.siren) ? { ...c, website: bySiren.get(c.siren) ?? null } : c))
      );

      const withoutSite = [...bySiren.values()].filter((w) => w === null).length;
      toast({
        title: "Détection terminée",
        description: `${withoutSite} entreprise${withoutSite > 1 ? "s" : ""} sans site détecté sur ${bySiren.size} analysée${bySiren.size > 1 ? "s" : ""}.`,
      });
    } finally {
      setIsCheckingSites(false);
    }
  };

  const escapeCsv = (value: string) => `"${String(value ?? "").replace(/"/g, '""')}"`;

  const exportToCsv = () => {
    const rows = [
      ["Nom", "Adresse", "Code postal", "Ville", "Téléphone", "Email", "Site web", "Code NAF", "Date de création", "Distance (km)", "SIREN"],
      ...visibleResults.map((c) => [
        c.name,
        c.address,
        c.postalCode,
        c.city,
        c.phone ?? "",
        c.email ?? "",
        c.website === undefined ? "Non vérifié" : (c.website ?? "Aucun détecté"),
        c.activity,
        c.creationDate,
        c.distanceApprox ? `~${c.distance}` : String(c.distance),
        c.siren,
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prospects-${filters.location.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const addToClients = async (company: Company) => {
    setAddingSiren(company.siren);
    try {
      const response = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: company.name,
          lastName: "",
          // Jamais inventé : soit OpenStreetMap l'a fourni, soit on laisse
          // vide. Un email devine finirait en bounce et abîmerait la
          // réputation d'envoi du domaine.
          email: company.email ?? "",
          phone: company.phone ?? "",
          address: `${company.address}, ${company.postalCode} ${company.city}`,
          company: company.name,
          website: company.website ?? "",
          isProfessional: true,
          status: "prospect",
          subject: "Prospection — création de site",
          internalNote: [
            `Prospect trouvé via la recherche Sirene.`,
            `SIREN : ${company.siren}`,
            `Secteur (NAF) : ${company.activity}`,
            `Créée le : ${company.creationDate}`,
            `Distance : ${company.distanceApprox ? "~" : ""}${company.distance} km`,
            company.website === undefined
              ? `Site web : non vérifié`
              : company.website
                ? `Site web détecté : ${company.website}`
                : `Aucun site détecté`,
            company.phone ? `Téléphone : ${company.phone}` : `Téléphone : inconnu`,
          ].join("\n"),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast({ title: "Ajout impossible", description: data.error ?? "Réessayez.", variant: "destructive" });
        return;
      }

      setAddedSirens((prev) => new Set(prev).add(company.siren));
      toast({ title: "Prospect ajouté", description: `${company.name} est dans vos clients (email à compléter).` });
    } catch {
      toast({ title: "Erreur réseau", description: "Impossible d'ajouter au CRM.", variant: "destructive" });
    } finally {
      setAddingSiren(null);
    }
  };

  const filtered = allResults.filter(
    (c) => (!onlyWithoutSite || c.website === null) && (!onlyWithPhone || Boolean(c.phone))
  );
  const visibleResults = filtered.slice(0, visibleCount);
  const withoutSiteCount = allResults.filter((c) => c.website === null).length;
  const withPhoneCount = allResults.filter((c) => c.phone).length;

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <PageHeader
        eyebrow="Trouver des clients"
        title="Pros"
        titleAccent="pection"
        description="Recherchez les entreprises autour de vous via la base Sirene (INSEE), repérez celles qui n'ont pas encore de site web, et ajoutez-les à votre CRM en un clic."
      />

      {/* Filtres */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="relative space-y-2" ref={suggestionsRef}>
            <Label>Ville de référence</Label>
            <div className="relative">
              <Input
                placeholder="Ex : Saint-Nazaire"
                value={filters.location}
                onChange={(e) => handleLocationChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pr-8"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                {isLoadingCities ? (
                  <Loader2 className="size-4 animate-spin text-[#7158ff]" />
                ) : (
                  <ChevronDown className="size-4 text-muted-foreground" />
                )}
              </div>
            </div>

            {showSuggestions && citySuggestions.length > 0 && (
              <div className="shadow-lg absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border bg-background p-1">
                {citySuggestions.map((city, index) => (
                  <button
                    type="button"
                    key={`${city.code}-${index}`}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => {
                      setFilters({ ...filters, location: city.display });
                      setShowSuggestions(false);
                      setCitySuggestions([]);
                    }}
                  >
                    <MapPin className="size-4 shrink-0 text-muted-foreground" />
                    <span>{city.display}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Rayon</Label>
            <Select value={filters.radius} onValueChange={(v) => setFilters({ ...filters, radius: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["5", "10", "25", "50", "100"].map((r) => (
                  <SelectItem key={r} value={r}>{r} km</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Secteur d&apos;activité</Label>
            <Select value={filters.sector} onValueChange={(v) => setFilters({ ...filters, sector: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous secteurs</SelectItem>
                <SelectItem value="restaurants">Restaurants</SelectItem>
                <SelectItem value="commerce">Commerce de détail</SelectItem>
                <SelectItem value="artisans">Artisans / BTP</SelectItem>
                <SelectItem value="services">Services aux entreprises</SelectItem>
                <SelectItem value="sante">Santé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Créée depuis</Label>
            <Select value={filters.createdSince} onValueChange={(v) => setFilters({ ...filters, createdSince: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes périodes</SelectItem>
                <SelectItem value="1month">1 mois</SelectItem>
                <SelectItem value="3months">3 mois</SelectItem>
                <SelectItem value="6months">6 mois</SelectItem>
                <SelectItem value="1year">1 an</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Taille</Label>
            <Select value={filters.companySize} onValueChange={(v) => setFilters({ ...filters, companySize: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes tailles</SelectItem>
                <SelectItem value="tpe">TPE (1-9 salariés)</SelectItem>
                <SelectItem value="pme">PME (10-249 salariés)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleSearch}
              disabled={isSearching || !filters.location.trim()}
              className="w-full ring-4 ring-[#7158ff]/20"
            >
              {isSearching ? (
                <><Loader2 className="mr-2 size-4 animate-spin" />Recherche…</>
              ) : (
                <><Search className="mr-2 size-4" />Rechercher</>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div ref={resultsRef} className="space-y-4">
        {hasSearched && allResults.length > 0 && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <SectionTitle>Résultats</SectionTitle>
                <p className="text-sm text-muted-foreground">
                  {visibleResults.length} affichée{visibleResults.length > 1 ? "s" : ""} sur {filtered.length}
                  {totalAvailable > allResults.length && ` · ${totalAvailable.toLocaleString("fr-FR")} dans la base`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={enrichContacts} disabled={isEnriching} className="ring-4 ring-[#7158ff]/20">
                  {isEnriching ? (
                    <><Loader2 className="mr-2 size-4 animate-spin" />Recherche…</>
                  ) : (
                    <><Phone className="mr-2 size-4" />Récupérer les coordonnées</>
                  )}
                </Button>
                <Button variant="outline" onClick={detectWebsites} disabled={isCheckingSites}>
                  {isCheckingSites ? (
                    <><Loader2 className="mr-2 size-4 animate-spin" />Analyse…</>
                  ) : (
                    <><Sparkles className="mr-2 size-4" />Détecter les sites web</>
                  )}
                </Button>
                {withoutSiteCount > 0 && (
                  <Button
                    variant={onlyWithoutSite ? "default" : "outline"}
                    onClick={() => setOnlyWithoutSite((v) => !v)}
                  >
                    Sans site ({withoutSiteCount})
                  </Button>
                )}
                {withPhoneCount > 0 && (
                  <Button
                    variant={onlyWithPhone ? "default" : "outline"}
                    onClick={() => setOnlyWithPhone((v) => !v)}
                  >
                    Avec téléphone ({withPhoneCount})
                  </Button>
                )}
                <Button variant="outline" onClick={exportToCsv}>
                  <Download className="mr-2 size-4" />CSV
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {visibleResults.map((company) => {
                const isAdded = addedSirens.has(company.siren);
                return (
                  <div
                    key={company.siren}
                    className="rounded-2xl border bg-card p-5 transition-colors hover:border-[#7158ff]/40"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-foreground">{company.name}</h3>
                          {company.website === undefined ? (
                            <Badge variant="outline" className="text-muted-foreground">Site non vérifié</Badge>
                          ) : company.website ? (
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-full border border-orange-300 bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300"
                            >
                              <Globe className="size-3" />A déjà un site
                            </a>
                          ) : (
                            <Badge className="border-green-300 bg-green-50 text-green-700 hover:bg-green-50 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
                              Pas de site détecté
                            </Badge>
                          )}
                          <Badge variant="outline">
                            <MapPin className="mr-1 size-3" />
                            {company.distanceApprox ? "~" : ""}{company.distance} km
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm text-muted-foreground md:grid-cols-2">
                          <p>{company.address}, {company.postalCode} {company.city}</p>
                          <p>Code NAF : {company.activity}</p>
                          <p>
                            Créée le{" "}
                            {company.creationDate
                              ? new Date(company.creationDate).toLocaleDateString("fr-FR")
                              : "—"}
                          </p>
                          <p>SIREN : {company.siren}</p>
                        </div>

                        {(company.phone || company.email) && (
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {company.phone && (
                              <a
                                href={`tel:${company.phone.replace(/\s/g, "")}`}
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#7158ff]/40 bg-[#7158ff]/5 px-3 py-1 text-sm font-medium text-[#7158ff] transition-colors hover:bg-[#7158ff]/10"
                              >
                                <Phone className="size-3.5" />
                                {company.phone}
                              </a>
                            )}
                            {company.email && (
                              <a
                                href={`mailto:${company.email}`}
                                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-[#7158ff]/40 hover:text-[#7158ff]"
                              >
                                <Mail className="size-3.5" />
                                {company.email}
                              </a>
                            )}
                          </div>
                        )}

                        {company.enriched && !company.phone && !company.email && (
                          <p className="mt-3 text-xs italic text-muted-foreground">
                            Aucune coordonnée publique trouvée — à chercher à la main.
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-col gap-2">
                        <Button
                          size="sm"
                          variant={isAdded ? "outline" : "default"}
                          disabled={isAdded || addingSiren === company.siren}
                          onClick={() => addToClients(company)}
                        >
                          {addingSiren === company.siren ? (
                            <><Loader2 className="mr-1 size-4 animate-spin" />Ajout…</>
                          ) : isAdded ? (
                            <><Check className="mr-1 size-4" />Ajouté</>
                          ) : (
                            <><Plus className="mr-1 size-4" />Ajouter au CRM</>
                          )}
                        </Button>
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(`${company.name} ${company.city}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-[#7158ff]/40 hover:text-[#7158ff]"
                        >
                          <ExternalLink className="size-3" />
                          Google
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {visibleCount < filtered.length && (
              <Button
                variant="outline"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="w-full"
              >
                <Plus className="mr-2 size-4" />
                Voir {Math.min(PAGE_SIZE, filtered.length - visibleCount)} de plus
              </Button>
            )}
          </>
        )}

        {hasSearched && allResults.length === 0 && (
          <div className="rounded-2xl border border-dashed bg-card p-12 text-center">
            <Building2 className="mx-auto mb-4 size-10 text-muted-foreground/50" />
            <h3 className="mb-1 font-semibold">Aucune entreprise trouvée</h3>
            <p className="text-sm text-muted-foreground">
              Élargissez le rayon de recherche ou retirez des filtres.
            </p>
          </div>
        )}

        {!hasSearched && (
          <div className="rounded-2xl border border-dashed bg-card p-12 text-center">
            <Search className="mx-auto mb-4 size-10 text-muted-foreground/50" />
            <h3 className="mb-1 font-semibold">Lancez une recherche</h3>
            <p className="text-sm text-muted-foreground">
              Saisissez une ville pour trouver des entreprises autour de vous.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
