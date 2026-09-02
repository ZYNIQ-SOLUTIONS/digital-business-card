import { redirect } from "next/navigation";

// Trash is now integrated into the main dashboard page as a tab.
export default function TrashRedirect() {
  redirect("/dashboard");
}
