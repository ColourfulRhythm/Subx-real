import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { user } = await req.json();
    if (!user?.id || !user?.email) {
      return new Response(JSON.stringify({ error: "Invalid user data" }), { status: 400 });
    }

    // Check if user profile already exists
    const { data: existingProfile } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      return new Response(JSON.stringify({ message: "Profile already exists" }), { status: 200 });
    }

    // Create user profile
    const { error } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating user profile:', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    // Create user_profiles record to trigger referral code generation
    try {
      const { error: userProfileError } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
          email: user.email,
          created_at: new Date().toISOString()
        });

      if (userProfileError) {
        console.warn('User profile creation warning:', userProfileError);
      } else {
        console.log('User profile created successfully, referral code should be generated');
      }
    } catch (profileError) {
      console.warn('Failed to create user profile:', profileError);
    }

    return new Response(JSON.stringify({ message: "Profile created successfully" }), { 
      headers: { 'content-type': 'application/json' } 
    });
  } catch (e) {
    console.error('Error in create_user_profile:', e);
    return new Response(JSON.stringify({ error: e?.message || 'Server error' }), { status: 500 });
  }
});
