CREATE TABLE IF NOT EXISTS "workflow_events" (
	"id" text PRIMARY KEY NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reminders" (
	"id" text PRIMARY KEY NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_events_data_case_idx" ON "workflow_events" ((data ->> 'caseId'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_events_data_source_idx" ON "workflow_events" ((data ->> 'sourceType'), (data ->> 'sourceId'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reminders_data_target_status_idx" ON "reminders" ((data ->> 'targetRole'), (data ->> 'targetUserId'), (data ->> 'status'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reminders_data_due_status_idx" ON "reminders" ((data ->> 'dueAt'), (data ->> 'status'));
