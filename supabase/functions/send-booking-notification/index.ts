import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingNotificationRequest {
  bookingId: string;
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

const handler = async (req: Request): Promise<Response> => {
  console.log("Received request to send booking notification");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      bookingId,
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

    console.log(`Sending booking confirmation to ${customerEmail} for booking ${bookingId}`);

    // Format date for display
    const formattedDate = new Date(bookingDate).toLocaleDateString('cs-CZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

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
            <h2>Dobrý den, ${customerName}!</h2>
            <p>Vaše rezervace byla úspěšně přijata. Níže najdete podrobnosti:</p>
            
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Služba:</span> ${serviceName}
              </div>
              <div class="detail-row">
                <span class="detail-label">Datum:</span> ${formattedDate}
              </div>
              <div class="detail-row">
                <span class="detail-label">Čas:</span> ${bookingTime}
              </div>
              <div class="detail-row">
                <span class="detail-label">Pobočka:</span> ${branchName}
              </div>
              <div class="detail-row">
                <span class="detail-label">Adresa:</span> ${branchAddress}
              </div>
              ${licensePlate ? `
              <div class="detail-row">
                <span class="detail-label">SPZ:</span> ${licensePlate}
              </div>
              ` : ''}
              ${notes ? `
              <div class="detail-row">
                <span class="detail-label">Poznámky:</span> ${notes}
              </div>
              ` : ''}
            </div>
            
            <p><strong>Co s sebou:</strong></p>
            <ul>
              <li>Technický průkaz vozidla (malý i velký)</li>
              <li>Doklad o pojištění</li>
              <li>Platný občanský průkaz</li>
            </ul>
            
            <p>V případě potřeby změny nebo zrušení rezervace nás prosím kontaktujte.</p>
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
