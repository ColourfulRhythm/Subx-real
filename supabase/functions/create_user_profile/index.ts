import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const payload = await req.json().catch(() => ({}));
    const full_name = payload.full_name ?? user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'User';
    const phone = payload.phone ?? null;
    const nin = payload.nin ?? null;

    const { error: upsertError } = await supabase
      .from("users")
      .upsert({ id: user.id, full_name, phone, nin }, { onConflict: "id" });

    if (upsertError) {
      return new Response(JSON.stringify({ error: upsertError.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || "Server error" }), { status: 500 });
  }
});
