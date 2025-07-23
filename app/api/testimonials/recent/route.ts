import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const recentTestimonials = await prisma.testimonial.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        name: true,
        imgUrl: true,
        createdAt: true
      }
    });

    return NextResponse.json(recentTestimonials);
  } catch (error) {
    console.error("Error fetching recent testimonials:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des témoignages" },
      { status: 500 }
    );
  }
}