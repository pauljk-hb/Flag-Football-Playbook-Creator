import { signIn, signOut, signUp } from "@/lib/auth-client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const { data, error } = await signIn.email({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message || "Ein Fehler ist aufgetreten.");
    } else if (data) {
      navigate("/");
    }
  };

  const handleGoogleLogin = async () => {
    const frontendUrl = window.location.origin;
    await signIn.social({
      provider: "google",
      callbackURL: `${frontendUrl}/`,
    });
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const { error } = await signUp.email({
      name,
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message || "Ein Fehler ist aufgetreten.");
    } else {
      await signIn.email({
        email,
        password,
      });
      navigate("/");
    }
  };

  const handleGoogleSignup = async () => {
    const frontendUrl = window.location.origin;
    await signIn.social({
      provider: "google",
      callbackURL: `${frontendUrl}/`,
    });
  };

  const handleLogout = async () => {
    try {
      await signOut();

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Fehler beim Logout:", error);
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    setIsLoading,
    errorMessage,
    setErrorMessage,
    handleEmailLogin,
    handleGoogleLogin,
    handleEmailSignup,
    handleGoogleSignup,
    handleLogout,
  };
}
