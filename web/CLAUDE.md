@AGENTS.md

# CLAUDE.md

## Project: Ecommerce

A themeable ecommerce storefront.

**Stack:** Next.js (App Router) · TypeScript (strict) · Tailwind CSS v4.

## General code guidelines

**Think before coding.** State assumptions explicitly. If multiple interpretations exist, name
them rather than picking silently. If something is unclear, stop and ask.

**Simplicity first.** Minimum code that solves the problem. No features beyond what was asked, no
abstractions for single-use code, no speculative configurability, no error handling for scenarios
that can't happen.

**Surgical changes.** Touch only what the task requires. Don't refactor or "improve" adjacent code.
Match existing style. Remove imports/variables your own change orphaned; leave pre-existing dead
code alone (mention it, don't delete it).

**DRY.** Every piece of logic, data, or markup has a single authoritative source. Search for an
existing implementation before writing a new one. If two pieces of code do the same thing, extract
a shared abstraction and replace both.

**SOLID.** One reason to change per module. Depend on abstractions, not concretions. Keep
interfaces small and focused.

**No comments in code.** In any language, in any file — ever.

**TypeScript everywhere.** No implicit `any`. Every function parameter and return value is
explicitly typed.

**150–200 line cap per file.** Split a file that grows past this. DO not add comments in code no matter what.

## UI structure

Atomic Design under `src/components/`: `atoms/`, `molecules/`, `organisms/`, `templates/`. Each
layer imports only from layers below it and exposes a barrel `index.ts`. Routes under `src/app/`
stay thin: compose one template and nothing else.

## Theming

- Every colour is a semantic token (`background`, `surface`, `primary`, `accent`, ...) defined in
  `src/theme/types.ts`. Components use token classes such as `bg-primary` or
  `text-muted-foreground`, never raw colours or palette classes.
- A theme is one data file in `src/theme/themes/`, registered in `src/theme/registry.ts`.
- A new token goes in `THEME_TOKENS`, in every theme, and in the `@theme inline` block of
  `src/app/globals.css`.
