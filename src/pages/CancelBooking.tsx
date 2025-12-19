import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Check, X, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface BookingInfo {
  serviceName: string;
  branchName: string;
  bookingDate: string;
  bookingTime: string;
  customerName?: string;
}

const CancelBooking = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "confirm" | "success" | "error" | "already_cancelled">("loading");
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Chybí token pro zrušení rezervace");
      return;
    }
    // Show confirmation page
    setStatus("confirm");
  }, [token]);

  const handleCancel = async () => {
    if (!token) return;

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("cancel-booking", {
        body: { token },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        if (data.error.includes("již byla zrušena")) {
          setStatus("already_cancelled");
          setBookingInfo(data.booking);
        } else {
          setStatus("error");
          setErrorMessage(data.error);
        }
        return;
      }

      setStatus("success");
      setBookingInfo(data.booking);
    } catch (error: any) {
      console.error("Cancellation error:", error);
      setStatus("error");
      setErrorMessage(error.message || "Nepodařilo se zrušit rezervaci");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("cs-CZ", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {status === "loading" && (
              <div className="bg-card rounded-2xl p-8 border border-border text-center">
                <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Načítání...</p>
              </div>
            )}

            {status === "confirm" && (
              <div className="bg-card rounded-2xl p-8 border border-border text-center">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <h1 className="text-2xl font-display text-foreground mb-2">
                  Zrušení rezervace
                </h1>
                <p className="text-muted-foreground mb-6">
                  Opravdu chcete zrušit vaši rezervaci? Tuto akci nelze vrátit zpět.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" asChild>
                    <Link to="/">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Zpět
                    </Link>
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleCancel}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Zpracování...
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Zrušit rezervaci
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {status === "success" && bookingInfo && (
              <div className="bg-card rounded-2xl p-8 border border-border text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-accent" />
                </div>
                <h1 className="text-2xl font-display text-foreground mb-2">
                  Rezervace zrušena
                </h1>
                <p className="text-muted-foreground mb-6">
                  Vaše rezervace byla úspěšně zrušena.
                </p>
                
                <div className="bg-muted rounded-lg p-4 text-left mb-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Služba:</span>
                      <span className="text-foreground font-medium">{bookingInfo.serviceName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pobočka:</span>
                      <span className="text-foreground font-medium">{bookingInfo.branchName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Datum:</span>
                      <span className="text-foreground font-medium">{formatDate(bookingInfo.bookingDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Čas:</span>
                      <span className="text-foreground font-medium">{bookingInfo.bookingTime}</span>
                    </div>
                  </div>
                </div>

                <Button asChild>
                  <Link to="/pobocky">Vytvořit novou rezervaci</Link>
                </Button>
              </div>
            )}

            {status === "already_cancelled" && (
              <div className="bg-card rounded-2xl p-8 border border-border text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-display text-foreground mb-2">
                  Již zrušeno
                </h1>
                <p className="text-muted-foreground mb-6">
                  Tato rezervace již byla dříve zrušena.
                </p>
                <Button asChild>
                  <Link to="/pobocky">Vytvořit novou rezervaci</Link>
                </Button>
              </div>
            )}

            {status === "error" && (
              <div className="bg-card rounded-2xl p-8 border border-border text-center">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-destructive" />
                </div>
                <h1 className="text-2xl font-display text-foreground mb-2">
                  Chyba
                </h1>
                <p className="text-muted-foreground mb-6">
                  {errorMessage || "Nepodařilo se zrušit rezervaci"}
                </p>
                <Button asChild>
                  <Link to="/">Zpět na hlavní stránku</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CancelBooking;
