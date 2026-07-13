CREATE TABLE IF NOT EXISTS "whatsapp_contacts" (
	"id" text PRIMARY KEY NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "whatsapp_case_links" (
	"id" text PRIMARY KEY NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "whatsapp_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "whatsapp_outbox" (
	"id" text PRIMARY KEY NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "whatsapp_media_imports" (
	"id" text PRIMARY KEY NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "whatsapp_contacts_data_phone_idx" ON "whatsapp_contacts" ((data ->> 'normalizedPhone'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "whatsapp_contacts_data_wa_id_idx" ON "whatsapp_contacts" ((data ->> 'waId'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "whatsapp_case_links_data_code_idx" ON "whatsapp_case_links" ((data ->> 'code'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "whatsapp_case_links_data_contact_status_idx" ON "whatsapp_case_links" ((data ->> 'contactId'), (data ->> 'status'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "whatsapp_messages_data_provider_id_idx" ON "whatsapp_messages" ((data ->> 'providerMessageId'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "whatsapp_media_imports_data_provider_id_idx" ON "whatsapp_media_imports" ((data ->> 'providerMessageId'));
--> statement-breakpoint
ALTER TABLE "whatsapp_contacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "whatsapp_case_links" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "whatsapp_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "whatsapp_outbox" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "whatsapp_media_imports" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
REVOKE ALL ON "whatsapp_contacts", "whatsapp_case_links", "whatsapp_messages", "whatsapp_outbox", "whatsapp_media_imports" FROM anon, authenticated;
GRANT ALL ON "whatsapp_contacts", "whatsapp_case_links", "whatsapp_messages", "whatsapp_outbox", "whatsapp_media_imports" TO service_role;
