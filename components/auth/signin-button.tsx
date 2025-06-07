// components/auth/signin-button.tsx
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth";

export function SignInButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: "/dashboard" });
      }}
    >
      <Button type="submit" variant="default">
        Se connecter
      </Button>
    </form>
  );
}
