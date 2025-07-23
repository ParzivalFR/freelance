import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TestimonialForm from "./testimonial-form";

interface PageProps {
  params: {
    token: string;
  };
}

async function getTokenData(token: string) {
  try {
    const tokenData = await prisma.testimonialToken.findUnique({
      where: { token },
    });

    if (!tokenData) {
      return null;
    }

    // Vérifier si le token a expiré
    if (new Date() > tokenData.expiresAt) {
      return { expired: true };
    }

    // Vérifier si le token a déjà été utilisé
    if (tokenData.isUsed) {
      return { used: true };
    }

    return { tokenData };
  } catch (error) {
    console.error("Error fetching token:", error);
    return null;
  }
}

export default async function TestimonialPage({ params }: PageProps) {
  const result = await getTokenData(params.token);

  if (!result) {
    notFound();
  }

  if (result.expired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-auto p-6 text-center">
          <div className="mb-6">
            <div className="size-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
              <svg className="size-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Lien expiré</h1>
            <p className="text-muted-foreground">
              Ce lien pour laisser un avis a expiré. Veuillez contacter le support pour obtenir un nouveau lien.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (result.used) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-auto p-6 text-center">
          <div className="mb-6">
            <div className="size-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <svg className="size-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Avis déjà soumis</h1>
            <p className="text-muted-foreground">
              Vous avez déjà utilisé ce lien pour laisser un avis. Merci pour votre retour !
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Laissez votre avis
            </h1>
            <p className="text-muted-foreground">
              Bonjour {result.tokenData!.clientName}, nous serions ravis de connaître votre expérience 
              {result.tokenData!.projectName && ` concernant le projet "${result.tokenData!.projectName}"`}.
            </p>
          </div>
          
          <TestimonialForm
            token={params.token}
            clientName={result.tokenData!.clientName}
            clientEmail={result.tokenData!.clientEmail}
            projectName={result.tokenData!.projectName}
          />
        </div>
      </div>
    </div>
  );
}