# Making new pages from the template

`index.html` is the original, hand-made page. It is **not touched** by anything below.

New pages are built from one shared **template** (the design) and one small **data file** per page
(the words, prices, images and links). You copy the data, change the words, and run one command.
`estimate.html`, `residential.html`, `commercial.html` and `contracts.html` are built this way. It is an exact copy of `index.html`.

## Make a new page (3 steps)

```bash
node build.js --new master-rate-sheet     # 1. copies data/pages/estimate.json -> data/pages/master-rate-sheet.json
# 2. open data/pages/master-rate-sheet.json and change the words, prices, images and links
node build.js master-rate-sheet           # 3. builds master-rate-sheet.html
```

Open `master-rate-sheet.html` in the browser to check it. To start from a different page than `estimate`,
add `--from other-page`. `node build.js` on its own rebuilds every page. `node build.js --check` only
reports mistakes and writes nothing. If a value is missing the build stops and tells you exactly which one.

## Where things live

| Path | What it is |
| --- | --- |
| `templates/page.html` | the page skeleton: which sections appear and in what order |
| `templates/partials/*.html` | one file per section (hero, pricing, faq ...), the actual design markup |
| `data/site.json` | defaults shared by every page (logo, footer links, section switches) |
| `data/pages/<name>.json` | everything that changes from page to page |
| `styles.css`, `script.js` | shared by all pages, never copied |
| `build.js` | the build script (needs only Node, nothing to install) |

**Never edit a generated page** (`estimate.html`, ...) by hand. Your change is lost the next time it is built.
Change the data file (words) or the files in `templates/` (design), then build again.

## The data file

Open `data/pages/estimate.json`. It has one block per section, in page order: `meta`, `hero`, `pillars`,
`trusted`, `metrics`, `experts`, `demo`, `ghosted`, `quote`, `closeprojects`, `six`, `curriculum`,
`bonuses`, `reviews`, `value`, `pricing`, `guarantee`, `instructor`, `who`, `faq`, `final`, `footer`.

* **Text** can contain simple HTML where the original does, for example `Ghosted <span class="ghosted-green">Again?</span>`
  or `<br>`. Write `&amp;` for `&`.
* **Lists** (`faq.items`, `reviews.images`, `six.items` ...) can be made longer or shorter. Add or remove one `{ ... }` block.
  The numbers (`01`, `02`, "Module 03", "Bonus 2") are added automatically.
* **Images and links** are written from the site root, like `assets/reviews/1.jpeg`. Put the new picture in `assets/` and
  point to it. The build adds the right `../` for pages in sub-folders.
* **`video.id`** is the YouTube video that opens from every play button on that page.
* **`output`** is the file the page is built into. It defaults to `<page name>.html`. The build refuses to overwrite `index.html`.
* **`sections`** turns whole sections on or off for one page. Example: add
  `"sections": { "ghosted": false, "closeprojects": false }` to a page's data to leave those two out.
  Anything not listed stays on (the defaults are in `data/site.json`).
* Optional fields: an expert card shows `(role)` after the name only if `role` is set.
  A value item with `"priceless": true` gets the green "Priceless" style. A plan feature with `"off": true` shows as a crossed-out line.

## Optional data (turn on extra design variants)

* **`pricing.plans`** is a list: 2 or 3 plan cards. Mark one `"featured": true` (green card with the tilted tag). Set
  `"pricing.threeUp": true` for three cards side by side. Optional: `pricing.sub`, `pricing.footnote`, per plan `oldPrice`,
  `valueText` / `offerBadge`, `plusHeader`. Each plan needs a unique `id`.
* **`demo.chips`** (list of `{ "label", "line" }`) shows two-line step chips instead of the one-line `demo.steps`.
* **`curriculum.accordion": true`** makes each module open to show its lessons. Modules are then `{ "title", "lessons": [...], "count" }`.
* **`quote.doc`**: leave `calc`, `total` and `schedule` empty (`[]`, `""`) for a plain signed-page mock instead of an estimate.
* **`bonuses.threeUp": true`** for three bonus cards in a row. **`reviews.eyebrow`** and **`reviews.rating`** add a label and a rating line.

## Things the template fixes (change the files in `templates/` for these)

* The order of the sections.
* The design details that are not text: icons, the floating coins and notes, the animations.
* The look of the brand names in "Trusted by" comes from the style names `brand-livespace`, `brand-homelane`, `brand-essajees`,
  `brand-gauri`. A new brand name works, but gets the plain look until a style is added in `styles.css`.
* The colour of the six cards comes from `tone`: `mint`, `peach` or `yellow`.

## Putting it online

The site is plain files, so nothing else is needed. Commit and push the data file **and** the built `.html` file.
A page called `master-rate-sheet.html` is then live at `https://<your-domain>/master-rate-sheet.html`.
