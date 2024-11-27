// import { prisma } from "@/lib/prisma";
// import { NextResponse } from "next/server";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "https://gael-dev.vercel.app", // En production, remplace * par ton domaine portfolio
//   "Access-Control-Allow-Methods": "GET",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function POST(request: Request) {
//   const body = await request.json();

//   try {
//     const testimonial = await prisma.testimonial.create({
//       data: {
//         name: body.name,
//         role: body.role,
//         imgUrl: body.img,
//         review: body.review,
//       },
//     });

//     return NextResponse.json(testimonial);
//   } catch (error) {
//     console.error("Error saving testimonial:", error);
//     return NextResponse.json(
//       { error: "Failed to save testimonial" },
//       { status: 500 }
//     );
//   }
// }

// export async function GET() {
//   const testimonials = await prisma.testimonial.findMany();

//   return NextResponse.json(testimonials, { headers: corsHeaders });
// }

import { prisma } from "@/lib/prisma";
import { rateLimiter } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://gael-dev.vercel.app",
  "Access-Control-Allow-Methods": "GET, POST",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(request: Request) {
  // Récupérer l'IP du client
  const ip = request.headers.get("x-forwarded-for") || "anonymous";

  // Vérifier le rate limit
  if (!rateLimiter.check(ip)) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    // Validation de base
    if (!body.name || !body.role || !body.review) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Vérifier les longueurs
    if (
      body.name.length > 50 ||
      body.role.length > 50 ||
      body.review.length > 500
    ) {
      return NextResponse.json({ error: "Content too long" }, { status: 400 });
    }

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
  const testimonials = await prisma.testimonial.findMany({
    orderBy: {
      createdAt: "desc", // Assurez-vous d'avoir ce champ dans votre schéma
    },
    take: 50, // Limite le nombre de témoignages retournés
  });

  return NextResponse.json(testimonials, { headers: corsHeaders });
}
