export async function getSupabase() {
  const mod = await import("./client");
  return mod.supabase;
}
