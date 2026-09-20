# Kapitech AMS UI Design System

## Purpose

This document defines the visual and interaction direction for Kapitech AMS. It preserves the existing obsidian / charcoal / electric-red concept while applying Apple-inspired principles of clarity, deference, focus, user control, accessibility, and restrained motion.

This is an adaptation for a responsive web application. It is not a claim of official Apple HIG compliance or use of Apple proprietary assets.

## Product principles

### Empathy
The interface should make the next action obvious. Empty states, errors, permissions, loading states, and confirmations must explain what happened and what the user can do next.

### Focus
Each screen has one primary intent. Secondary actions move into toolbars, contextual menus, or secondary sections.

### Impute
The first viewport should immediately communicate product quality: strong hierarchy, calm spacing, consistent controls, stable navigation, and predictable feedback.

### Privacy and security
Sensitive information is never presented as decoration. Security state is visible when it affects the user's ability to work. Authentication remains server-authoritative.

### Deference
Content remains visually dominant. Cards are calmer, borders are subtle, decorative glow is disabled inside AMS, and translucency is used only for hierarchy.

### User control
Destructive actions require confirmation. Navigation state is explicit. Mobile primary navigation uses five or fewer destinations, with additional modules available from the More sheet.

### Direct responsibility
Projects expose one clearly identified DRI / team lead.

## Visual system

- Base surfaces: obsidian #090A0F, charcoal #111318, elevated #181B22.
- Primary interactive tint: Kapitech electric red.
- Positive state: semantic green.
- Warning state: semantic amber.
- Error state: semantic red plus iconography.
- Technical data: monospace.
- General interface copy: system sans-serif stack.
- Use whitespace, grouping, and hierarchy instead of heavy divider lines.
- Do not add new third-party font dependencies.

## Responsive navigation

### Desktop
Use the existing structured sidebar. It remains the information-dense navigation model for mouse and trackpad users.

### Mobile
The bottom tab bar is the primary navigation surface and shows up to five role-permitted destinations.

The top bar is reserved for page identity, Search, Notifications, and a More action.

The More sheet contains secondary modules, preferences, role context, and the public-site shortcut.

The More sheet closes on route change, overlay tap, or Escape.

## Interaction rules

- Touch targets should be at least 44 x 44 CSS pixels on mobile.
- Focus-visible states use a high-contrast ring.
- Destructive operations require confirmation.
- Successful security and backup actions may use optional device vibration feedback.
- Reduced-motion and reduced-transparency preferences disable or simplify motion and visual effects.
- Loading states should preserve layout and avoid large visual jumps.
- Errors should state the failed operation and recovery path.

## Data UX

Server state is authoritative in production.

Client caches may optimistically update for responsiveness, but failed persistence requests roll the UI back to the previous state.

Finance calculations are server-authoritative.

Audit logs are server-created and integrity checked.

Private documents are stored outside the public static root and use object-level access controls.

## Security Center

Security Center is the operational source of truth for:

- TOTP MFA coverage.
- Encryption-at-rest state.
- Backup count and retention.
- Backup freshness.
- Backup integrity.
- Audit-chain integrity.

MFA is required before protected AMS operations.

## Accessibility

- Never rely on color alone for status.
- Use semantic labels for icon-only actions.
- Preserve keyboard focus.
- Avoid truncating primary labels.
- Support wrapping at larger text sizes.
- Respect reduced-motion and reduced-transparency preferences.
- Keep contrast strong enough for normal reading and provide non-color status cues.

## Component direction

### Buttons
Prefer one primary tint action per context. Secondary actions remain neutral.

### Inputs
Use grouped, rounded controls with clear labels and predictable focus. Avoid decorative borders that do not communicate state.

### Cards
Cards group related information. They should not compete with their contents.

### Alerts
Use compact inline alerts for local issues. Use a centered confirmation only for consequential actions.

### Tables
Keep headers quiet and data legible. Preserve horizontal scrolling on narrow screens.

### Navigation
Active state must be visible through tint, weight, and position, not color alone.

## Handoff acceptance

A feature is ready when:

- Production data remains server-authoritative.
- Permission checks are enforced by the server.
- The mobile layout remains usable at 320 CSS pixels and above.
- Keyboard focus is visible.
- Reduced motion works.
- Destructive actions are auditable.
- Security-sensitive state is not hidden.
- New UI does not introduce unnecessary dependencies or decorative effects.