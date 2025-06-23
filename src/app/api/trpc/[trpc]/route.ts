import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/trpc/root";
import { createContext } from "@/trpc/context";

// Configure the API route to use Node.js runtime instead of Edge runtime
export const runtime = 'nodejs';

const handler = (req: Request) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
  });
};

export { handler as GET, handler as POST };
