import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB per file
const MAX_FILES = 8; // ek request mein max images
const BUCKET = "product-images";

function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Only JPG, PNG, WEBP, or GIF images are allowed.";
  }
  if (file.size > MAX_SIZE) {
    return "Each image must be under 5MB.";
  }
  return null;
}

export async function POST(request) {
  const formData = await request.formData();

  // Naya contract: `files` (multiple). Purana `file` (single) bhi support
  // rahe taake CategoryForm / older clients na tootein.
  const multiple = formData.getAll("files").filter((f) => typeof f !== "string");
  const legacy = formData.get("file");
  const files =
    multiple.length > 0
      ? multiple
      : legacy && typeof legacy !== "string"
        ? [legacy]
        : [];

  if (files.length === 0) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { error: `You can upload up to ${MAX_FILES} images at a time.` },
      { status: 400 }
    );
  }

  // Poore batch ko validate karte hain — ek invalid file par baqi upload
  // karne ka koi matlab nahi, warna admin ko pata hi nahi chalta ke kaunsi
  // image chhoot gayi.
  for (const file of files) {
    const problem = validateFile(file);
    if (problem) {
      return NextResponse.json(
        { error: `${file.name || "File"}: ${problem}` },
        { status: 400 }
      );
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.startsWith("supabase-dummy")) {
    return NextResponse.json({ error: "Storage is not configured yet." }, { status: 500 });
  }

  // Service-role key = server-only, RLS bypass, admin access. Kabhi client ke
  // sath share nahi karte (is route par sirf admin calls karta hai).
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Extension file.name se allowlist hi leta hai (scriptable/santitize safe).
  // Naam mein Date.now + random + index — batch ke andar collision impossible.
  const uploaded = await Promise.all(
    files.map(async (file, index) => {
      const extMatch = file.name?.match(/\.(jpe?g|png|webp|gif)$/i);
      const ext = extMatch ? extMatch[0].toLowerCase() : ".jpg";
      const filename = `${Date.now()}-${index}-${Math.round(Math.random() * 1e6)}${ext}`;

      const bytes = await file.arrayBuffer();
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(filename, bytes, { contentType: file.type, upsert: false });

      if (error) throw new Error(error.message);

      const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
      return publicUrl.publicUrl;
    })
  );

  // Order wahi hai jo admin ne select kiya tha — `urls[0]` primary image ban
  // jaata hai. `url` backward compatibility ke liye bhi bhejte hain.
  return NextResponse.json({ urls: uploaded, url: uploaded[0] });
}
