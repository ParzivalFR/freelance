import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    // Vérifier si le fichier existe déjà dans le bucket
    const { data: existingFiles, error: listError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME!)
      .list("avatars", {
        limit: 1,
        search: file.name,
      });

    if (listError) {
      throw listError;
    }

    let publicUrl: string;
    if (existingFiles && existingFiles.length > 0) {
      // Si le fichier existe, récupérer son URL publique
      const { data: publicUrlData } = supabase.storage
        .from(process.env.SUPABASE_BUCKET_NAME!)
        .getPublicUrl(`avatars/${file.name}`);

      publicUrl = publicUrlData.publicUrl;
    } else {
      // Si le fichier n'existe pas, le télécharger
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET_NAME!)
        .upload(`avatars/${file.name}`, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from(process.env.SUPABASE_BUCKET_NAME!)
        .getPublicUrl(`avatars/${file.name}`);

      publicUrl = publicUrlData.publicUrl;
    }

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Error uploading to Supabase:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
