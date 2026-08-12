import { cn } from "@/lib/utils";
import { AlertCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { RouteTreeIcon } from "@/components/ui/icons/RouteTreeIcon";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    errorMessage,
    handleEmailLogin,
    handleGoogleLogin,
  } = useAuth();

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleEmailLogin}>
        <FieldGroup>
          {/* HEADER MIT PLAYBOOK BRANDING */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="p-2.5 bg-indigo-600/20 rounded-xl border border-indigo-500/30 mb-1">
              <RouteTreeIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Playbook Designer
            </h1>
            <FieldDescription>
              Noch kein Account?{" "}
              <Link
                to="/register"
                className="underline underline-offset-4 hover:text-primary"
              >
                Anmelden
              </Link>
            </FieldDescription>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* E-MAIL FELD */}
          <Field>
            <FieldLabel htmlFor="email">E-Mail</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="coach@team.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>

          {/* PASSWORT FELD */}
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">Passwort</FieldLabel>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>

          {/* SUBMIT BUTTON */}
          <Field>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Anmelden
            </Button>
          </Field>

          <FieldSeparator>Oder</FieldSeparator>

          {/* NUR GOOGLE LOGIN BUTTON */}
          <Field>
            <Button
              variant="outline"
              type="button"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleLogin}
            >
              <svg
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Mit Google fortfahren
            </Button>
          </Field>
        </FieldGroup>
      </form>

      <FieldDescription className="px-6 text-center text-xs text-muted-foreground">
        Mit dem Fortfahren stimmst du unseren{" "}
        <a href="#" className="underline underline-offset-4">
          Nutzungsbedingungen
        </a>{" "}
        und dem{" "}
        <a href="#" className="underline underline-offset-4">
          Datenschutz
        </a>{" "}
        zu.
      </FieldDescription>
    </div>
  );
}
