import { getSupabaseServiceClient } from "@/lib/supabase/server";

const BUCKET = "screenshots";

/** Uploads a screenshot to Supabase Storage and returns its public URL, or null on failure/unconfigured. */
export async function uploadScreenshot(id: string, image: Buffer): Promise<string | null> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return null;

  const path = `${id}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, image, {
    contentType: "image/jpeg",
    upsert: true,
  });

  if (error) {
    console.error("[screenshot] upload failed", error);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
