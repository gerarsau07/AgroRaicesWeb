---
name: landing-page-design
description: "Complete system for building high converting landing pages: intake questions, page structure, layout selection, conversion copywriting, SEO, plus visual rules for typography, spacing, corner radius, backgrounds, hero layout, icons, and motion. Adapted for AgroRaicesWeb (allows lucide-react, Plus Jakarta Sans / Inter / JetBrains Mono, and technical domain hyphenation)."
---

# Landing Page Design (AgroRaicesWeb Adapted)

A landing page is not a homepage. A homepage serves multiple intents. A landing page wins one intent:

**one offer → one audience → one primary action.**

This skill has two halves. **Part A** decides what the page says and how it is structured. **Part B** is the visual system harmonized with `agroraices-ui-design`. Work through A before touching B.

## Scope

Apply to all web UI work: landing pages, marketing sites, components, dashboards, prototypes, and design reviews. When a rule here conflicts with `agroraices-ui-design`, `agroraices-ui-design` wins for AgroRaicesWeb domain components. When the user's explicit prompt conflicts with a rule, the user wins.

---

# PART A — Strategy and structure

## A1. Intake

Gather these before designing or writing. Ask only for what is missing, and ask in one batch rather than one question at a time.

**Purpose**
- What is the ONE primary action? (trial, demo, buy, waitlist, download)
- What is the offer, exactly what do they get?
- What counts as a conversion? (click, signup, purchase)

**Audience and context**
- Who is the ICP?
- What problem are they trying to solve?
- Top three objections, meaning why they do not convert today
- Traffic source: ads, search, social, email
- What do visitors already know when they land?

**Proof and assets**
- Proof points: logos, testimonials, numbers, case studies
- Screenshots, demo video, product GIFs
- Guarantees, refund terms, cancellation terms

**Constraints**
- Brand voice: casual or professional
- Design direction: minimal editorial, AgTech GIS dark mode, glass UI
- Mobile priority?

If the user cannot answer, make a reasonable assumption, state it in one line, and continue. Do not stall the build.

## A2. Page structure

**Above the fold (required)**
1. Headline, outcome plus audience
2. Subheadline, clarifies how and adds specificity
3. Primary CTA, clear verb plus what they get
4. One proof signal, logo strip, stat, or short testimonial
5. Hero visual, product screenshot or video, or a strong illustration

**Mid page (the argument)**
6. Problem to solution, one section
7. Benefits, three to five, outcome driven
8. How it works, three steps
9. Social proof, testimonials or a case study

**Bottom (objection handling)**
10. FAQ, six to twelve questions
11. Risk reversal, trial, cancel anytime, guarantee
12. Final CTA, identical to the top

## A3. Layout selection

Pick one and say why.

| Type | Use when |
|---|---|
| **A. Classic hero plus sections** | The product is understandable from a hero screenshot. Most common. |
| **B. Long form story** | You need to educate and overcome skepticism. |
| **C. Minimal conversion page** | High intent traffic (email to known users), or a short offer like a download or waitlist. |
| **D. Comparison page** | Search intent includes alternatives ("X vs Y", "best for"). Usually paired with SEO pages. |

## A4. Conversion rules

- **Match message to source.**
- **Make the next step obvious.** Primary CTA should stand out clearly above the fold.
- **Write benefit first.** Features are what it does. Benefits are what that means for them.
- **Be specific.** Use concrete metrics (e.g., `r = 0.8584`, `MAE = 296.3 kg/ha`, `197 parcelas`).
- **Treat objections as a section, not a footnote.**

## A5. Build order

Work section by section, in this order:
1. Hero
2. Benefits / Tech Triad
3. How it works / Regional Basins
4. Proof / Comparison
5. Suite / FAQ
6. Final CTA

---

# PART B — Visual system (Harmonized with AgroRaicesWeb)

## B1. Typography

### Fonts
- **UI & Editorial:** `Plus Jakarta Sans`, `Inter`, `Geist`, `Manrope`, or `Poppins`.
- **Telemetry, Coordinates & Data:** `JetBrains Mono` or `Geist Mono` (`font-mono` with `tabular-nums`) for WGS84 coordinates, hectares, elevation (msnm), SHAP weights, and yield metrics (`t/ha`, `kg/ha`).

### Copy rules
- **Technical hyphens allowed:** Domain terms such as `Sentinel-2`, `CHIRTS-ERA5`, `DF-QuAD`, `Neuro-Simbólico`, and negative coordinates (`-98.3°`) are explicitly allowed.
- **No orphaned words:** Apply `text-balance` for headings and `text-pretty` for body copy.

### Type scale
Always resolve font sizes to Tailwind's default type scale (`text-xs` through `text-8xl`).

## B2. Spacing & Corner radius
- Use standard Tailwind spacing tokens (`p-4`, `p-6`, `p-8`, `py-20`, `gap-6`, etc.).
- **Nested radius formula:** When a shape sits inside another shape and the gap between them is less than 32px: `inner radius = outer radius − gap` (e.g. outer card `rounded-2xl` with `p-2` → inner `rounded-lg`).

## B3. Borders and backgrounds
- Borders go all the way around cards (`border border-slate-800` or `border-[#4a382c]`).
- **AgroRaíces Dark Earth & GIS Palette:**
  - Earth Dark surfaces: `#16110d`, `#1b1410`, `#1a130f`, `#221913`, `#271d17`
  - Technical GIS Dark surfaces: `bg-slate-950`, `bg-slate-900/85 backdrop-blur-md`
  - Semantic accents: `emerald-500` / `teal-400` (healthy canopy / high yield), `amber-500` / `rose-500` (water/thermal stress), `sky-500` (data controls), `#d87a52` / `#e2b957` (AgroRaíces warm barley accents).

## B4. Icons
- **Primary project icon library:** **`lucide-react`** with consistent stroke width (`strokeWidth={1.75}`).
- Phosphor, Solar, or Iconamoon are also permitted when needed.

## B5. States & Ship requirements
- Every interactive element ships with hover, active, focus, loading (`animate-pulse` skeletons), empty, and inline error states.
- No dead links (`#`). Indicate the current page in navigation.
- Use semantic HTML (`<nav>`, `<main>`, `<section>`) and Spanish copy across all user-facing views.
