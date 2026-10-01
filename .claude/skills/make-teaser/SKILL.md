---
name: make-teaser
description: Make a short teaser video (portrait 1080 x 1350, about 50 seconds, no sound) for an almilo.com post, for LinkedIn - scenes that highlight passages of the live post with a caption each, an optional demo scene, and an end card - and draft the LinkedIn post that goes with it. Use when a post is published and needs its LinkedIn teaser.
---

# Make a teaser

A teaser walks through the live post in about 50 seconds: each scene highlights one passage in yellow and says its point in a dark caption; scenes cross-fade; an end card names the series, the part and the links. The format follows the earlier teasers of the series.

The script renders; the scene file decides. Writing the scene file is the editorial work.

## 1. Write the scene file

`teasers/<slug>.yaml` (committed, so a teaser can be re-rendered). Start from an existing one, for example `teasers/software-that-knows-the-knowledge-model-as-grounding.yaml`.

- **Story:** 10 to 13 scenes, about 4 seconds each. Follow the post: the question or problem, the idea, how it works, the evidence (numbers), where to try it.
- **Captions:** at most two short lines, plain and factual, with numbers exactly as in the post. No claims the post does not make.
- **Highlight:** one element per scene: `{ text: '…' }` (a paragraph or list item containing the text), `{ kind: table|ul|li, text: '…' }`, `{ figure: <image file name part> }` or `{ selector: '…' }` on other pages.
- **Placement:** `at` scrolls the element to a fraction of the screen height (`top` keeps the page at the top); `captionAt` places the caption (fraction from the top), otherwise it goes to the half the element leaves free; `captionSide: left` for two-column pages.
- **Demo scenes:** `url`, a wider `width` (900 for the IMCI app), and `steps` (`click`, `clickText`, `wait`) to bring the page into the state to show. Use only what runs without API keys.
- **End card:** kicker ("Software that knows · Part N"), title, links, the disclaimer line.

## 2. Render

```
pnpm teaser <slug>
```

Needs Google Chrome and ffmpeg. Writes `.media/<slug>/teaser/`: `teaser.mp4`, one PNG per scene and `contact-sheet.png`. Look at every scene PNG: the highlight is the intended element, the caption does not hide it, and nothing is cut off. Adjust the scene file and render again. `--base http://localhost:4321` renders from the dev server before publication.

## 3. The LinkedIn post

Same shape as the earlier posts:

1. A question as the first line.
2. Two short paragraphs: the problem, then what the part shows, with its main result.
3. "Here it is in 50 seconds." (the video's length).
4. "Read part N:" and the post's URL.
5. Three hashtags, starting with #SoftwareArchitecture #KnowledgeManagement.

Neutral and factual, in the voice of the posts. The author publishes the post with the video; afterwards, add the post's URL as `linkedin` in the post's front matter.
