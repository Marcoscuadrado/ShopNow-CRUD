import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirige automáticamente al usuario a la pantalla de login al entrar al sitio
  redirect("/login");
}