import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@/trpc/root";

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();
