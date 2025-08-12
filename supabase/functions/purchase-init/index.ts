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
    const { data: { user } } = await supabase.auth.getUser(jwt);
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const { property_id, size_sqm, amount } = await req.json();
    if (!property_id || !size_sqm || !amount) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    const payment_ref = crypto.randomUUID();

    const { error: insErr } = await supabase.from('transactions').insert({
      buyer_id: user.id,
      amount,
      currency: 'NGN',
      payment_ref,
      status: 'pending',
      transaction_type: 'buy'
    });
    if (insErr) return new Response(JSON.stringify({ error: insErr.message }), { status: 400 });

    const paystackKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackKey) return new Response(JSON.stringify({ error: 'Missing PAYSTACK_SECRET_KEY' }), { status: 500 });

    const initRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${paystackKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, amount: Math.round(Number(amount) * 100), reference: payment_ref })
    });
    const initJson = await initRes.json();
    if (!initRes.ok) return new Response(JSON.stringify(initJson), { status: 400 });

    return new Response(JSON.stringify({ payment_url: initJson.data.authorization_url, payment_ref }), { headers: { 'content-type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || 'Server error' }), { status: 500 });
  }
});
