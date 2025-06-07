import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { FileUpload } from "@/components/file-upload";
import { FolderCreation } from "@/components/folder-creation";
import { FileBrowser } from "@/components/file-browser";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return (
    <main className="flex-1 overflow-auto">
      <div className="m-auto container py-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">My Drive</h1>
          <div className="flex items-center gap-2">
            <FileUpload />
            <FolderCreation />
          </div>
        </div>
        <FileBrowser />
      </div>
    </main>
  );
}
