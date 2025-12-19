import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Received cancellation request");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Processing cancellation for token: ${token}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find booking by cancellation token
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*, branches(name)")
      .eq("cancellation_token", token)
      .single();

    if (fetchError || !booking) {
      console.error("Booking not found:", fetchError);
      return new Response(
        JSON.stringify({ error: "Rezervace nebyla nalezena" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if already cancelled
    if (booking.status === "cancelled" || booking.cancelled_at) {
      return new Response(
        JSON.stringify({ 
          error: "Tato rezervace již byla zrušena",
          booking: {
            serviceName: booking.service_name,
            branchName: booking.branches?.name,
            bookingDate: booking.booking_date,
            bookingTime: booking.booking_time,
          }
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if booking date has passed
    const bookingDate = new Date(booking.booking_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      return new Response(
        JSON.stringify({ error: "Nelze zrušit rezervaci v minulosti" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Cancel the booking
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ 
        status: "cancelled",
        cancelled_at: new Date().toISOString()
      })
      .eq("cancellation_token", token);

    if (updateError) {
      console.error("Failed to cancel booking:", updateError);
      return new Response(
        JSON.stringify({ error: "Nepodařilo se zrušit rezervaci" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Booking ${booking.id} cancelled successfully`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Rezervace byla úspěšně zrušena",
        booking: {
          serviceName: booking.service_name,
          branchName: booking.branches?.name,
          bookingDate: booking.booking_date,
          bookingTime: booking.booking_time,
          customerName: booking.customer_name,
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in cancel-booking function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
