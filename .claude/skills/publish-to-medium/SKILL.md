---
name: publish-to-medium
description: Prepare the Medium copy of a published almilo.com post - import it, replace the body with clean HTML from `pnpm medium <slug>`, upload the table and figure images with their alternative text, check the block sequence, then set the preview description and topics - and stop before Publish, which the author presses. Use when a post is live on almilo.com and needs its Medium copy, or when an imported Medium story lost lists, code, tables or image descriptions.
---

# Publish to Medium

The Medium copy of a post must match the post: every list, code block, table and image, with alternative text, a link back to almilo.com, and the series footer. Medium's importer keeps the title, the canonical link and the "Originally published" footer, but drops lists that start with bold text, code blocks, tables and alternative text. So: import, then replace the body with exported HTML.

The author presses Publish. Everything before that is this skill.

## 1. Export (code)

```
pnpm medium <slug>
```

Writes `.media/<slug>/medium/`: `body.html`, `footer.html`, `images/` (figures, and tables as PNG), `manifest.json` (title, series line, description, canonical URL, uploads with alternative text, expected block sequence) and `preview.html`. Open the preview and check it before going on.

## 2. Import (author or browser)

On medium.com, Stories → Import a story → the post's URL. Open the draft (`https://medium.com/p/<id>/edit`) in a tab of the Claude in Chrome group.

## 3. Replace the body (browser)

Medium's editor accepts synthetic paste events, but deletions and the image menu need real keys and clicks. Install these helpers in the editor tab with the JavaScript tool:

```js
window.__el = (name) => document.querySelector(`[name="${name}"]`);
window.__select = (a, b) => { const A = __el(a), B = __el(b || a); A.scrollIntoView({ block: 'center' });
  const r = document.createRange(); r.setStart(A, 0); r.setEnd(B, B.childNodes.length);
  const s = getSelection(); s.removeAllRanges(); s.addRange(r); return s.toString().slice(0, 60); };
window.__caretEnd = (name) => { const el = __el(name); el.scrollIntoView({ block: 'center' });
  const r = document.createRange(); r.selectNodeContents(el); r.collapse(false);
  const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
window.__paste = (html) => { const dt = new DataTransfer(); dt.setData('text/html', html);
  dt.setData('text/plain', html.replace(/<[^>]+>/g, ''));
  document.activeElement.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); };
window.__list = () => [...document.querySelectorAll('[name][class*="graf"], hr')].map((b, i) =>
  `${i} ${b.tagName} ${b.getAttribute('name') ?? ''}: ${(b.innerText || '').slice(0, 40).replace(/\n/g, '/')}`).join('\n');
```

1. `__list()` shows the blocks with their `name`. Fix the title if the importer added " — almilo".
2. Select from the first body block after the title to the last block before the AI disclaimer with `__select(first, last)`, then press Backspace (a real key). One empty paragraph remains.
3. Put the caret in it, focus the editor, and `__paste(<contents of body.html>)`.
4. `__list()` again: no empty headings or quotes may remain; delete any with the caret at their start and Backspace.

## 4. Images (browser)

For each `[[IMAGE n]]` / `[[TABLE n]]` placeholder in `manifest.uploads`, in order:

1. Select the placeholder's text and press Backspace, so its paragraph is empty.
2. Click the empty line (a real click): the "+" button appears to its left. Click it, then "Add an image".
3. Medium opens a file dialog through `input.click()`. Intercept it once per page, before the first image, so no dialog opens:
   ```js
   if (!window.__origClick) { window.__origClick = HTMLInputElement.prototype.click;
     HTMLInputElement.prototype.click = function () { if (this.type === 'file') { this.id = 'claude-file-input';
       if (!this.isConnected) { this.style.display = 'none'; document.body.appendChild(this); } return; }
       return window.__origClick.call(this); }; }
   ```
   Then find the file input (`find`: "file input element") and upload `.media/<slug>/medium/<file>` with `file_upload`.
4. Select the uploaded image (a real click), click "Alt text" in its toolbar, type the upload's `alt` from the manifest, and Save.

## 5. Check (browser)

Map the editor's blocks to the manifest's letters (P, H3, H4, LI, QUOTE, PRE, FIG, HR) and compare with `manifest.sequence` followed by `manifest.footerSequence` (the imported footer: disclaimer, separator, "Originally published"). Medium shows top-level `##` headings as H3; subheadings may show as H3 or H4. Every `figure img` must have its alternative text. Fix any difference before going on.

## 6. Publish settings (browser), then stop

Click Publish in the editor. In the dialog:

- **Preview title:** the post's title.
- **Preview description** (the subtitle, at most 140 characters): `manifest.description`, not the series line.
- **Preview image:** the author's choice; usually the post's `image`.
- **Topics:** the same five as the previous part of the series (read them from its Medium page). Type each one, press Down, then Return; clicking a suggestion does not always register.

Then hand over to the author, who presses Publish. Afterwards, add the story's URL as `medium` in the post's front matter.
