import { NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await requireAdmin()) return unauthorizedResponse();

    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await requireAdmin()) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      image,
      url,
      technologies,
      category,
      isPublished,
      order,
    } = body;

    // Si l'ordre a changé, décaler les autres projets
    const current = await prisma.project.findUnique({ where: { id }, select: { order: true } });
    const oldOrder = current?.order ?? order;

    if (order !== undefined && order !== oldOrder) {
      if (order > oldOrder) {
        // Déplacement vers le bas → décaler vers le haut les projets entre oldOrder+1 et newOrder
        await prisma.project.updateMany({
          where: { id: { not: id }, order: { gt: oldOrder, lte: order } },
          data: { order: { decrement: 1 } },
        });
      } else {
        // Déplacement vers le haut → décaler vers le bas les projets entre newOrder et oldOrder-1
        await prisma.project.updateMany({
          where: { id: { not: id }, order: { gte: order, lt: oldOrder } },
          data: { order: { increment: 1 } },
        });
      }
    }

    const project = await prisma.project.update({
      where: { id },
      data: { title, description, image, url, technologies, category, isPublished, order },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await requireAdmin()) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();

    const project = await prisma.project.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await requireAdmin()) return unauthorizedResponse();

    const { id } = await params;
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
