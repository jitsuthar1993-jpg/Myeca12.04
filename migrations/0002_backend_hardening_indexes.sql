CREATE INDEX IF NOT EXISTS "users_data_email_idx" ON "users" ((data ->> 'email'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_data_role_idx" ON "users" ((data ->> 'role'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_data_status_idx" ON "users" ((data ->> 'status'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_data_assigned_ca_idx" ON "users" ((data ->> 'assignedCaId'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "profiles_data_user_id_idx" ON "profiles" ((data ->> 'userId'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "profiles_data_status_idx" ON "profiles" ((data ->> 'status'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "documents_data_user_status_idx" ON "documents" ((data ->> 'userId'), (data ->> 'status'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "documents_data_profile_idx" ON "documents" ((data ->> 'profileId'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "documents_data_service_idx" ON "documents" ((data ->> 'userServiceId'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "documents_data_tax_return_idx" ON "documents" ((data ->> 'taxReturnId'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tax_returns_data_user_status_idx" ON "tax_returns" ((data ->> 'userId'), (data ->> 'status'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tax_returns_data_profile_idx" ON "tax_returns" ((data ->> 'profileId'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_services_data_user_status_idx" ON "user_services" ((data ->> 'userId'), (data ->> 'status'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_services_data_payment_status_idx" ON "user_services" ((data ->> 'paymentStatus'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_services_data_profile_idx" ON "user_services" ((data ->> 'profileId'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blog_posts_data_slug_idx" ON "blog_posts" ((data ->> 'slug'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blog_posts_data_status_idx" ON "blog_posts" ((data ->> 'status'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blog_posts_data_category_idx" ON "blog_posts" ((data ->> 'categoryId'));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "daily_updates_data_active_idx" ON "daily_updates" ((data ->> 'isActive'));
