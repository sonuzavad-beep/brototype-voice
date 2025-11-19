import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SignInFlow } from "@/components/ui/sign-in-flow";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.string().trim().email("Invalid email address").refine((email) => email !== "admin@example.com", {
  message: "This email is not available",
});

export default function Login() {
  const { signUp, signIn, userRole } = useAuth();
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);

  const handleSubmit = async (email: string, password: string, name?: string) => {
    try {
      if (isSignup) {
        // Validate email
        try {
          emailSchema.parse(email);
        } catch (error: any) {
          if (error instanceof z.ZodError) {
            toast.error(error.errors[0].message);
            return;
          }
        }

        // Split name into first and last name
        const nameParts = name?.trim().split(" ") || ["", ""];
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const { error } = await signUp(email, password, firstName, lastName);

        if (error) {
          toast.error(error.message || "Failed to sign up");
        } else {
          toast.success("Account created successfully!");
          setTimeout(() => {
            navigate("/student/dashboard");
          }, 1000);
        }
      } else {
        const { error } = await signIn(email, password);

        if (error) {
          toast.error(error.message || "Failed to sign in");
        } else {
          toast.success("Signed in successfully!");
          setTimeout(() => {
            if (userRole === "admin") {
              navigate("/admin/dashboard");
            } else {
              navigate("/student/dashboard");
            }
          }, 1000);
        }
      }
    } catch (error: any) {
      toast.error("An error occurred");
    }
  };

  const handleToggleMode = () => {
    setIsSignup(!isSignup);
  };

  return (
    <SignInFlow 
      onSubmit={handleSubmit}
      isSignup={isSignup}
      onToggleMode={handleToggleMode}
    />
  );
}
