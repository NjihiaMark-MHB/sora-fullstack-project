import { router } from "./trpc";
import { usersRouter } from "./users/users.router";

export const appRouter = router({
  user: usersRouter,
});
export type AppRouter = typeof appRouter;
