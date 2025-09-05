import DevisGenerator from '@/components/ui/DevisGenerator';

export default function DevisPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Générateur de Devis</h1>
        <p className="text-muted-foreground">
          Créez et générez vos devis professionnels au format PDF
        </p>
      </div>
      <DevisGenerator />
    </div>
  );
}