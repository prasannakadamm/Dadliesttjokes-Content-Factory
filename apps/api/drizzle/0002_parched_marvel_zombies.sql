ALTER TABLE "video_clips" ALTER COLUMN "provider_clip_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "video_clips" ADD CONSTRAINT "video_clips_job_id_provider_clip_id_unique" UNIQUE("job_id","provider_clip_id");--> statement-breakpoint
ALTER TABLE "video_jobs" ADD CONSTRAINT "video_jobs_provider_job_id_unique" UNIQUE("provider_job_id");