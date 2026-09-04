import AdminClient from "./AdminClient";
import ClerkProviderWrapper from "@/components/ClerkProviderWrapper";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in`);

  // Allow any authenticated Clerk user (Google sign-in will authenticate here).
  return (
    <ClerkProviderWrapper>
      <AdminClient />
    </ClerkProviderWrapper>
  );
}
