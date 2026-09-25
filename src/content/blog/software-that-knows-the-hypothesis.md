---
title: 'Software that knows: the hypothesis'
description: 'Business applications keep business knowledge implicit in code. A hypothesis: make it explicit and put it at the centre of the software.'
pubDate: 2026-09-24
tags: ['software-that-knows', 'business-applications', 'knowledge-management']
draft: false
series: 'Software that knows'
image: '/images/software-that-knows/code-vs-knowledge-centric.png'
---

*Part 1 of the series "Software that knows".*

## The problem

Organisations keep spending more on IT: Gartner
[forecasts](https://www.gartner.com/en/newsroom/press-releases/2026-07-27-gartner-forecasts-worldwide-it-spending-to-grow-14-point-2-percent-in-2026-totaling-6-point-37-trillion)
worldwide IT spending of $6.37 trillion in 2026, up 14.2% on 2025. But the
return they perceive doesn't grow at the same rate. This isn't a new
observation: in 1987 Robert Solow noted that computers showed up everywhere
except in the productivity statistics. Economists still debate why.

This series looks at one possible cause in business applications, the
internal systems organisations run on, as opposed to consumer apps.

## The diagnosis

**1. Knowledge is buried in code.**

- Business rules are usually implicit, spread across the codebase.
- Software engineers can read them. The domain experts who own the rules
  usually can't inspect, question or reuse them directly.
- When the engineers who wrote the code leave, much of that knowledge leaves
  with them.

**2. We build the surface.**

- A business application is typically designed as tables plus forms.
- We model the screens rather than the work.
- We rarely know how users actually use those screens, or what for.
- The result: the software records *what* happened, but holds little about
  *why*.

## Why the usual fix doesn't help

- Legacy replacements often keep the paradigm and change only the technology.
- The implicit knowledge is migrated, not captured.
- The same limits come back at a new cost, so the return is unlikely to
  improve.

## Tried before

Expert systems in the 1980s and model-driven development in the 2000s aimed at
something similar. Both stalled, in large part because formalising knowledge
was slow and expensive: the knowledge acquisition bottleneck. Why that has
changed is the subject of the
[next article](https://almilo.com/blog/software-that-knows-why-now/).

## The hypothesis

![Two diagrams side by side. Code-centric, current practice: a UI of tables and forms on top of code with business rules scattered through it, on top of a database. Knowledge-centric, the hypothesis: formal, explicit knowledge at the centre, with UI, code, agents and experts connected to it.](/images/software-that-knows/code-vs-knowledge-centric.png)

If we capture an organisation's knowledge, make it formal and explicit, and
put it at the centre of the software, with code and UI derived from it or
serving it, we expect:

- **Returns that compound**, because knowledge is reused instead of
  re-implemented.
- **Faster business change**, because rules are changed in one place, by the
  people who own them.
- **Cheaper platform changes**, because the knowledge is kept and only the
  implementation is replaced.
- **Knowledge agents can use**: explicit rules instead of guesses from code
  and screens.

## How we'd know it's wrong

- Formalising costs more than it saves.
- The knowledge is too tacit, or changes too fast, to capture.
- Knowledge-centred systems go stale just like code does.

---

*The ideas and arguments in this article are my own. An AI assistant (Claude)
helped with drafting, editing and fact-checking.*
