import { redirect } from "next/navigation";

// Le compte se crée à la première connexion Google : pas de formulaire d'inscription.
export default function SignUpPage() {
  redirect("/signin");
}
