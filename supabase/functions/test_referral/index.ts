import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Test referral code generation by creating a test profile
    const testUserId = crypto.randomUUID();
    const testEmail = `test-${Date.now()}@example.com`;
    
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: testUserId,
        full_name: 'Test User',
        email: testEmail,
        created_at: new Date().toISOString()
      })
      .select('referral_code')
      .single();

    if (error) {
      return new Response(JSON.stringify({ 
        error: error.message,
        details: 'Referral code generation failed'
      }), { status: 400 });
    }

    // Clean up test data
    await supabase
      .from('user_profiles')
      .delete()
      .eq('id', testUserId);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Referral code generation test successful',
      generated_code: data.referral_code,
      code_format: data.referral_code?.startsWith('SUBX-') ? 'Correct format' : 'Incorrect format'
    }), { 
      headers: { 'content-type': 'application/json' } 
    });

  } catch (e) {
    return new Response(JSON.stringify({ 
      error: e?.message || 'Server error',
      details: 'Referral code generation test failed'
    }), { status: 500 });
  }
});
