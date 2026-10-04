# AI tool disclosure

> **Team: review and complete this page before submitting.** It documents the AI-assisted work we know about.
> Each member should add the tools they used for their own part.

## Tools used

| Tool | Used for |
|---|---|
| Claude Code (Anthropic, Claude Opus 5.5) | Hackathon-day integration work listed below |
| _Add other tools used by team members_ | |

## AI-assisted work (Claude Code, 4 October 2026)

Claude Code worked in the repository under the direction of a team member, who reviewed and approved each step:

- **Database security & workflow** – migration `008_security_and_workflow.sql`: row level security on every table, role helper functions, store manager and driver workflow RPCs, private POD storage bucket.
- **Seed data** – `seeds/006_demo_day.sql` and `scripts/seed-auth.js` for the demo accounts and a demo delivery day.
- **Store manager portal** – connected the teammate-designed screens to Supabase (orders, receiving, alerts, history).
- **Driver app** – Supabase login, per-driver trip download, proof of delivery upload, offline sync queue, removal of placeholder data.
- **Security fixes** – removed an authentication bypass in the web middleware, added auth checks to server routes, authenticated the Socket.io telemetry channel.
- **Dispatcher and loader portals** – replaced placeholder data with database data and extracted planning constraint logic.
- **Tests and documentation** – unit tests, database RLS tests, this `docs/` folder and the README.

## Work done without AI assistance

_Team: list the parts you produced yourselves, for example the Designathon designs, personas, screen flows, the original portal and app screens, and the demo video._

## How we used the tools

- AI output was reviewed by a team member before it was committed.
- Database changes were tested inside rolled-back transactions before being applied.
- Automated tests (unit + database RLS tests) were run to check the generated code.
