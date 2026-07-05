# Rolecall — Roles & Authorization Model

## Overview
Rolecall has four roles, each scoped to a progressively narrower slice of
data. Permissions are hierarchical — a higher role can do everything a
lower role can, plus more — but scope always narrows to the relevant
organization, project, or task. This doc defines what each role can do
and where role checks alone are insufficient, requiring resource-level
(ABAC) checks on top.

## Role Hierarchy

```
super_admin
    └── org_admin        (scoped to one organization)
            └── manager        (scoped to their own projects, within that org)
                    └── member        (scoped to only assigned tasks/projects)
```

## Role Definitions

| Role | Scope | Permissions |
|---|---|---|
| `super_admin` | Entire system, all organizations | Create/delete organizations; promote or demote any user to any role; view/edit any resource system-wide |
| `org_admin` | One organization | Add/remove users within their org; assign roles (`manager`/`member`) within their org; view all projects/tasks in their org |
| `manager` | Their own projects, within their org | Create projects; add/remove members on projects they created; create, assign, edit, delete tasks within those projects |
| `member` | Projects they're added to | View and update only tasks assigned to them, within projects they belong to |

## Where This Lives in the Data Model

```
organizations
   └── users (role column: super_admin | org_admin | manager | member)
         └── projects (owned via manager_id)
               └── project_members (which users belong to which project)
                     └── tasks (assigned via assigned_to)
```

Each role check ultimately traces back to comparing `req.user` against
one of these foreign keys — `org_id`, `manager_id`, or `assigned_to`.

## Example Flow — Onboarding to Task Assignment

1. `super_admin` creates the organization (e.g. "Precognitas Health")
2. `org_admin` adds a new hire as a `user` with role `member`
3. A `manager` creates a project and adds that member via `project_members`
4. The `manager` creates a task and sets `assigned_to` to that member
5. The `member` can now see and update only that task, in only that project

## Why Role Checks Alone Aren't Enough

A pure role check answers "does this role generally allow this action?" —
it cannot answer "does this action apply to *this specific* resource for
*this specific* user." Three concrete cases where role alone is
insufficient:

| Scenario | Role check result | Correct result | Why |
|---|---|---|---|
| Manager A edits Manager B's project | Allowed (both are "manager") | Denied | Ownership check needed: `req.user.id === project.manager_id` |
| Org Admin (Org 1) views a project in Org 2 | Allowed (role is "org_admin") | Denied | Org-scoping check needed: `req.user.org_id === project.org_id` |
| Member views another member's task in the same project | Ambiguous by role alone | Design decision (see below) | Requires an explicit policy, not just a role name |

This is the exact gap between the two authorization branches in this repo:

- **`auth/rbac`** implements the left column — "does this role allow this
  action at all?"
- **`auth/abac`** adds the right column — "does this role **and** this
  resource's ownership/org data** allow this specific action?"

## Middleware Layering (as implemented in the auth branches)

```
authenticate            → identifies the user, attaches req.user
authorize('manager')    → role-level check: is this role allowed at all?
checkOwnership(req)     → resource-level check: does req.user own or
                           belong to this specific resource?
```

`authenticate` and `authorize` are implemented in `auth/rbac`.
`checkOwnership` is added in `auth/abac`, layered on top.

## Open Design Decision — Member Task Visibility

Not yet finalized. Two options:

- **Strict:** members can only see tasks explicitly assigned to them —
  no visibility into other members' tasks in the same project
- **Team-visible:** members can see all tasks in a project they belong
  to, but can only edit their own

This decision affects the `GET /api/tasks?project_id=X` query logic in
the ABAC branch and should be settled before that branch is built.

## Single Role Per User — Current Assumption

The `users.role` column currently stores one role per user, which fits
this model since the roles are cleanly hierarchical (no user is expected
to hold two independent roles). If a user ever needs different roles on
different projects (e.g., manager on Project A, member on Project B), this
would require a `project_roles` join table instead of a flat column —
a schema change that should happen before RBAC is built, not after.
