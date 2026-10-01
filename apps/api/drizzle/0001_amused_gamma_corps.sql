CREATE TYPE "public"."job_status" AS ENUM('queued', 'processing', 'completed', 'failed', 'canceled');--> statement-breakpoint
CREATE TABLE "video_clips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"provider_clip_id" varchar(128),
	"title" text,
	"duration_seconds" integer,
	"video_url" text,
	"thumbnail_url" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "video_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" varchar(64) DEFAULT 'openshorts' NOT NULL,
	"provider_job_id" varchar(128),
	"source_url" text NOT NULL,
	"status" "job_status" DEFAULT 'queued' NOT NULL,
	"error_details" text,
	"webhook_secret" varchar(64),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "video_clips" ADD CONSTRAINT "video_clips_job_id_video_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."video_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_jobs" ADD CONSTRAINT "video_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;