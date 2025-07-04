import { auth } from "@/auth";
import { ProfileForm } from "@/components/profile-form";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="flex-1 overflow-auto">
      <div className="container max-w-2xl py-8 m-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and personal information.
          </p>
        </div>
        <ProfileForm user={session.user} />
      </div>
    </main>
  );
}
