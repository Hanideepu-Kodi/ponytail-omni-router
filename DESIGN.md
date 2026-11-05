---
version: alpha
name: Ponytail OmniRouter
basedOn: "Descript Design System"
reference: "https://www.shadcn.io/design/descript"
description: >-
  A warm, editorial desktop AI Test Agent interface. It adapts Descript's
  cream canvas, maroon brand color, serif display type, restrained geometry,
  and flat bordered surfaces to a voice-first animated assistant powered by
  OmniRouter.
---

# Ponytail OmniRouter Design System

## Direction

Build a desktop application that feels like an editorial workspace rather than
a generic dark AI dashboard. The animated human model is the visual anchor;
the transcript, response, and agent status remain calm and readable beside it.

The system inherits these defining choices from the Descript reference:

- Warm cream canvas instead of pure white.
- Deep maroon as the single primary brand color.
- Serif display headings paired with restrained sans-serif UI text.
- Flat surfaces separated by hairline borders, not stacked shadows.
- Small 4px corners for utility chrome and 12px corners for primary controls.
- Rectangular primary actions; never render primary buttons as pills.

## Product shell

### Desktop frame

- Design first for a `1280 × 800` Electron window.
- Support a minimum usable window of `960 × 640`.
- Use a `64px` top bar and a two-pane workspace below it.
- Keep the main workspace within the window; scroll inside the transcript and
  response pane rather than scrolling the entire application shell.

### Primary layout

Use a `5 / 7` split at desktop sizes:

1. **Agent stage — left pane**
   - Minimum width: `360px`.
   - Contains the animated human model, current state label, live waveform, and
     primary voice control.
   - The model remains centered and visually dominant without touching panel
     edges.
   - Use a deep-maroon stage for focused voice sessions and the cream canvas
     for idle or setup states.

2. **Conversation workspace — right pane**
   - Contains the live transcript, AI response, file context, and session
     history.
   - Prefer one readable content column with a `720px` maximum line width.
   - Keep the current turn prominent; older turns recede through muted text and
     hairline dividers rather than smaller cards inside larger cards.

At widths below `960px`, stack a compact `280px` agent stage above the
conversation workspace. Do not remove voice state or connection status.

## Color tokens

Use the Descript palette as the base. Maroon is the brand voltage and should
not become general decoration.

| Token | Value | Use |
| --- | --- | --- |
| `canvas` | `#fff8f4` | Application background and light panels |
| `surface-warm` | `#ffe8db` | Selected transcript text, code/file badges |
| `maroon` | `#651a39` | Primary action, active voice control, focus ring |
| `maroon-deep` | `#390a1a` | Display headings and focused agent stage |
| `maroon-darker` | `#2a0711` | Primary hover state |
| `maroon-deepest` | `#190308` | Primary pressed state |
| `ink` | `#1a1a1a` | Primary UI text |
| `ink-body` | `#26171d` | Paragraph and transcript text |
| `ink-charcoal` | `#3f2a32` | Dark secondary surfaces |
| `ink-muted` | `#8b6f7a` | Secondary labels and metadata |
| `ink-subtle` | `#a28993` | Timestamps and tertiary metadata |
| `ink-disabled` | `#d1c7cb` | Disabled text and controls |
| `hairline` | `#e5e7eb` | Borders and dividers only |
| `eyebrow-red` | `#ff5340` | Uppercase state eyebrows only |
| `alert-red` | `#f73b3b` | Errors, destructive warnings, recording failure |
| `lilac-light` | `#cdcdfe` | Temporary speech-to-text selection highlight |
| `lilac-mid` | `#8787e0` | Transcription progress only |

### Color rules

- Reserve `maroon` for the most important action or active state in a view.
- Use `eyebrow-red` only for short uppercase state labels.
- Use `hairline` only for borders and dividers, never for text.
- Do not introduce gradients, neon glows, or decorative rainbow AI colors.
- Do not create a full dark theme until the light experience is complete.

## Typography

The preferred Descript families are proprietary. Use their open-source
fallbacks until licensed assets are deliberately added.

| Role | Stack | Size / weight | Use |
| --- | --- | --- | --- |
| Display hero | `Gamuth Display, Fraunces, Georgia, serif` | `56px / 400 / 1.1` | Empty state or onboarding hero only |
| Display section | `Gamuth Display, Fraunces, Georgia, serif` | `40px / 400 / 1.1` | Major session headings |
| Heading | `Booton, Inter, system-ui, sans-serif` | `24px / 600 / 1.3` | Pane and response headings |
| Subheading | `Booton, Inter, system-ui, sans-serif` | `20px / 600 / 1.5` | Card and dialog headings |
| Body | `Booton, Inter, system-ui, sans-serif` | `16px / 400 / 1.5` | Transcript and response text |
| UI label | `Booton, Inter, system-ui, sans-serif` | `14px / 600 / 1.4` | Buttons, navigation, metadata |
| Eyebrow | `Brett, Inter, system-ui, sans-serif` | `13px / 600 / 1` | Uppercase agent state label |
| Technical | `JetBrains Mono, ui-monospace, monospace` | `13px / 500 / 1.4` | Model IDs, latency, file paths |

### Type rules

- Use the serif only for display headings, never for transcript or controls.
- Use sentence case for buttons and navigation.
- Use uppercase only for short eyebrow labels such as `LISTENING`.
- Keep transcript and AI response text at least `16px`.
- Limit readable prose to roughly `72` characters per line.

## Shape and spacing

### Radius

| Token | Value | Use |
| --- | --- | --- |
| `none` | `0px` | Full-bleed bands and panes |
| `sm` | `4px` | Badges, code/file chips, utility chrome |
| `md` | `8px` | Inputs, menus, compact controls |
| `lg` | `12px` | Primary buttons, dialogs, major cards |
| `circle` | `100%` | Avatar/status dots and circular icon buttons |

Pill geometry is allowed only for compact status chips. Never use a pill for a
primary action.

### Spacing

Use an 8px foundation with a 4px micro-step:

`4, 8, 12, 16, 24, 28, 32, 48, 64`

- Pane padding: `24px` desktop, `16px` compact.
- Major section gap: `32px`.
- Related control gap: `8px`.
- Card padding: `24px 24px 32px`.
- Minimum interactive target: `44 × 44px`.

## Core components

### Top bar

- Height: `64px`.
- Cream background with a bottom hairline.
- Left: product name and current session title.
- Right: OmniRouter connection state, active model, history, and settings.
- Keep connection metadata compact; reveal detail in a popover.

### Agent stage

- Treat the character as content, not decoration.
- Provide enough clear space for head, shoulders, hands, and state motion.
- State changes must be readable through motion and a text label; never rely on
  motion alone.
- Use preloaded animation states rather than attempting to generate video for
  every response.

Required visual states:

- `idle`: relaxed loop with low visual activity.
- `listening`: attentive pose plus live waveform.
- `transcribing`: subtle processing motion and rolling transcript preview.
- `thinking`: calm pause; avoid generic spinning loaders over the face.
- `speaking`: synchronized speaking loop and response progress.
- `error`: motion stops safely; show a clear recovery action.
- `offline`: neutral pose with OmniRouter reconnection status.

### Voice control

- Primary control is `54px` high with a `12px` radius.
- Idle label: `Start speaking`.
- Active label: `Stop listening`.
- Maroon fill for the active primary action; cream label and icon.
- Show the keyboard shortcut in muted text when one exists.

### Transcript panel

- Show live user speech in body text with stable line wrapping.
- Use `lilac-light` only for the unstable transcription segment.
- Confirmed transcript returns to normal ink text.
- Display timestamps and confidence only on demand.

### AI response

- Use one continuous editorial response surface, not a stack of chat bubbles.
- Separate sections with headings, spacing, and hairlines.
- Code and file paths use the technical type role on `surface-warm`.
- Place copy, retry, and feedback controls at the end of the response.

### File context

- Present files as read-only rows with name, path, and status.
- Long paths truncate in the middle and reveal fully on hover/focus.
- Never imply that a file was changed unless a real write action completed.

### Status and feedback

- Show OmniRouter connection, active model, and latency as compact metadata.
- Success feedback should be quiet and inline.
- Errors use `alert-red`, plain language, and an explicit retry action.
- Loading states should describe the real operation: `Transcribing`,
  `Routing model`, or `Generating response`.

## Icons

Use **Phosphor Icons only**. Do not mix icon families or substitute emoji,
Unicode symbols, hand-authored SVGs, or another icon library.

Recommended mappings:

| Action | Phosphor icon |
| --- | --- |
| Start listening | `Microphone` |
| Stop listening | `Stop` |
| Settings | `GearSix` |
| Session history | `ClockCounterClockwise` |
| File context | `Files` |
| Copy response | `Copy` |
| Retry | `ArrowClockwise` |
| Connected | `PlugsConnected` |
| Warning/error | `WarningCircle` |
| Close | `X` |
| Expand menu | `CaretDown` |

- Default icon size: `20px`; compact metadata: `16px`; primary voice control:
  `24px`.
- Use regular weight by default and bold weight only for the active primary
  action.
- Every icon-only button requires an accessible name and tooltip.

## Motion

- UI transitions: `150–220ms`, ease-out.
- Pane changes may use a `240ms` crossfade/translate of no more than `8px`.
- Character animation loops must not cause the surrounding layout to move.
- Waveform motion reflects microphone activity, not decorative randomness.
- Respect `prefers-reduced-motion`; replace nonessential loops with static
  states while preserving text status.
- Never animate every surface simultaneously.

## Accessibility

- Meet WCAG AA contrast for all text and controls.
- Keep visible keyboard focus using a `2px` maroon outline with `2px` offset.
- Provide captions/transcript for every spoken response.
- Voice input must have keyboard and pointer alternatives.
- Do not encode listening, thinking, or error state by color alone.
- Announce state changes with an appropriately scoped live region.
- Preserve usable zoom up to `200%` without hiding controls.

## Do

- Keep the warm editorial character of the Descript reference.
- Let the animated human model and current response be the two strongest
  elements in the workspace.
- Use maroon sparingly so active voice and primary actions remain obvious.
- Prefer hairline dividers and spacing over nested cards and shadows.
- Write specific operational labels rather than generic AI language.
- Verify every layout at `960 × 640`, `1280 × 800`, and `1440 × 900`.

## Do not

- Do not turn the interface into a generic dark developer dashboard.
- Do not use chat bubbles for every message.
- Do not use glassmorphism, heavy shadows, gradients, or glowing borders.
- Do not use the serif face for controls, transcripts, or metadata.
- Do not use maroon as a decorative background across multiple panes.
- Do not hide model routing, listening, or error status behind animation.
- Do not add UI icons outside the Phosphor Icons library.

## Implementation checklist

- [ ] Cream canvas and maroon hierarchy match the tokens above.
- [ ] Desktop shell uses the defined two-pane layout.
- [ ] All seven agent states have text and visual treatments.
- [ ] Transcript remains readable during live updates.
- [ ] OmniRouter connection and active model are visible.
- [ ] All icons come from Phosphor Icons.
- [ ] Keyboard flow and focus states are complete.
- [ ] Reduced-motion behavior is verified.
- [ ] Target window sizes are visually checked.

## Source and adaptation

This system is adapted from the [Descript Design System](https://www.shadcn.io/design/descript).
It preserves the reference's visual grammar while replacing its marketing-page
layout with the requirements of a desktop, voice-first AI Test Agent.
