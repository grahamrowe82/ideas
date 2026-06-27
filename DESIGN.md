# DESIGN.md — ideas.phasetransitions.ai

The design anchor for the Phase Transitions ideas site: a warm, browsable front surface that
funnels readers to the Substack. dogfood judges look and feel against this. Distinct from the
antislop tool's look; this is the Phase Transitions brand.

## Visual intent

The physics of the name. A phase transition is the moment a system changes state, order
crystallising out of noise. The site feels like that: precise and calm, a scientific-paper
composure, but warm enough to invite a stranger to wander. Reference: a well-set scientific
monograph or a field notebook, order emerging from scattered points. Anti-reference: the two AI
defaults this must dodge, the dark-mode-plus-acid-accent look, and the cream-plus-serif-plus-
terracotta blog look.

## The signature

**Order from noise.** A field of dots that are scattered on one side and resolve into a clean
lattice on the other: a phase transition, drawn. It anchors the hero and reappears, small, as a
section marker. It is the one bold element; everything else stays quiet. Optional: a gentle
one-time settle on load (the dots crystallising), disabled under `prefers-reduced-motion`.

## Colour roles

Light "lab paper", cool, one accent. Never dark-mode, never terracotta.

| Role | Value | Used for |
|---|---|---|
| Paper | `#eef1f0` | the page background |
| Card | `#f7f8f7` | raised surfaces (a curated card, the practice panel) |
| Ink | `#15191b` | body text, headings |
| Phase (accent) | `#0e7c86` | the cool "critical" teal: wayfinding, links, interactive. Navigation, not decoration |
| Ember | `#bf531d` | the warm side of the transition. Used ONLY inside the order-from-noise motif and nowhere else |
| Muted | `#6b7572` | metadata, coordinate labels |
| Rule | `#d6dbd9` | hairline dividers and the lattice |

The cool→warm pair (phase teal, ember) exists to carry the transition idea, not to decorate.
Outside the dot motif, the accent is the teal alone, and it means "you can navigate here".

## Typography

Three roles, scientific-meets-literary:

- **Display / headings: Space Grotesk** (500, 700). A technical grotesque; carries the
  phase-transition register without being cold.
- **Labels, coordinates, metadata: IBM Plex Mono** (400). Scientific-notation feel: section
  numbers (`01 / 05`), door labels, the eyebrow.
- **Body, reading text: Source Serif 4** (400, italic, 600). The publication's voice. Warm and
  readable; this is a site about writing.

Rule that must hold: metadata and labels are mono, headings are grotesk, all running prose is
serif. Self-host all three (no third-party calls).

## Layout and spacing

- Max content width ~960px; comfortable reading measure (~62ch) for prose.
- Coordinate-style mono labels as quiet eyebrows; hairline rules, not boxes, between sections.

**Spacing scale (base 8).** Draw every gap from this scale and nothing else: 8, 16, 24, 32, 48,
64. Coherence comes from using the scale, not from one-off numbers.

**Section rhythm.** Each section has 48px vertical padding, top and bottom, so the gap across a
divider is ~96px: a clear breath, not a void. Not 0 (cramped, the first mistake), not 88
(cavernous, the over-correction). Label to content: 24px. Rows within a list: 20px. Card
padding: 24px.

## Interaction model (one pattern, used everywhere)

Every selectable item, a "ways in" door, a start-here card, a level, a topic, is a **single
block-level link**. The whole block is the click target; you can click anywhere in it. Hover
highlights the whole block (a `--card` fill, the title shifting to deep teal). A small arrow in
the block shows it leads somewhere; blocks that leave for Substack say so quietly. Never make a
selectable block depend on clicking a small inline link at the end of a line: if the block is a
choice, the block is the link. Inline links inside running prose are the exception, they stay
underline-on-hover, because reading is not selecting.

## Components

- **Doors ("ways in"):** a row/grid of entry points (by a feeling, by your level, by topic, by
  lineage, along the arc). Mono label + serif gloss; hover lifts the teal.
- **Curated cards ("start here"):** card surface, a reader situation in serif, a linked piece
  title. Each links OUT to Substack.
- **Topic index:** the eight topics as a clean list, mono number + grotesk title + teal link
  out.
- **The arc:** three phases as a short horizontal timeline.
- **Subscribe / practice:** subscribe is the primary CTA (teal). The "work with me" practice
  link is present but quiet and secondary.

## Elevation and depth

Flat by intent: no shadows. Depth comes from the paper/card tonal step and hairline rules, not
from elevation. The only layer is the dark subscribe band against the paper. No z-index stack.

## Motion

Quiet. The dot-field may settle once on load (the crystallisation), disabled under
`prefers-reduced-motion`. Hover and focus transitions are ~0.15s. Smooth-scroll on the in-page
door links, also disabled under reduced-motion. Nothing else animates.

## Content and voice

The Phase Transitions voice: serif prose, confident, concrete. Sentence case for headings and
labels, held consistently. The antislop convention applies to every word on screen (no em dashes,
no AI-writing tells). Labels are plain words ("Start", not "Lay"). One term per concept.

## Accessibility

Body ink on paper clears WCAG AA comfortably; white-on-teal buttons clear AA; teal text uses the
deeper `#0a5c64` where it is small so it clears AA too. Every interactive element (doors, cards,
levels, topics, buttons) has a visible focus ring (2px teal, offset). The whole-block links are
large tap targets. Reduced-motion is honoured. The dot-field carries descriptive alt text.

## Do's and don'ts

**Do**
- Make the order-from-noise dot field the one signature, and keep everything around it quiet.
  Reason: spend boldness in one place.
- Use mono only for scientific/coordinate labels, serif for all prose, grotesk for headings.
  Reason: the three-register system is the identity.
- Reserve teal for things you can navigate. Reason: it should always mean "go here".
- Always send the click onward to Substack. Reason: the site's job is the funnel; it frames and
  points, it does not reproduce the pieces.

**Don't**
- No dark-mode-plus-acid and no cream-plus-terracotta. Reason: the two generic AI-design tells.
- No em dashes anywhere, and no AI-writing tells in any copy. Reason: the antislop convention is
  pinned; this author is known for it.
- Don't let the ember escape the dot motif. Reason: two roaming accents muddy the system.
- Don't build a wall of text or reproduce piece content. Reason: it competes with the Substack
  instead of feeding it.
- No engagement-bait CTAs. Reason: the voice forbids it.

## Responsive

Down to 390px: the hero stacks and the dot field scales down or simplifies; the doors stack to
one column; the topic index and timeline stack. Hard rule: no horizontal overflow at any width.
