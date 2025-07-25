"use client";

import { Edit, ExternalLink, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Project = {
  id: string;
  title: string;
  description: string;
  image: string;
  url: string;
  technologies: string[];
  category: string;
  isPublished: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

interface ProjectsTableProps {
  projects: Project[];
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh the page or update the state
        window.location.reload();
      } else {
        console.error("Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const togglePublish = async (id: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublished: !isPublished }),
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  if (projects.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted">
            <Eye className="size-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Aucun projet</h3>
            <p className="text-muted-foreground">
              Commencez par créer votre premier projet
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/projects/new">Créer un projet</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <Card className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Projet</TableHead>
              <TableHead>Technologies</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Ordre</TableHead>
              <TableHead>Créé</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{project.title}</p>
                      <p className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {project.description}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex max-w-[200px] flex-wrap gap-1">
                    {project.technologies.slice(0, 3).map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {project.technologies.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{project.technologies.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{project.category}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={project.isPublished ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => togglePublish(project.id, project.isPublished)}
                  >
                    {project.isPublished ? "Publié" : "Brouillon"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">{project.order}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {new Date(project.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Ouvrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          <ExternalLink className="mr-2 size-4" />
                          Voir le site
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/projects/${project.id}`}>
                          <Edit className="mr-2 size-4" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(project.id)}
                        disabled={isDeleting === project.id}
                      >
                        <Trash2 className="mr-2 size-4" />
                        {isDeleting === project.id
                          ? "Suppression..."
                          : "Supprimer"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile Cards */}
      <div className="space-y-4 lg:hidden">
        {projects.map((project) => (
          <Card key={project.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate font-medium">{project.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="-mr-2">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Ouvrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          <ExternalLink className="mr-2 size-4" />
                          Voir le site
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/projects/${project.id}`}>
                          <Edit className="mr-2 size-4" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(project.id)}
                        disabled={isDeleting === project.id}
                      >
                        <Trash2 className="mr-2 size-4" />
                        {isDeleting === project.id
                          ? "Suppression..."
                          : "Supprimer"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {project.category}
                  </Badge>
                  <Badge
                    variant={project.isPublished ? "default" : "secondary"}
                    className="cursor-pointer text-xs"
                    onClick={() => togglePublish(project.id, project.isPublished)}
                  >
                    {project.isPublished ? "Publié" : "Brouillon"}
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground">
                    #{project.order}
                  </span>
                </div>
                
                <div className="mt-2 flex flex-wrap gap-1">
                  {project.technologies.slice(0, 4).map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                  {project.technologies.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{project.technologies.length - 4}
                    </Badge>
                  )}
                </div>
                
                <div className="mt-2 text-xs text-muted-foreground">
                  Créé le {new Date(project.createdAt).toLocaleDateString("fr-FR")}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
