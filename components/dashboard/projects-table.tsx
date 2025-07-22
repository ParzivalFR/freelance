"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal, Eye, Edit, Trash2, ExternalLink } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Refresh the page or update the state
        window.location.reload();
      } else {
        console.error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const togglePublish = async (id: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublished: !isPublished }),
      });
      
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  if (projects.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
            <Eye className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Aucun projet</h3>
            <p className="text-muted-foreground">
              Commencez par créer votre premier projet
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/projects/new">
              Créer un projet
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
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
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{project.title}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {project.description}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-[200px]">
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
                <span className="text-sm font-mono">{project.order}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
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
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Voir le site
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/projects/${project.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(project.id)}
                      disabled={isDeleting === project.id}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isDeleting === project.id ? 'Suppression...' : 'Supprimer'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}