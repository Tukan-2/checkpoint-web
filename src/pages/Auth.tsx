import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Lock, Mail, User, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const loginSchema = z.object({
  email: z.string().trim().email("Neplatný e-mail").max(255),
  password: z.string().min(6, "Heslo musí mít alespoň 6 znaků").max(100),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().trim().min(2, "Jméno musí mít alespoň 2 znaky").max(100),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/admin");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      if (isLogin) {
        loginSchema.parse({ email, password });
      } else {
        signupSchema.parse({ email, password, fullName });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Chyba přihlášení",
              description: "Neplatný e-mail nebo heslo.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Chyba",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Přihlášení úspěšné",
            description: "Vítejte zpět!",
          });
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Uživatel již existuje",
              description: "Tento e-mail je již zaregistrován.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Chyba",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Registrace úspěšná",
            description: "Nyní se můžete přihlásit.",
          });
          setIsLogin(true);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Zpět na web
        </Link>

        <div className="bg-card rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground font-display font-bold text-xl">STK</span>
            </div>
            <div>
              <h1 className="text-2xl font-display text-foreground">
                {isLogin ? "Přihlášení" : "Registrace"}
              </h1>
              <p className="text-muted-foreground text-sm">Administrace STK</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="fullName">Jméno a příjmení</Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jan Novák"
                    className="pl-10"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-destructive text-sm mt-1">{errors.fullName}</p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="email">E-mail</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vas@email.cz"
                  className="pl-10"
                />
              </div>
              {errors.email && (
                <p className="text-destructive text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Heslo</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                />
              </div>
              {errors.password && (
                <p className="text-destructive text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="accent"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Načítání..."
                : isLogin
                ? "Přihlásit se"
                : "Zaregistrovat se"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-accent hover:underline text-sm"
            >
              {isLogin
                ? "Nemáte účet? Zaregistrujte se"
                : "Už máte účet? Přihlaste se"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
