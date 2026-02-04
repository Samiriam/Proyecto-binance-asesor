import { redirect } from "next/navigation";

export default function Home() {
  // Redirigir al dashboard si hay sesión, si no al login
  // Por ahora redirigimos al login
  redirect("/login");
}
