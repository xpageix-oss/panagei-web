# v73 – Aufgaben Personen zuweisen

Preview release for issue #18. The Alltagsbereich in #17 remains a separate feature.

## Behavior

- Room, floor and project tasks support an individual project member, Gemeinsam, or Nicht zugewiesen.
- Assignment is available in the new-task form, existing room cards and task overview. Room-center summaries show responsibility.
- Overview filters include Meine Aufgaben (including shared tasks), Gemeinsam, Nicht zugewiesen and individual members.
- Room synchronization, revision conflict protection, local drafts and CSV/JSON export retain both assignment fields.
- Assignment never grants access or changes existing editor/viewer rights.

## Database

Applied the additive remote migration `task_person_assignment` using the Supabase migration tool. Added nullable `assigned_to` (auth user FK, ON DELETE SET NULL), `assigned_to_all` default false, mutual-exclusion constraint and assignee index. Existing rows remain unassigned.

The invoker validation trigger resolves the task's project through its room or project ID and validates changed assignees against project membership. Unchanged assignments to former members remain readable and other fields stay editable. Removed accounts clear the individual assignment through the FK.

The public INVOKER RPC `umbau_task_members(uuid)` delegates only the member-name lookup to a private SECURITY DEFINER function with an empty search path and an explicit auth.uid()/project-membership check. It returns IDs, display names and roles; no email column or other auth data. Display metadata is used solely as a label, never for authorization. Anonymous execution is revoked.

## Validation

- `node --test tests/*.test.cjs`: 10 passing tests, including assignment filters and actual room-delta synchronization.
- JavaScript syntax checked for app, assignments and regression harness.
- Database tests used synthetic owner/editor/viewer/outsider accounts in a rolled-back transaction: room/floor/project assignment, shared assignment, removal, invalid targets, mutually exclusive modes, permitted editor updates, denied viewer updates and outsider reads, protected member directory, anonymous execute grants.
- Browser regression runner includes new project and room assignment, reassignment and person-filter scenarios alongside draft recovery, conflict protection, logout and pagination. All requests and storage in that runner are isolated; it never authenticates to Supabase.
- Security advisors report the same pre-existing infrastructure/account findings documented for v72; the new private function is outside the exposed API schema. No unrelated settings changed.

Real iPhone/PWA and real two-device acceptance checks remain for the user. Root production HTML and assets are not part of this release; only Preview and technical test documentation change.
