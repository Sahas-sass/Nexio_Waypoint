import { redirect } from "next/navigation";

export default function Home() {
  // Middleware handles role-based routing, but as a fallback, send to login
  redirect("/login");
}
