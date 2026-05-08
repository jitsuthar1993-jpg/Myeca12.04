# User Role Flow Chart

This flow chart documents the current app-role routing and access behavior in the website. It focuses on the route guards in `client/src/Routes.tsx` and the authentication helpers used by protected pages.

```mermaid
flowchart TD
  subgraph Entry["Entry Points"]
    Visitor["Public visitor"]
    PublicPages["Public routes\nHome, pricing, contact, about"]
    PublicTools["Public tools\nCalculators, tax assistant, Form 16 parser,\nAIS viewer, bank analyzer, trackers"]
    PublicContent["Public content\nServices, blog, learn, help, compare"]
    AuthPages["Auth routes\n/login, /register, /forgot-password,\n/auth/login, /auth/register, /auth/callback"]
    ProtectedAttempt["Protected route attempt"]
  end

  subgraph Gate["Authentication Gate"]
    RequireAuth["RequireAuth\nNeeds authenticated session"]
    RequireRole["RequireRole(roles)\nNeeds session and allowed role"]
    RequireAdmin["RequireAdmin\nWrapper around RequireRole(['admin'])"]
    LoginRedirect["Redirect to\n/auth/login?next=&lt;current path&gt;"]
  end

  subgraph RoleDecision["Role Decision"]
    Authenticated["Authenticated user"]
    UserRole{"role"}
    User["user"]
    CA["ca"]
    Team["team_member"]
    Admin["admin"]
  end

  subgraph Workspaces["Protected Workspaces"]
    UserWorkspace["User workspace\n/dashboard\n/dashboard/services\n/user\n/documents\n/account\n/profile\n/settings\n/settings/account"]
    CAWorkspace["CA workspace\n/ca\n/ca/dashboard"]
    TeamWorkspace["Team workspace\n/team/dashboard\n/admin/blog-management\n/admin/categories-management\n/admin/updates-management\n/admin/media-management"]
    AdminWorkspace["Admin workspace\n/admin\n/admin/dashboard\n/admin/services\n/admin/blog\n/admin/analytics\n/admin/users\n/admin/user-management\n/admin/create-admin\n/admin/feedback\n/admin/settings\n/admin/audit-logs"]
    SharedOps["Admin can also access\nCA and team-permitted routes"]
  end

  subgraph Denied["Denied / Fallback"]
    Forbidden["/403\nForbidden page"]
    NotFound["Not found route\nFallback page"]
    Loading["Loading skeleton/spinner\nwhile auth state resolves or redirect runs"]
  end

  Visitor --> PublicPages
  Visitor --> PublicTools
  Visitor --> PublicContent
  Visitor --> AuthPages
  Visitor --> ProtectedAttempt

  ProtectedAttempt --> RequireAuth
  ProtectedAttempt --> RequireRole
  ProtectedAttempt --> RequireAdmin

  RequireAuth -->|"not authenticated"| LoginRedirect
  RequireRole -->|"not authenticated"| LoginRedirect
  RequireAdmin --> RequireRole
  RequireAuth -->|"authenticated"| Authenticated
  RequireRole -->|"authenticated"| UserRole

  Authenticated --> UserRole
  UserRole -->|"user"| User
  UserRole -->|"ca"| CA
  UserRole -->|"team_member"| Team
  UserRole -->|"admin"| Admin

  User --> UserWorkspace
  CA --> CAWorkspace
  Team --> TeamWorkspace
  Admin --> AdminWorkspace
  Admin --> SharedOps

  UserRole -->|"role not in allowed roles"| Forbidden
  RequireAuth --> Loading
  RequireRole --> Loading
  PublicPages -->|"unknown path"| NotFound
  PublicTools -->|"unknown path"| NotFound
  PublicContent -->|"unknown path"| NotFound
```

## Current Implementation Notes

- `RequireAuth` redirects unauthenticated users to `/auth/login?next=<current path>`.
- `RequireRole` redirects unauthenticated users to `/auth/login?next=<current path>`, logs a `role_guard_denied` audit event for wrong-role access, and redirects wrong-role users to `/403`.
- `RequireAdmin` is an admin-only wrapper around `RequireRole(['admin'])`.
- `RoleBasedRedirect` exists and maps roles this way: `admin -> /admin/dashboard`, `team_member -> /admin/blog-management`, `ca -> /ca/dashboard`, default `user -> /dashboard`.
- `RoleBasedRedirect` is not currently mounted in `client/src/Routes.tsx`; protected route access is handled directly by route-level guards.
- `RequireAuth` and `RequireRole` write the intended destination as `next`, while `client/src/pages/auth/login.page.tsx` currently reads `redirect_url`. This is an observed routing mismatch in the current implementation.

## Source Cross-Check

- Route groups: `client/src/Routes.tsx`
- Authenticated guard: `client/src/components/auth/RequireAuth.tsx`
- Role guard: `client/src/components/auth/RequireRole.tsx`
- Admin guard: `client/src/components/auth/RequireAdmin.tsx`
- Role redirect helper: `client/src/components/RoleBasedRedirect.tsx`
- Login redirect parameter handling: `client/src/pages/auth/login.page.tsx`
