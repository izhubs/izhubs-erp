---
name: conductor-validator
description: Validate track SPEC files for completeness, consistency, and correctness. Use before starting implementation of any track to ensure the spec is clear enough to build from.
triggers:
  - validate track
  - validate spec
  - check spec
  - ready to implement
---

# Conductor: Validator

## Purpose
Before any code is written, validate the SPEC.md is complete enough to implement without ambiguity.

## Validation Checklist

### Required Fields
- [ ] Track name is clear and specific
- [ ] Status is set
- [ ] Summary is 1-2 sentences, non-vague
- [ ] At least 1 user story exists
- [ ] Acceptance Criteria are binary (can be tested as pass/fail)
- [ ] Out of Scope section exists (even if empty = "None")

### Technical Completeness
- [ ] DB changes specified (or "None required")
- [ ] API endpoints listed with method + path + auth
- [ ] Engine functions identified
- [ ] UI components/pages identified
- [ ] Implementation phases defined

### Quality Checks
- [ ] No vague criteria (e.g., "should be fast" → must be "< 200ms response")
- [ ] No open questions marked `[ ]` (must be resolved before implementation)
- [ ] Acceptance Criteria are measurable

## Output Format

```
## Validation Result: [PASS / FAIL / WARNINGS]

### ✅ Passed
- [item]

### ❌ Failed (blocking)
- [item] → [what's missing]

### ⚠️ Warnings (non-blocking)
- [item] → [suggestion]

### Recommendation
[PROCEED / FIX THESE ISSUES FIRST]
```

## Rules
- If any ❌ Failed items exist: do NOT proceed to implementation
- Warnings should be acknowledged but don't block work
- Open Questions must all be answered before marking as ready
