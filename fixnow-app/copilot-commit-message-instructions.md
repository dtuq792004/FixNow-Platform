# Commit Message Instructions

Write commit messages that are short, precise, and useful for code review, debugging, and release notes.

## Format (required)

`<type>(optional-scope): <short imperative summary>`

- Use **imperative** mood (e.g., "add", "fix", "update", "remove")
- Keep the first line **<= 72 characters**
- One commit = **one intent**

### Valid examples

- `feat(auth): add email verification flow`
- `fix(cart): prevent duplicate checkout request`
- `refactor(ui): extract reusable card component`

### Invalid examples

- `update code`
- `fix bug`
- `Add new screen`
- `WIP: something`

---

## Types (Categories)

Use **Conventional Commits** types below. Emojis are **optional** (do not replace the `type`).

### Core types

- **feat** ✨ — Add a new user-facing feature  
  Example: `feat(profile): add avatar upload`

- **fix** 🐛 — Fix a user-facing bug  
  Example: `fix(auth): handle expired refresh token`

- **refactor** 🔨 — Change code without changing behavior  
  Example: `refactor(cart): simplify price calculation`

- **perf** ⚡ — Improve performance  
  Example: `perf(list): memoize item renderer`

- **style** 💄 — Formatting or linting (no logic changes)  
  Example: `style(ui): fix eslint warnings`

- **test** ✅ — Add or update tests  
  Example: `test(auth): add login validation tests`

- **docs** 📜 — Documentation only  
  Example: `docs(readme): add local setup guide`

- **chore** 🧹 — Maintenance (deps, tooling, config, build scripts)  
  Example: `chore(deps): bump react-native to 0.73`

- **ci** 🤖 — CI/CD pipeline or workflow changes  
  Example: `ci(github): add lint check workflow`

> Do NOT invent new types without strong reason.

---

## Scope (optional but recommended)

Add a scope when the change clearly belongs to a module/domain.

### Good scopes

`auth`, `cart`, `ui`, `api`, `payment`, `notification`, `db`, `config`

### Bad scopes

`misc`, `common`, `core`, `temp`

Examples:

- `feat(auth): add OTP verification`
- `fix(ui): prevent header overlap on small screens`

---

## Output constraints (required)

- Output **ONE** commit message only (single commit), not a list.
- The subject line must be **<= 60 characters** (hard limit).
- The subject must describe the **primary intent** only.
- Do NOT enumerate multiple sub-changes in the subject.
- Prefer **one umbrella scope** for multiple related changes (e.g., `ui`, `shared`, `icons`).

## When many files/tasks changed

- If changes are related, summarize them under **one** commit:
  - Use a broad summary like: `feat(shared): add UI building blocks`
- If changes are unrelated, do **NOT** try to cover everything in one message:
  - Choose the most important change as the subject.
  - Put secondary items in the body (optional), max **3 bullet points**.

## Subject line rules (strict)

- Start with a strong verb: `add`, `create`, `support`, `enable`, `prevent`, `simplify`.
- Avoid fillers: `implement`, `components`, `enhanced`, `for`, `with` (unless necessary).
- Avoid naming every new component/class in the subject.

## Body rules (optional)

- If needed, add a body with at most **3 bullets**, each <= 80 chars.
- Use body to list notable items only (max 3), not all files.

Example:
feat(shared): add reusable UI building blocks

- Card variants: selectable + info
- Icon + shadow wrapper
- Pet avatar with blur
