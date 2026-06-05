CREATE INDEX IF NOT EXISTS "user_services_data_assigned_ca_status_idx" ON "user_services" ((data ->> 'assignedCaId'), (data ->> 'status'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tax_returns_data_user_service_idx" ON "tax_returns" ((data ->> 'userServiceId'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_data_user_read_idx" ON "notifications" ((data ->> 'userId'), (data ->> 'read'));
