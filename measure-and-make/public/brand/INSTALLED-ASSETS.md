# Brand assets in this directory

Copied unmodified from the approved package. These are production files: do not
redraw, trace, re-font, recolor, approximate, or recreate them in CSS or an icon
library.

| File | Role | Use |
|---|---|---|
| `measure-make-03-5-horizontal.svg` | Primary lockup (full name + seal) | Header and footer, all breakpoints. Dark ink, so light grounds only. |
| `measure-make-makers-seal.svg` | Maker's Seal, standalone | Secondary signature only, after the full name has appeared. Favicon source. |
| `README.md` | The package's own brand README | Reference, kept alongside the assets. |

## Awaiting the source archive

`Measure-and-Make-Concept-03-5.zip` has not reached this repository, and these
files are the only production lockups that exist in any source available to the
build. Still to install, unmodified, when the archive arrives:

- `measure-make-03-5-reverse.svg` (light-on-dark lockup)
- `measure-make-03-5-stacked.svg`
- `measure-make-03-5-horizontal.png`
- `measure-make-03-5-reverse.png`
- `measure-make-03-5-stacked.png`
- `measure-make-makers-seal.png`

Nothing has been substituted for them. Until the reverse lockup is installed,
every lockup on the site sits on a light ground so the supplied dark-ink artwork
renders as drawn; no filtered or inverted copy exists anywhere in the code. The
concept-board files are reference-only and are deliberately not served publicly.

To install: unzip the archive, copy the files above into this directory keeping
their names, then use the reverse lockup in `src/components/ui/Logo.tsx` (add a
`"reverse"` variant) and the stacked lockup for narrow layouts.
