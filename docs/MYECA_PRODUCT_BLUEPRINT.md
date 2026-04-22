# MyeCA.in Product Blueprint

## 1. Product Requirements Document

### 1.1 Product Summary
MyeCA.in is a digital tax, compliance, and expert-assistance platform for Indian individuals, professionals, startups, and small businesses. The product combines acquisition-led content and calculators with conversion into paid services, structured workflows, document vaulting, and CA-led execution.

At its strongest, MyeCA.in is not just a tax calculator website. It is a multi-role operating system for:
- tax filing,
- compliance services,
- document collection,
- expert collaboration,
- customer lifecycle management,
- admin-led operations and content.

### 1.2 Product Vision
Build the most trusted digital CA platform for India where users can:
- understand their tax position quickly,
- choose the right filing or compliance service,
- upload or generate the required documents,
- collaborate with an assigned CA,
- track status end to end,
- and return year-round for compliance, learning, and business services.

### 1.3 Target Users

#### Primary Personas
1. Individual taxpayer
- Salaried employee filing ITR.
- Needs Form 16 parsing, regime comparison, deduction guidance, refund confidence, and expert review.

2. HNI / advanced taxpayer
- Has capital gains, AIS mismatches, bank statement complexity, or tax optimization needs.
- Needs advanced tools, document analysis, tax-loss harvesting, and dedicated expert intervention.

3. Small business owner
- Needs GST registration, returns, TDS filing, notice response, audit, and ongoing compliance.

4. Startup founder
- Needs incorporation, Startup India, MSME, trademark, labour law, funding readiness, and virtual CFO support.

#### Internal Personas
1. Chartered Accountant
- Manages assigned clients, reviews filings, requests documents, resolves mismatches, and marks work complete.

2. Team member / operations
- Supports service fulfillment, document follow-up, content ops, and coordination.

3. Admin
- Owns user roles, pricing/service ops, dashboards, blog/CMS, analytics, and system configuration.

### 1.4 Core Value Proposition
- Expert-first: every critical filing or compliance task can be reviewed by a real CA.
- Faster completion: calculators, OCR/document parsing, and guided flows reduce user effort.
- Trust and traceability: vault, status tracking, roles, and audit-oriented workflows improve confidence.
- Cross-sell engine: one platform supports tax, business compliance, and startup services.

### 1.5 Business Goals
- Increase conversion from organic traffic to paid filing/service activation.
- Increase repeat usage through dashboards, vault, trackers, and annual compliance.
- Improve service fulfillment efficiency for CAs and internal teams.
- Build a defensible data and workflow layer around tax/compliance operations.
- Expand ARPU from ITR-only users into GST, startup, notice, and advisory services.

### 1.6 Product Pillars
1. Acquisition
- SEO landing pages
- calculators
- blogs and guides
- comparison content
- city/service landing pages

2. Conversion
- pricing pages
- service selection and activation
- consultation CTA
- AI assistant entry points
- login and role-based dashboards

3. Fulfillment
- ITR wizard
- document vault
- CA assignment
- workflow and reporting
- notifications and status tracking

4. Retention
- user dashboard
- account and security
- compliance reminders
- repeat filing and historical records
- educational content and tax tools

### 1.7 Key Functional Modules

#### Public and marketing layer
- Homepage with strong ITR-first positioning.
- Service catalog and service-specific landing pages.
- Calculator ecosystem.
- Blog, glossary, guides, videos, and help content.
- Search and SEO-optimized public content.

#### User product layer
- Authentication and account workspace.
- User dashboard with active filings/services.
- Document vault with uploads, metadata, and secure downloads.
- ITR filing wizard with step-by-step completion.
- Expert consultation and service activation.
- Reports, exports, referrals, and integrations.

#### Expert and operations layer
- CA dashboard for assigned clients.
- Team dashboard for internal coordination.
- Admin dashboards for users, content, services, analytics, and feedback.
- Audit and operational oversight.

### 1.8 Non-Functional Requirements
- Mobile-first UX for tax filing and document upload.
- Strong trust signals and security messaging.
- Role-based access across user, CA, team, and admin.
- File privacy and secure access controls.
- SEO-friendly public pages.
- Performance-oriented lazy loading for broad route surface.
- Scalable data model for year-over-year tax and compliance history.

### 1.9 Success Metrics

#### Acquisition
- Organic traffic growth on calculators, blogs, and service landing pages.
- Calculator to signup conversion rate.
- Blog to consultation/service click-through rate.

#### Conversion
- Visitor to signup conversion.
- Signup to service activation conversion.
- ITR wizard start to payment submission conversion.
- Consultation request to paid engagement conversion.

#### Fulfillment
- Average CA turnaround time.
- Document completion rate per filing.
- First-time-right filing/compliance success rate.
- Pending workload aging by service type.

#### Retention
- Repeat logins during filing season.
- Cross-sell rate from ITR users into other services.
- Next-year refiling retention.
- Document vault reuse rate.

## 2. App Flow

### 2.1 High-Level Product Flow
1. User lands on public content or calculator page.
2. User evaluates value through calculators, tools, service pages, or trust content.
3. User signs up or logs in.
4. User starts one of three primary journeys:
- ITR filing,
- service activation,
- document vault / account management.
5. User uploads documents or provides structured data.
6. System creates a work item and attaches it to the user.
7. Admin/ops may assign a CA.
8. CA reviews, requests corrections, and progresses the work.
9. User tracks status and receives updates.
10. Work completes, artifacts stay in vault/history, and user is retained for upsell/renewal.

### 2.2 Persona Flow: Individual Taxpayer

#### Entry points
- Homepage CTA
- Income tax calculator
- Tax optimizer
- Form 16 parser
- Tax assistant
- Blog/article landing pages

#### Detailed journey
1. Discover
- User lands on homepage or calculator.
- Sees trust signals: CA reviewed, ERI registered, expert review.
- Uses free tools to estimate tax/refund or compare regimes.

2. Intent formation
- User clicks `Start Filing Now`.
- If unauthenticated, goes to login/register.
- If authenticated, goes to dashboard or filing route.

3. Filing setup
- User enters filing flow.
- System validates persona basics:
  - PAN
  - Aadhaar link status
  - filing type
  - assessment year
- User sees progress steps and autosave state.

4. Tax computation
- User compares old vs new regime.
- User inputs income and deductions.
- System estimates liability and savings.
- System suggests likely better regime but leaves final decision for review.

5. Document ingestion
- User uploads Form 16 / AIS / supporting files.
- OCR/parsing-assisted future path extracts structured values.
- Documents are stored in vault and linked to filing.

6. Deduction and reconciliation
- User enters HRA, 80C, 80D, home loan, and tax-paid information.
- System flags likely gaps or mismatches.

7. Review and payment
- User sees filing summary and expert review package.
- User pays and submits for CA review.
- Filing status changes to submitted / CA review pending.

8. Post-submission
- User tracks progress from dashboard.
- CA may request clarifications or extra documents.
- User returns to vault or profile as needed.
- Filing completes and acknowledgment/refund data become part of history.

### 2.3 Persona Flow: Small Business / Startup User

#### Entry points
- Service landing pages
- Startup services page
- GST / incorporation / trademark / audit pages
- Contact / consultation flow

#### Detailed journey
1. Discover
- User lands on a service-specific page from search or homepage.

2. Selection
- User opens `/services/selection` or chooses a direct service CTA.
- Filters by category such as individual, business, startup, tax-compliance.
- Reviews pricing, turnaround time, and included deliverables.

3. Activation
- User selects service.
- System creates a `user_service` record with:
  - service id,
  - category,
  - price/payment metadata,
  - initial status,
  - service-specific metadata.

4. Fulfillment preparation
- User is prompted to upload required docs.
- Future state should provide a service-specific checklist and milestone tracker.

5. Ops and CA orchestration
- Admin/team assigns owner.
- CA/team reviews submitted docs and starts workflow.
- Internal updates are reflected back to user status.

6. Completion and expansion
- Service closes with output artifact or filing status.
- User is nudged to related services:
  - GST returns after GST registration,
  - compliance management after company incorporation,
  - virtual CFO after startup setup.

### 2.4 Persona Flow: Document Vault User
1. User enters `/documents`.
2. Sees private folders by tax/compliance category.
3. Uploads file with category, year, and description.
4. System stores binary in Vercel Blob and metadata in database.
5. User can:
- search,
- filter,
- preview extraction,
- download,
- delete,
- or use generated documents.
6. Vault becomes the shared document source for filing and service workflows.

### 2.5 Persona Flow: CA
1. CA logs in through CA portal.
2. Lands on CA dashboard.
3. Sees:
- assigned clients,
- total filings,
- pending work,
- completion stats.
4. Searches client portfolio.
5. Opens client documents or filings.
6. Reviews outstanding items and takes action.
7. Moves work through draft, pending, review, or completed states.

### 2.6 Persona Flow: Admin / Team
1. Admin logs in via admin portal.
2. Accesses dashboard stats and operational worklist.
3. Manages:
- users,
- roles,
- CA assignment,
- blog/CMS,
- categories,
- media,
- feedback,
- analytics.
4. Uses audit and status visibility to monitor fulfillment.

### 2.7 App Flow Observations From Current Codebase
- The product is already multi-role, but several flows are still UI-first and not fully state-machine-driven.
- The ITR wizard is strong as a guided experience but currently feels partly demo/prototype in persistence and payment integration.
- The document vault is one of the strongest real product primitives and should be treated as a core platform capability.
- Admin and CA panels exist, but fulfillment workflows need deeper operational modeling.
- The platform should converge toward a single “case/work item” abstraction behind tax returns and services.

## 3. Tech Stack

### 3.1 Current Stack In The Codebase

#### Frontend
- React 18
- TypeScript
- Vite
- Wouter for routing
- Tailwind CSS
- Radix UI + custom UI components
- Framer Motion
- TanStack Query
- Zustand

#### Backend
- Node.js
- Express.js
- TypeScript
- Zod validation

#### Data and infra
- Neon Postgres
- Drizzle ORM
- JSON-document compatibility adapter (`adminDb`)
- Vercel Blob for document/media storage
- Vercel hosting

#### Auth and security
- Clerk packages present for auth
- Role-based middleware for `admin`, `team_member`, `ca`, `user`
- Rate limiting, security headers, audit hooks, upload restrictions

#### AI / parsing / utilities
- OpenAI SDK
- Tesseract.js
- Sharp
- CSV parsing and document-oriented helpers

### 3.2 Recommended Product Stack Direction

#### Keep
- React + TypeScript + Vite
- TanStack Query
- Tailwind + Radix
- Express on Vercel Functions
- Neon Postgres + Drizzle
- Clerk
- Vercel Blob

#### Strengthen
- Move from JSON-heavy collection emulation to relational Postgres tables for transactional modules.
- Introduce workflow/state-machine patterns for filings and services.
- Add background jobs for OCR, notifications, reconciliation, and reminders.
- Add observability tooling for error tracking and business metrics.

### 3.3 Recommended Supporting Services
- Payments: Razorpay
- Email: SES or SendGrid
- Transactional notifications: WhatsApp/SMS provider later
- Analytics: Vercel Analytics + product events + warehouse-ready event stream
- Monitoring: Sentry or equivalent
- Job execution: Vercel Cron / background queue / hosted worker

### 3.4 Architectural Principle
Public content can remain SEO-first and route-light, but authenticated workflows should become system-driven and case-driven. The main split should be:
- public acquisition layer,
- authenticated workspace layer,
- internal fulfillment layer,
- platform services layer.

## 4. Backend Schema

### 4.1 Current State
The current backend stores most business entities in Postgres tables that act like document collections:
- one `id`,
- one `data` JSONB column,
- timestamps.

This provides flexibility, but it makes reporting, workflow transitions, joins, and enforcement harder over time.

### 4.2 Recommended Target Schema

#### Identity and access

##### `users`
- `id` UUID / Clerk user id
- `email`
- `phone_number`
- `first_name`
- `last_name`
- `role`
- `status`
- `is_verified`
- `assigned_ca_id`
- `approved_by`
- `approved_at`
- `rejected_reason`
- `created_at`
- `updated_at`

##### `user_profiles`
- `id`
- `user_id`
- `profile_type` (`self`, `spouse`, `parent`, `business_entity`)
- `display_name`
- `pan`
- `aadhaar_last4`
- `date_of_birth`
- `constitution_type`
- `gstin`
- `address_json`
- `is_active`
- `created_at`
- `updated_at`

##### `teams`
- `id`
- `name`
- `type`
- `owner_user_id`
- `status`
- `created_at`
- `updated_at`

##### `team_members`
- `id`
- `team_id`
- `user_id`
- `member_role`
- `status`
- `created_at`

#### Tax filing domain

##### `tax_returns`
- `id`
- `user_id`
- `profile_id`
- `assessment_year`
- `financial_year`
- `itr_type`
- `filing_type`
- `regime_selected`
- `status`
- `assigned_ca_id`
- `current_stage`
- `submitted_at`
- `review_started_at`
- `filed_at`
- `acknowledgment_number`
- `refund_amount`
- `tax_payable_amount`
- `source_channel`
- `created_at`
- `updated_at`

##### `tax_return_snapshots`
- `id`
- `tax_return_id`
- `step_key`
- `payload_json`
- `completion_percent`
- `validation_summary_json`
- `created_at`

##### `tax_return_documents`
- `id`
- `tax_return_id`
- `document_id`
- `document_role` (`form16`, `ais`, `26as`, `investment_proof`, `bank_statement`)
- `created_at`

##### `tax_return_tasks`
- `id`
- `tax_return_id`
- `task_type`
- `title`
- `description`
- `assigned_to_user_id`
- `status`
- `priority`
- `due_at`
- `completed_at`
- `created_at`

#### Service and compliance domain

##### `services`
- `id`
- `slug`
- `title`
- `category`
- `sub_category`
- `description`
- `base_price`
- `turnaround_sla_days`
- `is_active`
- `metadata_json`
- `created_at`
- `updated_at`

##### `service_requests`
- `id`
- `user_id`
- `profile_id`
- `service_id`
- `status`
- `assigned_owner_user_id`
- `assigned_ca_id`
- `payment_status`
- `payment_amount`
- `intake_payload_json`
- `source_channel`
- `created_at`
- `updated_at`

##### `service_milestones`
- `id`
- `service_request_id`
- `milestone_key`
- `title`
- `status`
- `due_at`
- `completed_at`
- `sort_order`

##### `service_documents`
- `id`
- `service_request_id`
- `document_id`
- `document_role`
- `created_at`

#### Document domain

##### `documents`
- `id`
- `user_id`
- `profile_id`
- `name`
- `original_name`
- `category`
- `subcategory`
- `mime_type`
- `size_bytes`
- `storage_provider`
- `storage_path`
- `blob_url`
- `checksum`
- `year_label`
- `status`
- `is_external`
- `created_at`
- `updated_at`
- `deleted_at`

##### `document_extractions`
- `id`
- `document_id`
- `extractor_type`
- `status`
- `raw_text`
- `structured_json`
- `confidence_json`
- `reviewed_by_user_id`
- `reviewed_at`
- `created_at`

##### `document_access_logs`
- `id`
- `document_id`
- `actor_user_id`
- `action`
- `ip_hash`
- `created_at`

#### CRM, communication, and workflow

##### `notifications`
- `id`
- `user_id`
- `channel`
- `type`
- `title`
- `body`
- `status`
- `sent_at`
- `read_at`
- `metadata_json`
- `created_at`

##### `workflow_runs`
- `id`
- `entity_type`
- `entity_id`
- `workflow_key`
- `status`
- `current_step`
- `payload_json`
- `started_at`
- `completed_at`
- `created_at`

##### `comments`
- `id`
- `entity_type`
- `entity_id`
- `author_user_id`
- `visibility` (`internal`, `customer`)
- `body`
- `created_at`

#### Content and growth

##### `blog_posts`
- `id`
- `title`
- `slug`
- `excerpt`
- `content`
- `author_user_id`
- `status`
- `featured_image_url`
- `seo_title`
- `seo_description`
- `published_at`
- `created_at`
- `updated_at`

##### `categories`
- `id`
- `type`
- `name`
- `slug`
- `description`
- `created_at`

##### `landing_pages`
- `id`
- `slug`
- `page_type`
- `title`
- `content_json`
- `seo_json`
- `status`
- `created_at`
- `updated_at`

#### Governance and audit

##### `audit_logs`
- `id`
- `actor_user_id`
- `action`
- `category`
- `entity_type`
- `entity_id`
- `status`
- `metadata_json`
- `created_at`

##### `site_settings`
- `id`
- `key`
- `value_json`
- `scope`
- `updated_by_user_id`
- `created_at`
- `updated_at`

### 4.3 Core Relationships
- One `user` can have many `user_profiles`.
- One `user_profile` can have many `tax_returns` and `service_requests`.
- One `tax_return` can have many `documents`, `tasks`, `comments`, and `snapshots`.
- One `service_request` can have many `documents`, `milestones`, and `comments`.
- One CA can be assigned to many users, tax returns, or service requests.
- `documents` should be reusable across returns, service requests, and generated outputs.

### 4.4 Migration Recommendation
Do not rewrite everything at once. Migrate in this order:
1. `users`, `documents`, `services`, `service_requests`
2. `tax_returns` and filing snapshots
3. `tasks`, `comments`, `notifications`, `audit`
4. content/CMS normalization later

## 5. Implementation Plan

### Phase 0: Product Clarification and Data Contracts
Goal: align product and engineering around a single operating model.

Deliverables
- Finalize taxonomy:
  - user,
  - profile,
  - tax return,
  - service request,
  - document,
  - task,
  - comment,
  - notification.
- Define canonical statuses for filing and service lifecycles.
- Freeze event naming for analytics.
- Decide source of truth for auth and roles.

Outputs
- status matrix,
- API contract inventory,
- data migration plan,
- product instrumentation plan.

### Phase 1: Core Platform Stabilization
Goal: make the current multi-role product production-solid.

Workstreams
1. Auth and identity
- Replace local/mock auth behavior with full Clerk-backed runtime across all app states.
- Ensure role sync from Clerk to database is deterministic.

2. User dashboard
- Replace hardcoded dashboard cards with live service and filing summaries.
- Add task-based widgets: pending docs, pending payment, pending CA response.

3. Document vault
- Add profile association, stronger document categorization, and extraction status.
- Add generated-document history.

4. Service activation
- Convert service activation into first-class `service_request` records with statuses and milestones.

### Phase 2: ITR Productization
Goal: make ITR filing the cleanest and highest-converting core product.

Workstreams
1. Filing state model
- Persist each step server-side.
- Add validation and completion tracking.

2. Document-linked filing
- Map required documents by filing type.
- Add mismatch queues and review markers.

3. Payment and submission
- Integrate actual payment capture.
- Lock and submit draft only after valid state.

4. CA review loop
- Add structured review comments, document requests, and revision history.

KPIs
- wizard completion rate,
- payment conversion rate,
- average time to file,
- CA turnaround time.

### Phase 3: Operations and CA Fulfillment
Goal: turn internal dashboards into true work execution tools.

Workstreams
1. CA workbench
- unified queue by priority, SLA, and stage
- client timeline
- filing and service detail views

2. Admin ops
- assignment console
- workload balancing
- escalations
- revenue and aging dashboards

3. Workflow engine
- create milestones/tasks automatically when a filing or service enters a status

### Phase 4: Content, Growth, and Retention
Goal: turn traffic into a repeatable funnel and cross-sell engine.

Workstreams
1. SEO program
- structured service pages
- calculator interlinking
- city pages
- topical clusters for tax and startup compliance

2. Retention mechanics
- annual filing reminders
- document reuse prompts
- cross-sell nudges after service completion

3. Referral engine
- strengthen referrals, reward logic, and sharing analytics

### Phase 5: Automation and Intelligence
Goal: use AI only where it improves throughput or confidence.

Workstreams
1. OCR and structured extraction
- Form 16
- AIS
- bank statements
- capital gains imports

2. AI assistant
- narrow use cases:
  - filing help,
  - doc checklist help,
  - service recommendation,
  - mismatch explanations

3. Internal copilot
- summarize client case history for CA/team
- generate follow-up drafts
- detect blockers and SLA risks

### Engineering Delivery Sequence
1. Normalize auth and user/session state.
2. Normalize service requests and dashboard data.
3. Persist filing wizard server-side.
4. Build task/comment/milestone layer.
5. Upgrade CA/admin fulfillment tooling.
6. Add intelligent extraction and assistant workflows.

### Recommended Team Split
1. Product + design
- funnel UX
- dashboard UX
- filing wizard
- service detail templates

2. Frontend engineering
- route cleanup
- authenticated workspace
- task-driven UI
- admin/CA workbench

3. Backend engineering
- schema migration
- workflow state model
- API contracts
- document and extraction pipeline

4. Growth/content
- SEO templates
- blog and help center expansion
- conversion instrumentation

### Risks
- JSON-heavy persistence may slow reporting and case management.
- Mocked/local auth behavior can create false confidence if not removed from production paths.
- Too many routes without unified workflow primitives can fragment the user experience.
- AI features can distract from the stronger immediate advantage: expert-led, operationally reliable service delivery.

### Recommended Product Focus Order
1. Make ITR and service fulfillment operationally excellent.
2. Make dashboards reflect real work and status.
3. Make documents a reusable platform asset.
4. Then scale AI, growth loops, and advanced automation.

## 6. Final Recommendation
MyeCA.in should position itself as:

**An expert-led digital tax and compliance platform for India, powered by calculators, guided workflows, secure documents, and real CA execution.**

The biggest product opportunity is not adding more disconnected pages. It is turning the existing surface area into one coherent operating system:
- acquire with content and calculators,
- convert with strong service packaging,
- fulfill with structured workflows,
- retain with dashboards, vault, and recurring compliance.
