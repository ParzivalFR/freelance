import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Lecture seule : un témoignage ne se crée que par le lien à jeton envoyé au
// client (/api/testimonials/submit).
export async function GET() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(testimonials);
}
