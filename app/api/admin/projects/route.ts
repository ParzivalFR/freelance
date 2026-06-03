import { NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    if (!await requireAdmin()) return unauthorizedResponse();

    const projects = await prisma.project.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!await requireAdmin()) return unauthorizedResponse();

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

    // Auto-incrément de l'ordre si non fourni
    let finalOrder = order;
    if (finalOrder === undefined || finalOrder === null || finalOrder === 0) {
      const maxOrderResult = await prisma.project.findFirst({
        orderBy: { order: 'desc' },
        select: { order: true }
      });
      finalOrder = (maxOrderResult?.order ?? -1) + 1;
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        image,
        url,
        technologies,
        category,
        isPublished: isPublished ?? true,
        order: finalOrder,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
