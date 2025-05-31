ALTER TABLE "users" DROP CONSTRAINT "users_uuid_unique";--> statement-breakpoint
ALTER TABLE "users" ADD PRIMARY KEY ("uuid");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "id";