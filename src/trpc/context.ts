import { auth } from "@/auth";

export async function createContext() {
  const session = await auth();
  return { session };
}
export type Context = Awaited<ReturnType<typeof createContext>>;
