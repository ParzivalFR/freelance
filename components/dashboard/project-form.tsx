"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const projectSchema = z.object({
  title: z.string().min(3, "Le titre doit faire au moins 3 caractères"),
  description: z
    .string()
    .min(10, "La description doit faire au moins 10 caractères"),
  url: z.string().url("URL invalide"),
  image: z.string().optional(),
  category: z.string().min(1, "Sélectionnez une catégorie"),
  technologies: z.array(z.string()).min(1, "Ajoutez au moins une technologie"),
  isPublished: z.boolean().default(true),
  order: z.number().min(0),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData & { id: string }>;
}

const categories = [
  { value: "web", label: "Site Web" },
  { value: "app", label: "Application Web" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "landing", label: "Landing Page" },
  { value: "blog", label: "Blog" },
  { value: "other", label: "Autre" },
];

const commonTechnologies = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Tailwind CSS",
  "Prisma",
  "Supabase",
  "Vercel",
  "Figma",
  "WordPress",
  "PHP",
  "MySQL",
  "PostgreSQL",
  "Firebase",
];

export function ProjectForm({ initialData }: ProjectFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    initialData?.image || ""
  );
  const [newTechnology, setNewTechnology] = useState("");

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      url: initialData?.url || "",
      image: initialData?.image || "",
      category: initialData?.category || "",
      technologies: initialData?.technologies || [],
      isPublished: initialData?.isPublished ?? true,
      order: initialData?.order || 0,
    },
  });

  const handleImageUpload = async (file: File) => {
    if (!file) return "";

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Erreur lors de l'upload de l'image");
      return "";
    }
  };

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Clear any existing image validation error
    form.clearErrors("image");
    // Set a temporary value to indicate an image is selected
    form.setValue("image", "temp-file-selected");
  };

  const addTechnology = (tech: string) => {
    const currentTechs = form.getValues("technologies");
    if (!currentTechs.includes(tech)) {
      form.setValue("technologies", [...currentTechs, tech]);
    }
    setNewTechnology("");
  };

  const removeTechnology = (tech: string) => {
    const currentTechs = form.getValues("technologies");
    form.setValue(
      "technologies",
      currentTechs.filter((t) => t !== tech)
    );
  };

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);

    try {
      let imageUrl = data.image;

      // Upload new image if selected
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
        if (!imageUrl) {
          setIsSubmitting(false);
          return;
        }
      }

      // Validate that we have an image (either existing or newly uploaded)
      if (!imageUrl) {
        form.setError("image", { message: "Une image est requise" });
        setIsSubmitting(false);
        return;
      }

      const projectData = {
        ...data,
        image: imageUrl,
      };

      const url = initialData?.id
        ? `/api/admin/projects/${initialData.id}`
        : "/api/admin/projects";

      const method = initialData?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error("Failed to save project");
      }

      toast.success(
        initialData?.id ? "Projet mis à jour" : "Projet créé avec succès"
      );
      router.push("/admin/projects");
      router.refresh();
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre du projet *</FormLabel>
                      <FormControl>
                        <Input placeholder="Mon Super Projet" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez votre projet..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL du projet *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://mon-projet.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem
                                key={category.value}
                                value={category.value}
                              >
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ordre d'affichage</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Publier le projet
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Le projet sera visible sur votre portfolio
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Image du projet</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image *</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {imagePreview && (
                            <div className="relative h-48 w-full overflow-hidden rounded-xl bg-muted">
                              <Image
                                src={imagePreview}
                                alt="Preview"
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex w-full items-center justify-center">
                            <label
                              htmlFor="image-upload"
                              className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/50 hover:bg-muted"
                            >
                              <div className="flex flex-col items-center justify-center pb-6 pt-5">
                                <Upload className="mb-2 size-8 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  Cliquez pour upload une image
                                </p>
                              </div>
                              <input
                                id="image-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={onImageChange}
                              />
                            </label>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technologies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="technologies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technologies utilisées *</FormLabel>
                      <div className="space-y-3">
                        {/* Technologies sélectionnées */}
                        {field.value.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {field.value.map((tech) => (
                              <Badge
                                key={tech}
                                variant="secondary"
                                className="pl-3 pr-1"
                              >
                                {tech}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="ml-1 h-auto p-1"
                                  onClick={() => removeTechnology(tech)}
                                >
                                  <X className="size-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Ajout de nouvelle technologie */}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Nouvelle technologie..."
                            value={newTechnology}
                            onChange={(e) => setNewTechnology(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (newTechnology.trim()) {
                                  addTechnology(newTechnology.trim());
                                }
                              }
                            }}
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              if (newTechnology.trim()) {
                                addTechnology(newTechnology.trim());
                              }
                            }}
                          >
                            <Plus className="size-4" />
                          </Button>
                        </div>

                        {/* Technologies communes */}
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Technologies courantes :
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {commonTechnologies.map((tech) => (
                              <Badge
                                key={tech}
                                variant="outline"
                                className="cursor-pointer hover:bg-secondary"
                                onClick={() => addTechnology(tech)}
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/projects")}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Sauvegarde..."
              : initialData?.id
              ? "Mettre à jour"
              : "Créer le projet"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
