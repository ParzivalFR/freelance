"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, Building2, Calendar, Globe, Download, Plus, ChevronDown } from "lucide-react";

interface Company {
  siren: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  activity: string;
  creationDate: string;
  status: string;
  hasWebsite?: boolean;
  distance?: number;
}

interface City {
  name: string;
  code: string;
  postalCodes: string[];
  coordinates: { lat: number; lon: number } | null;
  display: string;
}

export default function ProspectionPage() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  
  // Debug: log searchResults à chaque changement
  useEffect(() => {
    console.log('🔄 searchResults mis à jour:', searchResults.length, 'éléments');
    console.log('🔄 Contenu:', searchResults);
  }, [searchResults]);
  
  const [filters, setFilters] = useState({
    location: "",
    radius: "25",
    sector: "",
    createdSince: "",
    companySize: ""
  });

  // États pour l'autocomplétion des villes
  const [citySuggestions, setCitySuggestions] = useState<City[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout>();
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fonction pour rechercher les villes
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
    } catch (error) {
      console.error('Erreur recherche villes:', error);
    } finally {
      setIsLoadingCities(false);
    }
  };

  // Gérer la saisie dans le champ localisation
  const handleLocationChange = (value: string) => {
    setFilters({ ...filters, location: value });
    
    // Debouncer la recherche
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }
    
    suggestionTimeoutRef.current = setTimeout(() => {
      searchCities(value);
    }, 300);
  };

  // Sélectionner une ville
  const selectCity = (city: City) => {
    setFilters({ ...filters, location: city.display });
    setShowSuggestions(false);
    setCitySuggestions([]);
  };

  // Fermer les suggestions si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async () => {
    if (!filters.location.trim()) {
      alert("Veuillez saisir une localisation");
      return;
    }

    setIsSearching(true);
    
    try {
      const response = await fetch('/api/admin/prospection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche');
      }

      const data = await response.json();
      
      console.log('🔍 Données reçues côté client:', data);
      console.log('🔍 Type de data:', typeof data);
      console.log('🔍 Clés de data:', Object.keys(data));
      
      if (data.success) {
        console.log('✅ Success = true');
        console.log('🔍 data.results type:', typeof data.results);
        console.log('🔍 data.results is array:', Array.isArray(data.results));
        console.log('🔍 Nombre de résultats:', data.results?.length || 0);
        console.log('🔍 Premier élément:', data.results?.[0]);
        
        const resultsToSet = data.results || [];
        console.log('🔍 Résultats à setter:', resultsToSet);
        setSearchResults(resultsToSet);
        
        // Vérifier après le setState (avec un petit délai)
        setTimeout(() => {
          console.log('🔍 searchResults après setState:', searchResults.length);
        }, 100);
      } else {
        console.log('❌ Success = false, erreur:', data.error);
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Erreur de recherche:', error);
      alert('Erreur lors de la recherche. Vérifiez votre connexion et réessayez.');
      // En cas d'erreur, on affiche des données de test
      setSearchResults([
        {
          siren: "123456789",
          name: "Boulangerie Martin (Test)",
          address: "12 rue de la Paix",
          city: "Reims",
          postalCode: "51100",
          activity: "Boulangerie-pâtisserie",
          creationDate: "2024-01-15",
          status: "Active",
          hasWebsite: false,
          distance: 2.5
        }
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  const exportToCsv = () => {
    const csvContent = [
      ["Nom", "Adresse", "Ville", "Secteur", "Date création", "A un site", "Distance"],
      ...searchResults.map(company => [
        company.name,
        company.address,
        company.city,
        company.activity,
        company.creationDate,
        company.hasWebsite ? "Oui" : "Non",
        `${company.distance} km`
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prospects.csv";
    a.click();
  };

  const addToClients = async (company: Company) => {
    try {
      const response = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: company.name.split(' ')[0] || company.name,
          lastName: company.name.split(' ').slice(1).join(' ') || 'Entreprise',
          email: `contact@${company.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.fr`,
          phone: '',
          address: `${company.address}, ${company.postalCode} ${company.city}`,
          company: company.name,
          website: '',
          isProfessional: true,
          status: 'prospect',
          subject: 'Création site vitrine - Prospection automatique',
          internalNote: `Prospect trouvé via recherche automatique.\nSecteur: ${company.activity}\nCréée le: ${company.creationDate}\nDistance: ${company.distance}km\nSIREN: ${company.siren}`
        }),
      });

      if (response.ok) {
        alert(`${company.name} ajouté aux clients !`);
      } else {
        throw new Error('Erreur lors de l\'ajout');
      }
    } catch (error) {
      console.error('Erreur ajout client:', error);
      alert('Erreur lors de l\'ajout au CRM');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border/40 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Search className="h-8 w-8 text-blue-600" />
              Prospection d'Entreprises
            </h1>
            <p className="mt-2 text-muted-foreground">
              Trouvez de nouveaux prospects pour vos sites vitrines
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-600 border-green-200">
              API Sirene connectée
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList>
          <TabsTrigger value="search">Recherche</TabsTrigger>
          <TabsTrigger value="results">Résultats ({searchResults.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          {/* Filtres de recherche */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Critères de Recherche
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2 relative" ref={suggestionsRef}>
                <Label>Localisation de base</Label>
                <div className="relative">
                  <Input
                    placeholder="Votre ville (ex: Reims)"
                    value={filters.location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    className="pr-8"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    {isLoadingCities ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                
                {/* Suggestions dropdown */}
                {showSuggestions && citySuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {citySuggestions.map((city, index) => (
                      <div
                        key={`${city.code}-${index}`}
                        className="px-3 py-2 hover:bg-muted cursor-pointer flex items-center gap-2"
                        onClick={() => selectCity(city)}
                      >
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{city.display}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Rayon de recherche</Label>
                <Select value={filters.radius} onValueChange={(value) => setFilters({...filters, radius: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 km</SelectItem>
                    <SelectItem value="10">10 km</SelectItem>
                    <SelectItem value="25">25 km</SelectItem>
                    <SelectItem value="50">50 km</SelectItem>
                    <SelectItem value="100">100 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Secteur d'activité</Label>
                <Select value={filters.sector} onValueChange={(value) => setFilters({...filters, sector: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous secteurs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous secteurs</SelectItem>
                    <SelectItem value="restaurants">Restaurants</SelectItem>
                    <SelectItem value="commerce">Commerce de détail</SelectItem>
                    <SelectItem value="artisans">Artisans</SelectItem>
                    <SelectItem value="services">Services aux entreprises</SelectItem>
                    <SelectItem value="sante">Santé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Créées depuis</Label>
                <Select value={filters.createdSince} onValueChange={(value) => setFilters({...filters, createdSince: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes périodes" />
                  </SelectTrigger>
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
                <Label>Taille d'entreprise</Label>
                <Select value={filters.companySize} onValueChange={(value) => setFilters({...filters, companySize: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes tailles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes tailles</SelectItem>
                    <SelectItem value="micro">Micro-entreprise</SelectItem>
                    <SelectItem value="tpe">TPE (1-9 salariés)</SelectItem>
                    <SelectItem value="pme">PME (10-249 salariés)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={handleSearch} 
                  disabled={isSearching || !filters.location}
                  className="w-full"
                >
                  {isSearching ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Recherche...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Rechercher
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {searchResults.length > 0 && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {searchResults.length} entreprise{searchResults.length > 1 ? 's' : ''} trouvée{searchResults.length > 1 ? 's' : ''}
              </p>
              <Button variant="outline" onClick={exportToCsv}>
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
            </div>
          )}

          {/* Résultats */}
          <div className="grid grid-cols-1 gap-4">
            {console.log('🎨 Rendu des résultats, searchResults.length:', searchResults.length)}
            {searchResults.map((company) => (
              <Card key={company.siren} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{company.name}</h3>
                        <Badge variant={company.hasWebsite ? "destructive" : "secondary"}>
                          {company.hasWebsite ? (
                            <>
                              <Globe className="h-3 w-3 mr-1" />
                              A un site
                            </>
                          ) : (
                            "Pas de site détecté"
                          )}
                        </Badge>
                        <Badge variant="outline">
                          <MapPin className="h-3 w-3 mr-1" />
                          {company.distance} km
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <p><strong>Adresse:</strong> {company.address}, {company.postalCode} {company.city}</p>
                          <p><strong>Activité:</strong> {company.activity}</p>
                        </div>
                        <div>
                          <p><strong>Créée le:</strong> {new Date(company.creationDate).toLocaleDateString()}</p>
                          <p><strong>SIREN:</strong> {company.siren}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => addToClients(company)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter aux clients
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {searchResults.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun résultat</h3>
                <p className="text-muted-foreground">
                  Lancez une recherche pour trouver des prospects
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}