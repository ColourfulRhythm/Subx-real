import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify Paystack signature
    const signature = req.headers.get("x-paystack-signature");
    const body = await req.text();
    
    if (!signature) {
      return new Response("Missing signature", { status: 400 });
    }

    const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!secret) {
      return new Response("Missing PAYSTACK_SECRET_KEY", { status: 500 });
    }

    // Verify HMAC signature
    const expectedSignature = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    ).then(key => crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)))
    .then(signature => Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, "0"))
      .join(""));

    if (signature !== expectedSignature) {
      return new Response("Invalid signature", { status: 400 });
    }

    // Parse payload
    const payload = JSON.parse(body);
    const ref = payload?.data?.reference;
    const status = payload?.data?.status;

    if (!ref || status !== 'success') {
      return new Response('Bad request', { status: 400 });
    }

    // Finalize purchase
    const { error } = await supabase.rpc('finalize_purchase', { p_payment_ref: ref });
    if (error) return new Response(error.message, { status: 400 });

    return new Response('ok');
  } catch (e) {
    return new Response(e?.message || 'Server error', { status: 500 });
  }
});
