import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

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

export async function GET(request: Request) {
  const testimonials = await prisma.testimonial.findMany();

  return NextResponse.json(testimonials);
}
