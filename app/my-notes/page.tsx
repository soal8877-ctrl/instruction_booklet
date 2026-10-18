import { redirect } from "next/navigation";

export default function MyNotesRedirect() {
  redirect("/dashboard");
}
