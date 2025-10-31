codeCommandments v3 (phase3‑ready)

Goal: make phase3 tasks trivial to pass. Default to camelCase for everything unless the target system forbids it. Enforce with tooling and CI.

⸻

namingConventions
	•	Variables, functions, object keys, React props: camelCase.
	•	Classes and React components: PascalCase.
	•	Constants: UPPER_SNAKE_CASE only for true compile‑time constants.
	•	Files and folders: camelCase. Keep extensions lowercase.
	•	CSS classes & custom properties: kebab-case (spec ecosystem). BEM allowed.
	•	Env vars, GitHub actions inputs, Docker labels: UPPER_SNAKE_CASE (platform constraint).
	•	URLs, npm package names, CLI flags: kebab-case.
	•	Database identifiers: prefer camelCase. If vendor enforces snake_case, convert at DAL boundaries.
	•	JSON in/out: internal camelCase; translate to/from external shapes at adapters.

migrationToCamelCase
	•	Only change public names behind adapters. Never break external contracts.
	•	Add shim mappers: toCamel(obj), toExternal(obj).
	•	For DB: add views or computed columns to bridge naming if needed.
	•	Blockers log: track remaining non‑camel names with owners and deadlines.

apiDesign
	•	Internal APIs: request/response fields camelCase.
	•	External APIs: mirror provider. Normalize at edges.
	•	Versioning: path v{n} or header. No breaking changes in patch/minor.
	•	Idempotency keys for state‑changing endpoints.

dataContracts
	•	Define types first. TS/JSON‑Schema lives in /contracts.
	•	Generate validators from schema. Reject unknown fields.
	•	Every persisted entity has: id, createdAt, updatedAt (camelCase).

errorHandling
	•	Never throw raw. Use AppError(name, message, details, cause).
	•	Map errors to stable codes. Client gets code + safe message only.
	•	Emit structured logs on error with traceId.

loggingMonitoring
	•	One logger wrapper. Levels: trace, debug, info, warn, error, fatal.
	•	Include traceId, userId, requestId in each log event.
	•	Metrics: RED (rate, errors, duration) per endpoint and job.
	•	Tracing: span per request; child spans for DB, external calls.

security
	•	Secrets only in vault/manager. Never in repo or .env committed.
	•	Output encoding by default; input validation on all boundaries.
	•	Principle of least privilege for roles, keys, SGs.
	•	TLS everywhere. HSTS on public edges. CSP with nonces.
	•	Signed releases and SBOM on CI.

performance
	•	Back end: timeouts and retries with jitter; circuit breakers on externals.
	•	Front end: code‑split, lazy import, cache headers, prefetch on idle.
	•	DB: indexes for all foreign keys and hot filters. No N+1.

accessibility
	•	WCAG 2.2 AA. Keyboard first. Focus outlines never removed.
	•	Provide aria-* for interactive controls. Color contrast ≥ 4.5:1.

testing
	•	Unit: 80%+ critical paths. Contract tests for adapters.
	•	Integration: happy path + top 3 failure modes per endpoint.
	•	E2E smoke on every deploy; full nightly.
	•	Snapshot tests only for stable UI primitives.

gitWorkflow
	•	Default branch: main.
	•	Branch naming: feat/camelCaseThing, fix/camelCaseBug, chore/camelCaseTask.
	•	Commit style: Conventional Commits. Scope in camelCase.
	•	PRs small (<300 LOC). Template enforces checklist below.

codeReviewChecklist
	•	Names: camelCase everywhere except listed exceptions.
	•	Types: no any. Narrow unions and enums.
	•	Errors: only AppError. All paths return typed results.
	•	Side effects isolated. Pure functions preferred.
	•	Tests added/updated. Coverage unchanged or up.
	•	Logs/metrics/traces wired.

buildsDeploys
	•	Reproducible builds. Lockfiles required.
	•	CI gates: lint → typecheck → unit → build → integration → scan → deploy.
	•	Blue‑green or canary. Auto‑rollback on SLO breach.

featureFlags
	•	Boolean or multivariate in /flags. Flags expire with owner + sunset date.

configuration
	•	Use config/ with environments: default.json, production.json.
	•	Read via config.get() only. No ad‑hoc process.env lookups beyond config loader.

documentation
	•	README.md at root and per package. Keep quickstart ≤ 60 seconds.
	•	/docs/adr for architectural decisions. One ADR per non‑trivial choice.
	•	Public API docs generated from schema/comments.

dependencies
	•	Prefer stdlib. New deps need: purpose, size, maintenance, license.
	•	Weekly audit. Pin majors. Remove unused on sight.

observabilitySLOs
	•	SLOs: API p95 < 500ms, error rate < 1%, uptime ≥ 99.9%.
	•	Dashboards per service with RED + key business metrics.

i18nL10n
	•	No literals in JSX/strings. Use message catalog with camelCase keys.

taskMappingForPhase3

Phase3 focus: production readiness, security, monitoring, deploys, docs.
	•	Security scan: run SAST/DAST on CI. Block on critical/high.
	•	APM on by default with trace propagation across services.
	•	Deployment scripts idempotent. One command per environment.
	•	Performance budget enforced in CI (bundle size, LCP/TBT).
	•	Docs check: docs:build must pass; --strict on link checking.

lintersFormatters
	•	ESLint + @typescript-eslint rules enforcing camelCase identifiers.
	•	Style: Prettier default. No custom line‑wrap.
	•	Commit hooks: lint-staged runs eslint --fix and tests for changed files.

exceptionListToCamelCaseRule

Only these are allowed non‑camelCase:
	1.	CSS classes and CSS variables.
	2.	Env vars and CI/CD system variables.
	3.	URLs, CLI flags, npm package names.
	4.	External API or DB identifiers you do not control (convert at edges).
	5.	Cryptographic constants and spec‑mandated names.

definitionOfDone
	•	Story meets acceptance tests.
	•	All names conform to this spec.
	•	Logs/metrics/traces present.
	•	Security review notes addressed.
	•	Docs and changelog updated.

⸻

quickAdapters

export const toCamel = (o:any):any => Array.isArray(o)
  ? o.map(toCamel)
  : o && o.constructor === Object
    ? Object.fromEntries(Object.entries(o).map(([k,v]) => [k.replace(/[_-][a-z]/g, s => s[1].toUpperCase()), toCamel(v)]))
    : o;

export const toExternal = (o:any):any => Array.isArray(o)
  ? o.map(toExternal)
  : o && o.constructor === Object
    ? Object.fromEntries(Object.entries(o).map(([k,v]) => [k.replace(/[A-Z]/g, m => `_${m.toLowerCase()}`), toExternal(v)]))
    : o;

rolloutPlan
	1.	Turn on lint rule: camelcase: ["error", {"ignoreDestructuring":false, "properties":"never"}].
	2.	Add adapter mappers at boundaries. Wire tests.
	3.	Rename internals by package, start with leaf modules.
	4.	Track exceptions in /docs/namingExceptions.md with owners.