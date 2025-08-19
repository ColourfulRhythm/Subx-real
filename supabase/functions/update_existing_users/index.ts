import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Pre-existing users who bought slices
    const existingUsers = [
      {
        email: 'chrixonuoha@gmail.com',
        name: 'Christopher Onuoha',
        sqm: 7,
        plot: 'Plot 77'
      },
      {
        email: 'kingkwaoyama@gmail.com',
        name: 'Kingkwa Enang Oyama',
        sqm: 35,
        plot: 'Plot 77'
      },
      {
        email: 'mary.stella82@yahoo.com',
        name: 'Iwuozor Chika',
        sqm: 7,
        plot: 'Plot 77'
      }
    ]

    // Update or create user profiles and investments
    for (const user of existingUsers) {
      // Check if user exists in auth
      const { data: authUser, error: authError } = await supabaseClient.auth.admin.listUsers()
      
      if (authError) {
        console.error('Error fetching users:', authError)
        continue
      }

      const existingAuthUser = authUser.users.find(u => u.email === user.email)
      
      if (existingAuthUser) {
        // User exists, update their profile
        const { error: profileError } = await supabaseClient
          .from('users')
          .upsert({
            id: existingAuthUser.id,
            full_name: user.name,
            email: user.email,
            user_type: 'investor',
            created_at: existingAuthUser.created_at
          })

        if (profileError) {
          console.error('Error updating profile:', profileError)
        }

        // Add their investment
        const { error: investmentError } = await supabaseClient
          .from('investments')
          .upsert({
            user_id: existingAuthUser.id,
            project_id: 1, // Plot 77
            sqm_purchased: user.sqm,
            plot_name: user.plot,
            status: 'completed',
            created_at: new Date().toISOString()
          })

        if (investmentError) {
          console.error('Error creating investment:', investmentError)
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Existing users updated successfully',
        updated_users: existingUsers.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
