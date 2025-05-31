ALTER TABLE "sessions" DROP CONSTRAINT "sessions_sessionToken_unique";--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "expires_at" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "sessions" ADD PRIMARY KEY ("sessionToken");--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN "id";