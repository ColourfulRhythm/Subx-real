import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase/supabase-js@2";

// =====================================================
// ENHANCED PAYMENT WEBHOOK - SUPABASE ONLY
// =====================================================

interface PaymentPayload {
  data: {
    reference: string;
    status: string;
    amount: number;
    customer: {
      email: string;
    };
    metadata?: {
      user_id?: string;
      project_id?: string;
      sqm?: string;
    };
  };
}

interface WebhookResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  timestamp: string;
}

serve(async (req) => {
  const startTime = Date.now();
  const webhookId = crypto.randomUUID();
  
  console.log(`[${webhookId}] Webhook request started at ${new Date().toISOString()}`);
  
  try {
    // =====================================================
    // STEP 1: VERIFY WEBHOOK SIGNATURE
    // =====================================================
    
    const signature = req.headers.get("x-paystack-signature");
    if (!signature) {
      return createErrorResponse(400, "Missing signature", webhookId);
    }

    const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!secret) {
      console.error(`[${webhookId}] Missing PAYSTACK_SECRET_KEY`);
      return createErrorResponse(500, "Server configuration error", webhookId);
    }

    const body = await req.text();
    const expectedSignature = await generateHMACSignature(body, secret);
    
    if (signature !== expectedSignature) {
      console.error(`[${webhookId}] Invalid signature`);
      return createErrorResponse(400, "Invalid signature", webhookId);
    }

    console.log(`[${webhookId}] Signature verified successfully`);

    // =====================================================
    // STEP 2: PARSE AND VALIDATE PAYLOAD
    // =====================================================
    
    let payload: PaymentPayload;
    try {
      payload = JSON.parse(body);
    } catch (parseError) {
      console.error(`[${webhookId}] JSON parse error:`, parseError);
      return createErrorResponse(400, "Invalid JSON payload", webhookId);
    }

    const { reference, status, amount, customer, metadata } = payload.data;
    
    if (!reference || status !== 'success') {
      console.log(`[${webhookId}] Payment not successful: ${status}`);
      return createErrorResponse(400, "Payment not successful", webhookId);
    }

    console.log(`[${webhookId}] Processing payment: ${reference} for ${customer.email}`);

    // =====================================================
    // STEP 3: INITIALIZE SUPABASE CLIENT
    // =====================================================
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error(`[${webhookId}] Missing Supabase configuration`);
      return createErrorResponse(500, "Server configuration error", webhookId);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // =====================================================
    // STEP 4: PROCESS PAYMENT WITH RETRY LOGIC
    // =====================================================
    
    let paymentResult;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`[${webhookId}] Attempt ${retryCount + 1} to process payment`);
        
        paymentResult = await supabase.rpc('finalize_purchase', {
          p_payment_ref: reference
        });
        
        if (paymentResult.error) {
          throw new Error(paymentResult.error.message);
        }
        
        console.log(`[${webhookId}] Payment processed successfully on attempt ${retryCount + 1}`);
        break;
        
      } catch (error) {
        retryCount++;
        console.error(`[${webhookId}] Attempt ${retryCount} failed:`, error);
        
        if (retryCount >= maxRetries) {
          throw new Error(`Payment processing failed after ${maxRetries} attempts: ${error.message}`);
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }

    // =====================================================
    // STEP 5: SEND TELEGRAM NOTIFICATION
    // =====================================================
    
    let telegramResult = null;
    try {
      telegramResult = await sendTelegramNotification(paymentResult.data, webhookId);
      console.log(`[${webhookId}] Telegram notification sent successfully`);
    } catch (telegramError) {
      console.error(`[${webhookId}] Telegram notification failed:`, telegramError);
      // Don't fail the webhook if Telegram fails
    }

    // =====================================================
    // STEP 6: LOG SUCCESS
    // =====================================================
    
    const processingTime = Date.now() - startTime;
    console.log(`[${webhookId}] Webhook completed successfully in ${processingTime}ms`);
    
    // Log to audit table
    try {
      await supabase
        .from('webhook_audit_log')
        .insert({
          webhook_id: webhookId,
          payment_reference: reference,
          status: 'success',
          processing_time_ms: processingTime,
          telegram_sent: telegramResult !== null,
          created_at: new Date().toISOString()
        });
    } catch (auditError) {
      console.warn(`[${webhookId}] Failed to log to audit table:`, auditError);
    }

    return createSuccessResponse({
      webhook_id: webhookId,
      payment_reference: reference,
      processing_time_ms: processingTime,
      telegram_sent: telegramResult !== null
    }, webhookId);

  } catch (error) {
    // =====================================================
    // ERROR HANDLING
    // =====================================================
    
    const processingTime = Date.now() - startTime;
    console.error(`[${webhookId}] Webhook failed after ${processingTime}ms:`, error);
    
    // Log error to audit table
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      
      await supabase
        .from('webhook_audit_log')
        .insert({
          webhook_id: webhookId,
          payment_reference: req.headers.get("x-paystack-signature") ? "unknown" : "no-signature",
          status: 'failed',
          error_message: error.message,
          processing_time_ms: processingTime,
          created_at: new Date().toISOString()
        });
    } catch (auditError) {
      console.error(`[${webhookId}] Failed to log error to audit table:`, auditError);
    }

    return createErrorResponse(500, `Webhook processing failed: ${error.message}`, webhookId);
  }
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

async function generateHMACSignature(body: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sendTelegramNotification(paymentData: any, webhookId: string): Promise<boolean> {
  try {
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
    
    if (!botToken || !chatId) {
      console.warn(`[${webhookId}] Missing Telegram configuration`);
      return false;
    }

    const message = `🎉 **Payment Successful!**
    
💰 **Amount:** ₦${(paymentData.amount / 100).toLocaleString()}
🏠 **Project:** ${paymentData.project_title}
📏 **SQM:** ${paymentData.sqm_purchased}
👤 **User:** ${paymentData.user_name}
📧 **Email:** ${paymentData.user_email}
🎁 **Referral Reward:** ₦${paymentData.referral_reward?.toLocaleString() || '0'}
⏰ **Time:** ${new Date().toLocaleString('en-NG')}`;

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error(`[${webhookId}] Telegram notification failed:`, error);
    return false;
  }
}

function createSuccessResponse(data: any, webhookId: string): Response {
  const result: WebhookResult = {
    success: true,
    message: "Payment processed successfully",
    data: data,
    timestamp: new Date().toISOString()
  };
  
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'X-Webhook-ID': webhookId
    }
  });
}

function createErrorResponse(status: number, message: string, webhookId: string): Response {
  const result: WebhookResult = {
    success: false,
    message: message,
    error: message,
    timestamp: new Date().toISOString()
  };
  
  return new Response(JSON.stringify(result), {
    status: status,
    headers: { 
      'Content-Type': 'application/json',
      'X-Webhook-ID': webhookId
    }
  });
}
