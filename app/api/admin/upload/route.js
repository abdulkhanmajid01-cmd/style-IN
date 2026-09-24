import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const BUCKET = "product-images";

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPG, PNG, WEBP, or GIF images are allowed." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Image must be under 5MB." }, { status: 400 });
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

  const bytes = await file.arrayBuffer();

  // Extension file.name se allowlist hi leta hai (scriptable/santitize safe)
  const extMatch = file.name?.match(/\.(jpe?g|png|webp|gif)$/i);
  const ext = extMatch ? extMatch[0].toLowerCase() : ".jpg";
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, bytes, { contentType: file.type, upsert: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return NextResponse.json({ url: publicUrl.publicUrl });
}