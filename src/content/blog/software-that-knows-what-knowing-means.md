---
title: 'Software that knows: what knowing means'
description: 'Data, information, knowledge, understanding and wisdom: what it means for software to know, from raw bits to judgement.'
pubDate: 2026-09-26
tags: ['software-that-knows', 'dikw', 'knowledge-management']
draft: true
series: 'Software that knows'
image: '/images/software-that-knows/what-knowing-means.png'
---

*Part 3 of the series "Software that knows".*

## Knows what?

The series is called *Software that knows*, so it owes a definition of
knowing. Data, Information, Knowledge, Understanding and Wisdom are often used
as synonyms. They aren't.

A useful model is the DIKW hierarchy, popularised by Russell Ackoff in 1989.
His version has five levels (many later versions drop Understanding and keep
four), and each one adds context to the level below. One example runs through
all of them.

## Data

`01000010 00011010 00000000 00000000`

Just bits. Read as a 32-bit floating-point number, they are 38.5. Read as an
integer, they are 1,109,000,192.

Data is symbols without context. On its own, it answers nothing.

## Information

*Body temperature of patient X at 08:00: 38.5 °C.*

Information is Data with context. In this example, it answers **what** was
measured, of **whom** and **when**.

## Knowledge

*Above about 38 °C, a body temperature is usually considered a fever.*

Knowledge is a pattern learned from many cases. It answers **how** things
behave.

## Understanding

*Fever is the body's response to infection: a signal, not the problem itself.
A newborn's immune system is immature and chemotherapy suppresses it, so in
those patients an infection can escalate quickly.*

Understanding is Knowledge of causes. It answers **why**.

## Wisdom

*The right treatment depends on the patient. For a healthy adult, rest, fluids
and monitoring are usually enough. For a newborn or a patient on chemotherapy,
the same 38.5 °C needs immediate medical attention.*

Wisdom is Understanding applied with judgement and values. It answers **what
to do** in this situation. (An illustration, not medical advice.)

## The steps between the levels

The levels are results. What moves from one to the next is reasoning:

- **Data → Information:** decode and add context.
- **Information → Knowledge:** generalise from many cases.
- **Knowledge → Understanding:** explain causes.
- **Understanding → Wisdom:** judge, weighing values and consequences.

LLMs make these steps much cheaper, especially the lower ones. Whether that
counts as reasoning is debated; the effect is not. With formalised Knowledge,
agents can take the top step too and suggest a treatment. The decision, and
the accountability for it, stays with people, as argued in
[part 2](https://almilo.com/blog/software-that-knows-why-now/).

![Five levels stacked like a staircase, each with the fever example. Data: 01000010 00011010. Information: 38.5 °C, patient X, 08:00. Knowledge: above about 38 °C is a fever. Understanding: fever is a response to infection. Wisdom: what to do depends on the patient. Arrows between the levels are labelled decode and add context, generalise, explain causes, and judge. Knowledge and Understanding are marked as made explicit in software that knows; Wisdom is marked as suggested by agents, decided by people.](/images/software-that-knows/what-knowing-means.png)

## So, knows what?

- Business applications store Data and present Information well.
- Knowledge is buried in code: `if temperature > 38 then fever`.
- Understanding (why the rule exists) and Wisdom (when it applies) mostly live
  in people's heads.
- Applying Knowledge needs facts about the case at hand: observations, such
  as the patient's age or current treatment.

*Software that knows* means Knowledge made explicit, together with as much of
the Understanding behind it as can be written down, applied to observations.
Agents can then suggest at the level of Wisdom too; people decide.

---

*The ideas and arguments in this article are my own. An AI assistant (Claude)
helped with drafting, editing and fact-checking.*
