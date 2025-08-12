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

    const { ownership_unit_id, document_type } = await req.json();
    if (!ownership_unit_id || !document_type) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    // Verify ownership
    const { data: unit, error: unitError } = await supabase
      .from('ownership_units')
      .select('*, properties(*)')
      .eq('id', ownership_unit_id)
      .eq('owner_id', user.id)
      .single();
    
    if (unitError || !unit) {
      return new Response(JSON.stringify({ error: "Ownership unit not found" }), { status: 404 });
    }

    // Generate PDF content (simplified - you can use a proper PDF library)
    const pdfContent = generatePDFContent(unit, document_type);
    
    // Store in Supabase Storage
    const fileName = `${document_type}_${ownership_unit_id}_${Date.now()}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, new TextEncoder().encode(pdfContent), {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      return new Response(JSON.stringify({ error: uploadError.message }), { status: 400 });
    }

    // Get signed URL (expires in 1 hour)
    const { data: signedUrl } = supabase.storage
      .from('documents')
      .createSignedUrl(fileName, 3600);

    // Update ownership unit with document reference
    const docField = document_type === 'deed' ? 'deed_url' : 'certificate_url';
    await supabase
      .from('ownership_units')
      .update({ [docField]: fileName })
      .eq('id', ownership_unit_id);

    return new Response(JSON.stringify({ 
      download_url: signedUrl?.signedUrl,
      document_id: uploadData.path 
    }), { headers: { 'content-type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || 'Server error' }), { status: 500 });
  }
});

function generatePDFContent(unit: any, docType: string): string {
  // Simplified PDF content generation
  // In production, use a proper PDF library like jsPDF
  const content = `
    ${docType.toUpperCase()} DOCUMENT
    
    Property: ${unit.properties?.name || 'Unknown Property'}
    Location: ${unit.properties?.location_geojson || 'Unknown Location'}
    Size: ${unit.size_sqm} sqm
    Owner: ${unit.owner_id}
    Date: ${new Date().toISOString().split('T')[0]}
    
    This document certifies ownership of the above property unit.
  `;
  
  return content;
}
