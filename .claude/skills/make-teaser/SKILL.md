---
name: make-teaser
description: Draft the LinkedIn post for a published almilo.com post (text with the post's diagram attached, no video by default), and, only when the author asks for one, make a short teaser video (portrait 1080 x 1350, about 50 seconds, no sound) - scenes that highlight passages of the live post with a caption each, an optional demo scene, and an end card. Use when a post is published and needs its LinkedIn post.
---

# LinkedIn post, and a teaser on request

By default the LinkedIn post is text with the post's diagram (its `image`) attached as a picture, without a video: the teasers did not help with the audience, and the link preview shows the diagram as a thumbnail too small to read. Make a teaser only when the author asks for one (steps 2 and 3).

## 1. The LinkedIn post

Same shape as the earlier posts:

1. A question as the first line.
2. Two short paragraphs: the problem, then what the part shows, with its main result.
3. "Read part N:" and the post's URL.
4. Three hashtags, starting with #SoftwareArchitecture #KnowledgeManagement.

Neutral and factual, in the voice of the posts. Names of people are plain text; the author decides whether to mention them.

When the author asks for the draft in LinkedIn (Claude in Chrome): Start a post, click the "Share your thoughts" field itself (a click elsewhere in the dialog drops the typed text), and type the text. Then attach the diagram: remove the link preview card that LinkedIn adds for the URL (the media buttons only show without it), click the photo button, upload `public/<image>` to the file input, click ALT, set the alternative text (from the post's figure) and Add, then Next. Stop before Post: the author reviews and posts.

- The link preview and a video or image exclude each other; the URL in the text stays a link. Removing media does not bring the preview back: to get it back, select all the text and type it again.
- Do not select with shift+Home: in the composer it selects to the start of the text, not of the line.
- Long typed text can lose characters in LinkedIn's alt text field: set it with `form_input`, type a space and Backspace so LinkedIn registers it, and check the value before Add.

Afterwards, add the post's URL as `linkedin` in the post's front matter.

## 2. Teaser, on request: write the scene file

A teaser walks through the live post in about 50 seconds: each scene highlights one passage in yellow and says its point in a dark caption; scenes cross-fade; an end card names the series, the part and the links. The script renders; the scene file decides. Writing the scene file is the editorial work.

`teasers/<slug>.yaml` (committed, so a teaser can be re-rendered). Start from an existing one, for example `teasers/software-that-knows-the-knowledge-model-as-grounding.yaml`.

- **Story:** 10 to 13 scenes, about 4 seconds each. Follow the post: the question or problem, the idea, how it works, the evidence (numbers), where to try it.
- **Captions:** at most two short lines, plain and factual, with numbers exactly as in the post. No claims the post does not make.
- **Highlight:** one element per scene: `{ text: '…' }` (a paragraph or list item containing the text; the text must be on one line of the markdown source), `{ kind: table|ul|li, text: '…' }`, `{ figure: <image file name part> }` or `{ selector: '…' }` on other pages.
- **Placement:** `at` scrolls the element to a fraction of the screen height (`top` keeps the page at the top); `captionAt` places the caption (fraction from the top), otherwise it goes to the half the element leaves free; `captionSide: left` for two-column pages.
- **Demo scenes:** `url`, a wider `width` (900 for the IMCI app), and `steps` (`click`, `clickText`, `wait`) to bring the page into the state to show. Use only what runs without API keys.
- **End card:** kicker ("Software that knows · Part N"), title, links (check that each one opens), the disclaimer line.

## 3. Teaser, on request: render

```
pnpm teaser <slug>
```

Needs Google Chrome and ffmpeg. Writes `.media/<slug>/teaser/`: `teaser.mp4`, one PNG per scene and `contact-sheet.png`. Look at every scene PNG: the highlight is the intended element, the caption does not hide it, and nothing is cut off. Adjust the scene file and render again. `--base http://localhost:4321` renders from the dev server before publication.

With a teaser, the post adds "Here it is in 50 seconds." (the video's length) before the link, and the author publishes it with the video instead of the link preview.
