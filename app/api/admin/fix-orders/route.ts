import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Project } from "@/prisma/generated/client";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Récupérer tous les projets triés par ordre puis par date de création
    const projects = await prisma.project.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' }
      ],
    });

    // Réassigner les ordres de façon séquentielle
    const updates = projects.map((project: Project, index: number) => 
      prisma.project.update({
        where: { id: project.id },
        data: { order: index }
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({ 
      message: `Fixed orders for ${projects.length} projects`,
      projects: projects.map((p: Project, i: number) => ({ id: p.id, title: p.title, oldOrder: p.order, newOrder: i }))
    });

  } catch (error) {
    console.error("Error fixing project orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}