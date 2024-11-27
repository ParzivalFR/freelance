import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://gael-dev.vercel.app", // En production, remplace * par ton domaine portfolio
  "Access-Control-Allow-Methods": "GET",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const testimonial = await prisma.testimonial.create({
      data: {
        name: body.name,
        role: body.role,
        imgUrl: body.img,
        review: body.review,
      },
    });

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error("Error saving testimonial:", error);
    return NextResponse.json(
      { error: "Failed to save testimonial" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const testimonials = await prisma.testimonial.findMany();

  return NextResponse.json(testimonials, { headers: corsHeaders });
}
