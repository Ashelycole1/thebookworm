import AdminClient from "./AdminClient";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default function AdminPage() {
  const { userId } = auth();
  if (!userId) redirect(`/sign-in`);

  // Allow any authenticated Clerk user (Google sign-in will authenticate here).
  return <AdminClient />;
}
