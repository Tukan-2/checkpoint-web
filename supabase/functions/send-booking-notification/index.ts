import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingNotificationRequest {
  bookingId: string;
  cancellationToken: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
  bookingDate: string;
  bookingTime: string;
  branchName: string;
  branchAddress: string;
  licensePlate?: string;
  notes?: string;
}

// HTML escape function to prevent XSS
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Received request to send booking notification");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      bookingId,
      cancellationToken,
      customerName,
      customerEmail,
      customerPhone,
      serviceName,
      bookingDate,
      bookingTime,
      branchName,
      branchAddress,
      licensePlate,
      notes,
    }: BookingNotificationRequest = await req.json();

    // Sanitize all user inputs to prevent XSS
    const safeCustomerName = escapeHtml(customerName || '');
    const safeServiceName = escapeHtml(serviceName || '');
    const safeBranchName = escapeHtml(branchName || '');
    const safeBranchAddress = escapeHtml(branchAddress || '');
    const safeLicensePlate = licensePlate ? escapeHtml(licensePlate) : '';
    const safeNotes = notes ? escapeHtml(notes) : '';

    console.log(`Sending booking confirmation to ${customerEmail} for booking ${bookingId}`);

    // Format date for display
    const formattedDate = new Date(bookingDate).toLocaleDateString('cs-CZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Get the app URL from request origin or use default
    const origin = req.headers.get("origin") || "https://lpfghgcmbcvmusyovhej.lovableproject.com";
    const cancellationUrl = `${origin}/zrusit-rezervaci?token=${cancellationToken}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a365d; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f7fafc; padding: 20px; border: 1px solid #e2e8f0; }
          .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .detail-row { padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .detail-label { font-weight: bold; color: #4a5568; }
          .footer { background: #edf2f7; padding: 15px; text-align: center; font-size: 12px; color: #718096; border-radius: 0 0 8px 8px; }
          .cancel-section { margin-top: 20px; padding: 15px; background: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; }
          .cancel-link { color: #c53030; text-decoration: underline; }
          h1 { margin: 0; font-size: 24px; }
          h2 { color: #2d3748; margin-top: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Rezervace přijata</h1>
          </div>
          <div class="content">
            <h2>Dobrý den, ${safeCustomerName}!</h2>
            <p>Vaše rezervace byla úspěšně přijata. Níže najdete podrobnosti:</p>
            
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Služba:</span> ${safeServiceName}
              </div>
              <div class="detail-row">
                <span class="detail-label">Datum:</span> ${formattedDate}
              </div>
              <div class="detail-row">
                <span class="detail-label">Čas:</span> ${bookingTime}
              </div>
              <div class="detail-row">
                <span class="detail-label">Pobočka:</span> ${safeBranchName}
              </div>
              <div class="detail-row">
                <span class="detail-label">Adresa:</span> ${safeBranchAddress}
              </div>
              ${safeLicensePlate ? `
              <div class="detail-row">
                <span class="detail-label">SPZ:</span> ${safeLicensePlate}
              </div>
              ` : ''}
              ${safeNotes ? `
              <div class="detail-row">
                <span class="detail-label">Poznámky:</span> ${safeNotes}
              </div>
              ` : ''}
            </div>
            
            <p><strong>Co s sebou:</strong></p>
            <ul>
              <li>Technický průkaz vozidla (malý i velký)</li>
              <li>Doklad o pojištění</li>
              <li>Platný občanský průkaz</li>
            </ul>
            
            <div class="cancel-section">
              <p style="margin: 0;"><strong>Potřebujete rezervaci zrušit?</strong></p>
              <p style="margin: 5px 0 0 0;">
                <a href="${cancellationUrl}" class="cancel-link">Klikněte zde pro zrušení rezervace</a>
              </p>
            </div>
          </div>
          <div class="footer">
            <p>Tento email byl automaticky vygenerován. Neodpovídejte na něj.</p>
            <p>ID rezervace: ${bookingId}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email via Resend API
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "STK Rezervace <onboarding@resend.dev>",
        to: [customerEmail],
        subject: `Potvrzení rezervace - ${serviceName}`,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Resend API error: ${errorData}`);
    }

    const data = await res.json();
    console.log("Email sent successfully:", data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification email sent successfully",
        data 
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-booking-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
