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
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin":
    process.env.NEXT_PUBLIC_SITE_URL || "https://gael-dev.vercel.app",
  "Access-Control-Allow-Methods": "POST, GET",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Validation simple des données
function validateTestimonial(data: any) {
  const errors = [];

  if (
    !data.name ||
    typeof data.name !== "string" ||
    data.name.length < 2 ||
    data.name.length > 50
  ) {
    errors.push("Name must be between 2 and 50 characters");
  }

  if (
    !data.role ||
    typeof data.role !== "string" ||
    data.role.length < 2 ||
    data.role.length > 50
  ) {
    errors.push("Role must be between 2 and 50 characters");
  }

  if (
    !data.review ||
    typeof data.review !== "string" ||
    data.review.length < 10 ||
    data.review.length > 500
  ) {
    errors.push("Review must be between 10 and 500 characters");
  }

  if (data.imgUrl && typeof data.imgUrl === "string") {
    try {
      new URL(data.imgUrl);
    } catch {
      errors.push("Invalid image URL");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export async function POST(request: Request) {
  try {
    // 1. Vérifier le Content-Type
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415, headers: corsHeaders }
      );
    }

    // 2. Vérifier la taille de la requête
    const body = await request.json();
    const requestSize = JSON.stringify(body).length;
    if (requestSize > 10240) {
      // 10KB
      return NextResponse.json(
        { error: "Request body too large" },
        { status: 413, headers: corsHeaders }
      );
    }

    // 3. Valider les données
    const validation = validateTestimonial(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.errors },
        { status: 400, headers: corsHeaders }
      );
    }

    // 4. Nettoyer les données
    const sanitizedData = {
      name: body.name.trim(),
      role: body.role.trim(),
      imgUrl: body.imgUrl?.trim(),
      review: body.review.trim(),
    };

    // 5. Sauvegarder dans la base de données
    const testimonial = await prisma.testimonial.create({
      data: sanitizedData,
    });

    return NextResponse.json(testimonial, {
      headers: corsHeaders,
      status: 201,
    });
  } catch (error) {
    console.error("Error saving testimonial:", error);
    return NextResponse.json(
      { error: "Failed to save testimonial" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      take: 100, // Limite le nombre de résultats
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(testimonials, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Gérer les requêtes OPTIONS pour CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
