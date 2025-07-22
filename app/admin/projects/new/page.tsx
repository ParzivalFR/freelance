import { ProjectForm } from "@/components/dashboard/project-form";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nouveau Projet</h1>
        <p className="text-muted-foreground">
          Ajoutez un nouveau projet à votre portfolio
        </p>
      </div>

      <ProjectForm />
    </div>
  );
}