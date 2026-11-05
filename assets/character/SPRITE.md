# Character sprite contract

This directory contains the approved character identity and the rules for
turning it into animation assets. The character is an original, stocky office
professional with a calm retired-operative/shopkeeper archetype. He is not a
copy of an existing anime character.

## Source of truth

`canonical-master.png` is the only approved full-body source for production
sprite work. It fixes the character's silhouette, face, hair, build, outfit,
colors, and neutral stance.

The immutable identity details are:

- broad, stocky adult proportions with a relaxed, grounded posture;
- swept dark hair, subtle jaw stubble, and restrained facial features;
- blue-gray rolled-sleeve formal shirt, tucked in;
- black belt with a small silver buckle;
- navy formal trousers and black formal shoes;
- clean illustrated 2D cutout rendering with restrained shading.

Do not redraw the complete character for each state. All runtime states must
reuse the canonical body and change only rig transforms or approved face parts.
Do not stretch the body, recolor the outfit, change the hair silhouette, or
move facial anchors between states.

## Asset roles

| Asset | Role | Runtime use |
| --- | --- | --- |
| `canonical-master.png` | Locked full-body identity | Yes, as the production rig source |
| `turnaround.png` | Approved multi-angle reference | Reference only |
| `expressions.png` | Approved expression direction | Reference only |
| `facial-states-reference.png` | State-specific acting guide | Reference only |
| `mouth-atlas-reference.png` | Viseme shape guide | Reference only; not pixel-registered |
| `eye-atlas-reference.png` | Blink/gaze guide | Reference only; not pixel-registered |
| `concept-sheet.png` | Original selection record | Archive only |

The generated reference atlases intentionally remain reference-only. Their
edges and registration are not sufficiently deterministic for direct overlay.
Production eyes, brows, and mouths must be extracted and registered against a
single canonical head during the rigging step.

## Coordinate contract

- Canonical canvas: `1024 x 1536` RGBA PNG.
- Stage origin: bottom center.
- Character pivot: normalized `(0.5, 1.0)` at the feet.
- Head, neck, shoulders, elbows, wrists, hips, knees, and ankles must keep one
  shared anchor set across every animation.
- The stage owns scaling. Individual animation states must not use different
  character scales or bounding boxes.
- Keep the character inside a fixed stage wrapper so motion never shifts the
  surrounding interface.

## Required runtime states

| State | Character treatment | Loop |
| --- | --- | --- |
| `idle` | neutral face, soft breathing, occasional blink | 3.6 s |
| `listening` | attentive eyes, slight forward head angle | 2.4 s |
| `transcribing` | neutral body, small eye movement only | 2.8 s |
| `thinking` | brief upward/side gaze, still torso | 3.2 s |
| `speaking` | restrained mouth cycle plus minimal head motion | driven by audio |
| `error` | stop active loops, concerned face, stable pose | none |
| `offline` | neutral face, reduced motion | 5.0 s |

State labels in the UI remain authoritative. Animation must never be the sole
way a state is communicated.

## Motion limits

- Breathing: vertical torso travel at most `0.8%` of character height.
- Head rotation: at most `3deg` in normal states.
- Head translation: at most `0.6%` of character height.
- Shoulder/arm rotation: at most `4deg` unless a later gesture is explicitly
  approved.
- Blink: `100-140ms` closed phase, irregularly every `3-7s`.
- Speaking: use small viseme changes; do not animate the whole jaw or head on
  every syllable.
- State transitions: `160-220ms` crossfade/ease-out, with no scale pop.
- Reduced motion: disable breathing and gaze loops; retain blink, mouth state,
  and the textual state label.

## Consistency gate

Before a sprite asset is allowed into the app:

1. Compare it side by side with `canonical-master.png` at identical scale.
2. Confirm hair silhouette, face width, shoulder width, belt height, trouser
   width, and shoe size do not change between states.
3. Confirm every face part uses the same head-space anchors.
4. Confirm transparent edges are clean on cream and maroon stage backgrounds.
5. Confirm state changes do not alter the outer stage box.
6. Test idle, speaking, state transitions, and reduced motion at `960 x 640`,
   `1280 x 800`, and `1440 x 900`.

If any check fails, fix the shared rig or source layer. Do not compensate with
per-state offsets.

