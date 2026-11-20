# v72 – Speichersicherheit

Preview-only release. The root production HTML and assets are unchanged.

## Implementation

- Account/project/channel-scoped local drafts with recovery, explicit resume, download and discard. Tokens and passwords are excluded. Uploaded files cannot be restored automatically.
- Revision-based compare-and-swap for existing room, task and workspace updates/deletes. Revisions advance in a server trigger, including writes by the legacy live client. Partial room/task batches checkpoint acknowledged writes. Conflicts retain the local draft and offer loading the current version.
- Non-fatal token-refresh retries on network, 408, 429 and 5xx failures. Invalid sessions retain drafts for reauthentication. Logout calls the server before clearing local authentication.
- Project-filtered tasks/files; pagination follows actual page length until empty. Stable ordering is added for complete reads.
- 18 foreign-key indexes, removal of one duplicate room constraint/index, consolidated task policies, explicit UPDATE WITH CHECK, revoked anonymous access to the membership RPC.
- JavaScript separated into gate, application, navigation, updates, preferences, push, safety and drafts files.

## Validation

Run `node --test tests/safety.test.cjs` for transport and persistence unit tests.
Open `preview/test-runner.html` and press **Tests starten** for isolated browser regressions with synthetic accounts, intercepted network calls and independent storage. This never authenticates to Supabase.

Database revision increment, stale update and stale delete checks ran in a rolled-back transaction. Performance advisors no longer report missing foreign-key indexes, duplicate indexes or multiple permissive policies. Newly added indexes are naturally reported as unused until exercised.

## Deliberately retained / blocked

- The membership and project creation SECURITY DEFINER functions enforce auth.uid() and fixed search_path. They are required for non-recursive membership authorization and atomic project creation; switching them to INVOKER indiscriminately would break access control.
- Internal push tables intentionally deny direct client access; missing client policies are expected.
- pg_net is not relocatable in this installation. Reinstalling it only to remove the schema warning could disrupt push delivery. Its supported schema configuration is retained.
- Leaked-password protection remains an account-level configuration item. The organization is on the Free plan, while Supabase requires Pro or higher for leaked-password protection. No paid upgrade was made. The connector also exposes no Auth configuration update; the dashboard fallback returned 404. It has not been enabled and must not be reported as complete.

Real iPhone/PWA and real two-device tests remain device acceptance checks.
