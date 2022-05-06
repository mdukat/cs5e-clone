# Templates

Every template here was modified to work with Jinja by fixing static links to `url_for`, and adding variables (such as `sheet_code`).

## `sheet.html`

This is post-processed html from Firefox 'save-as' option. Known bugs: displays double option line on top

## `sheet2.html`

This is pre-processed html directly from site, downloaded using wget. Known bugs: loads infinitely

## `sheet3.html`

Post-processed html, copied from Firefox "Inspect". Works same as `sheet.html`

## `sheet3-nomenu.html`

Post-processed html, fixes `sheet.html` double menu line. You should use this version. Known bugs: all boxes in menu are selected, while only "Cap attributes", "Calculable fields" and "Transient fields in print" should be selected.

## `index.html`

Post-processed index, copied from Firefox "Inspect". Known bugs: double arrows, text doesn't close.

