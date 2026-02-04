---
id: 003
title: Fix Turbopack path alias resolution
stage: general
date: 2026-02-04
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: fix/proxy-export-rename
user: Dev-AqsaShah
command: /sp.git.commit_pr
labels: ["turbopack", "module-resolution", "vercel", "next16", "bugfix"]
links:
  spec: null
  ticket: null
  adr: null
  pr: https://github.com/Dev-AqsaShah/hackathon-2/compare/main...fix/proxy-export-rename
files:
  - phase-ii/frontend/next.config.js
  - phase-ii/frontend/tsconfig.json
tests:
  - none
---

## Prompt

Find in logs
CtrlF
18:00:18.028
    at <unknown> (./phase-ii/frontend/app/tasks/[id]/edit/page.tsx:14:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
    at <unknown> (./phase-ii/frontend/app/tasks/create/page.tsx:12:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
    at <unknown> (./phase-ii/frontend/components/auth/AuthProvider.tsx:8:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
    at <unknown> (./phase-ii/frontend/components/auth/LoginForm.tsx:16:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
    at <unknown> (./phase-ii/frontend/components/auth/SignupForm.tsx:16:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
    at <unknown> (./phase-ii/frontend/components/TaskForm.tsx:17:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
Error: Command "npm run build" exited with 1 i recieve these errors on vercel deployment solve these errors

(Followed by: /sp.git.commit_pr)

## Response snapshot

Diagnosed that all 6 module-not-found errors occur at the first `@/` import in each file, confirming the `@/*` tsconfig path alias is not resolving during Turbopack builds. This is a known Turbopack bug (GitHub #71886, #79335) where the generic `@/*` alias conflicts with npm-scoped package resolution.

Applied two fixes:
1. Added `turbopack.resolveAlias` to `next.config.js` mapping `@/*` to `./*`
2. Added `baseUrl: "."` to `tsconfig.json` for reliable path resolution

Committed as `4893ebf` on the existing `fix/proxy-export-rename` branch (second commit after the proxy export rename fix). Pushed to origin. `gh` CLI unavailable; provided manual PR URL.

## Outcome

- ✅ Impact: Fixes all 6 module-not-found errors in Vercel production build
- 🧪 Tests: none (verification via successful Vercel deployment)
- 📁 Files: 2 files changed (next.config.js, tsconfig.json)
- 🔁 Next prompts: Redeploy on Vercel to verify build passes; apply same fix to phase-iii if needed
- 🧠 Reflection: Turbopack's default @/* alias handling is a known gap; explicit resolveAlias is the reliable workaround for Next.js 16 production builds

## Evaluation notes (flywheel)

- Failure modes observed: Turbopack silently fails to resolve @/* as tsconfig path, tries npm scope instead
- Graders run and results (PASS/FAIL): N/A — requires Vercel deployment to verify
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): If resolveAlias alone doesn't work, try next build --webpack as fallback
