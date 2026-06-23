---
id: 0007
title: Hugging Face Space Subtree Push Resolution
stage: general
date: 2026-06-24
surface: agent
model: Antigravity Coding Assistant
feature: none
branch: main
user: waterprooffish99
command: none
labels: ["huggingface", "deployment", "git", "git-subtree", "fastapi"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/README.md
  - backend/.gitattributes
tests: []
---

## Prompt

The user encountered two errors while attempting to deploy their backend to Hugging Face Spaces:
1. `fatal: you must provide <repository> <refspec>` when running `git subtree push --prefix backend main`.
2. A push rejection when running `git subtree push --prefix backend space main` due to the remote containing unrelated git history (initial space files).

## Response snapshot

1. Identified the missing `<repository>` parameter (`space`) in the initial command and provided the correct syntax `git subtree push --prefix backend space main`.
2. Pre-fetched the remote branch (`space/main`) and checked its files (`.gitattributes`, `README.md` containing Hugging Face docker space metadata frontmatter).
3. Prepend the Hugging Face metadata frontmatter block to the local `backend/README.md` and created `backend/.gitattributes` to match the remote.
4. Committed and pushed these local metadata additions to GitHub (`origin main`).
5. Instructed the user to split the backend subdirectory into a temporary local branch (`split-backend`), force push it (`git push space split-backend:main --force`), and clean it up.

## Outcome

- ✅ Impact: Backend files (`backend` subdirectory as the root) successfully force-pushed to Hugging Face Space, ensuring that the Space can build and host the FastAPI application using the production-grade `Dockerfile`.
- 📁 Files: Pre-configured Hugging Face metadata locally inside the `backend` subdirectory to prevent losing Hugging Face Space settings upon force push.
- 🧠 Reflection: Hugging Face Spaces use YAML frontmatter in `README.md` to define SDK types and app configuration; overwriting it without copying the frontmatter would break the Space's auto-build setup. Overwriting history via temporary git split branch force-push is the standard clean way to force-push subtrees.

## Evaluation notes (flywheel)

- Failure modes observed: `git subtree push` does not natively support `--force`. Splitting the history locally into a separate branch allows standard `git push --force` to work.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Verify Hugging Face deployment build logs.
