import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { requireAdmin, unauthorizedResponse } from "@/lib/require-admin";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xFF, 0xD8, 0xFF]],
  "image/png": [[0x89, 0x50, 0x4E, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
};

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    if (!await requireAdmin()) return unauthorizedResponse();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = Object.keys(MIME_TO_EXT);
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG and WebP are allowed" },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validation magic bytes (signature binaire réelle du fichier)
    const signatures = MAGIC_BYTES[file.type] ?? [];
    const isValid = signatures.some((sig) => sig.every((byte, i) => buffer[i] === byte));
    if (!isValid) {
      return NextResponse.json({ error: "Invalid file content" }, { status: 400 });
    }

    // Nom de fichier aléatoire — jamais basé sur le nom fourni par le client
    const ext = MIME_TO_EXT[file.type];
    const fileName = `project_${randomUUID()}.${ext}`;

    const { data, error } = await supabase.storage
      .from('bucket-oasis')
      .upload(`Images/${fileName}`, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json(
        { error: "Upload failed" },
        { status: 500 }
      );
    }

    const { data: { publicUrl } } = supabase.storage
      .from('bucket-oasis')
      .getPublicUrl(`Images/${fileName}`);

    return NextResponse.json({ 
      url: publicUrl,
      fileName: fileName,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}