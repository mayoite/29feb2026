# Accessibility Enhancements

## Goal
Deliver a WCAG-focused accessibility pass across the site, including keyboard navigation, ARIA coverage, contrast validation, screen-reader improvements, and automated alt-text assistance workflow.

## Scope
- Run WCAG audit across key templates and high-traffic pages.
- Fix missing/incorrect ARIA labels and semantic roles.
- Resolve keyboard-navigation traps and focus-order issues.
- Validate and fix color contrast using current brand palette.
- Improve screen-reader announcements and landmark structure.
- Add an alt-text generation helper flow for missing product images.
- Verify changes across all major pages and document compliance status.

## Execution Steps
1. Run baseline accessibility audit (axe + manual keyboard checks).
2. Create ARIA plan for nav, menus, forms, cart, dialogs, and dynamic widgets.
3. Identify keyboard issues:
   - unreachable controls
   - missing focus states
   - trap/escape problems in overlays.
4. Implement component-level fixes:
   - labels, `aria-*`, roles, focus management, semantic headings.
5. Contrast checks for text/components against the current palette.
6. Add/upgrade screen-reader support:
   - live regions for async updates
   - proper labels for icon-only controls
   - skip links and landmark consistency.
7. Integrate alt-text AI generator workflow for media with missing alt text.
8. Run full-page verification pass on all major routes.
9. Write compliance summary and residual known gaps.
10. Commit accessibility changes with clear changelog.

## Acceptance Criteria
- No critical accessibility violations on primary routes.
- Full keyboard access to nav, drawers, menus, filters, and cart.
- Color contrast passes WCAG AA for standard text and controls.
- Screen-reader labels/announcements present for dynamic UI.
- Missing alt text is detected and handled by the defined generation flow.
- Compliance summary is documented for future audits.

## Test Checklist
- Automated:
  - axe scans for home, products, product detail, contact, quote-cart.
- Manual:
  - tab/shift+tab navigation
  - ESC behavior for modals/drawers
  - visible focus verification
  - screen-reader spot checks (NVDA/VoiceOver workflow).
- Regression:
  - no broken interactions after ARIA/focus updates
  - no layout break on mobile/desktop.
