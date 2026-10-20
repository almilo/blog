---
title: 'Software that knows: the law is the specification'
description: 'A law, a short prompt and a goal it can check: a coding agent builds a working first draft. Review and acceptance make it owned and ready for production.'
pubDate: 2026-11-06
tags: ['software-that-knows', 'llm', 'ontology', 'coding-agents']
series: 'software-that-knows'
image: '/images/software-that-knows/first-process-below-minimum.png'
draft: true
---

*Part 12 of the series ["Software that knows"](https://almilo.com/series/software-that-knows/).*

## Recap

[Part 2](https://almilo.com/blog/software-that-knows-why-now/#what-didnt-change)
made a claim about effort: an LLM drafts about 80% of the knowledge in about
20% of the time, and people take the other 80% of the time for the last 20%:
exceptions, edge cases and unwritten rules. Review and acceptance stay with the
people who own the knowledge.

Parts 5 to 10 built applications on knowledge models that an agent helped to
write. But each of them started from something: a vocabulary for forms, a
generator, an earlier application, a person who knew the target. This part
tests the case with nothing to start from: the first process.

- **Code:** three runs, on three branches:
  [run 1](https://github.com/almilo/software-that-knows/tree/first-process-run-4),
  [run 2](https://github.com/almilo/software-that-knows/tree/first-process-run-5),
  [run 3](https://github.com/almilo/software-that-knows/tree/first-process-run-6)

The process is family allowances under Swiss federal law. The applications are
a demonstration, not legal advice, and not checked by a family compensation
fund.

## Why this matters

Most of the cost of business software is not in writing code. It is in finding
out what the code must do: interviews, requirements documents, tickets, and the
questions that come back when the code meets real cases. For a process under a
law, much of that work restates something that already exists. The law says who
is entitled, to what, from when, and until when. It is the specification,
written by people whose job is to make it precise.

Coding agents can now work for an hour on their own. What they need to work
well is a goal they can check themselves: a test that passes or fails. Without
one, "done" is the agent's opinion.

So the hypothesis of this part is short. **The law is the specification. A
frontier coding agent with a verifiable goal turns it into a result that is
good enough, with decisions that are suitable and visible.** That is the 80%.
Review and acceptance remain the other part, and they are what turns a good
draft into software that someone owns and can put into production.

## The experiment

The process: the federal family allowances for one child, from the Federal Act
on Family Allowances (FamZG), version of 1 January 2026. The child allowance
is at least CHF 215 a month, and the education allowance at least CHF 268.

Three runs of Claude Code, each in its own cloud session, started from an empty
branch, with no files, no memories, and no other context. Each got the same
prompt, and nothing else. A person looked at the results only after the runs.

```text
Task: build a small browser application for one process under Swiss law: the family
allowances for one child (child allowance and education allowance).

Source: the Federal Act on Family Allowances (FamZG), version of 1 January 2026:
https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2008/51/20260101/de/html/fedlex-data-admin-ch-eli-cc-2008-51-20260101-de-html-1.html

Scope: leave out cantonal amounts, children abroad, and several persons entitled for the
same child.

Architecture:
1. A knowledge model, one Turtle file, in W3C standards plus a small vocabulary of your
   own for what they cannot express. The questions are SHACL shapes. The rules are
   SHACL-SPARQL constraints, each with a message and its source.
2. A deterministic generator, with no LLM, that turns the model into the files the app
   needs. It knows the standards and the vocabulary, not the law.
3. A browser app that checks the answers against the model with an existing SHACL engine.

Behaviour:
- The app asks a question only when the model makes it relevant to the answers so far.
- The app updates the results after each answer.
- Each result is a refusal, a value or a next step, with its sources.

Requirements: Bun, React, JSON Forms.

Rules:
- All knowledge of the law is in the model. The generator and the app contain no word or
  number of the law; a test checks this by searching their code.
- If the law does not give a value that a rule needs, find it in an official source and
  cite it, or mark the rule as open.
- Mark every interpretation in the model.

Done when this happy path passes as an automated test, through the form data and the
SHACL engine:
  Answers: employed parent, annual income CHF 60,000; own child born 2009-03-10, in an
  apprenticeship since 2025-08-01; date of the application 2026-10-19.
  Expected: education allowance, at least CHF 268 a month, at the latest until
  2034-03-31, with FamZG Art. 3 para. 1 b and Art. 5 para. 2 as sources.

Report: list your interpretations, the open points, and the commands to run.
```

The prompt has 329 words, and each section has one job:

| Section | What it fixes | Part of the result |
| --- | --- | --- |
| Task, source, scope | Which process, which text, what to leave out | The content of the model |
| Architecture | Knowledge in a model, a generator, an app that knows neither | The structure ([part 5](https://almilo.com/blog/software-that-knows-from-guideline-to-application/#two-models)) |
| Behaviour | What a person sees | The app, and what the model must say |
| Requirements | The technology | The build |
| Rules | Where knowledge may live, and how to handle gaps | The model's sources, interpretations and open points |
| Done when | A goal the agent can check | The tests, and the end of the run |
| Report | What a reviewer gets | The summary of each run |

The prompt says what to build, not how. It does not explain the law, and it
does not name a single question or rule. The only facts of the law in it are
the scope and the expected result of one case.

## What came out

| | Run 1 | Run 2 | Run 3 |
| --- | --- | --- | --- |
| Time, cost | 21 min, USD 5.46 | 42 min, USD 9.29 | 25 min, USD 7.02 |
| Happy path | Passes | Passes | Passes |
| Questions, rules | 11, 12 | 11, 16 | 15, 16 (and 13 rules for when to ask) |
| Interpretations, open points | 12, 7 | 11, 6 | 14, 8 |
| Fields on the screen: empty, happy path | 1, 7 | 4, 7 | 2, 8 |
| Language of the app | English | German | English |
| Tests | 24 | 33 | 34 |

All three give the same result for the case in the prompt: an education
allowance of at least CHF 268 a month, from 2025-08-01, at the latest until
2034-03-31, with the two articles as sources. All three also give a next step:
give the application to the employer.

The more interesting test is a case that is not in the prompt. With an income
of CHF 5,000 a year instead of 60,000, the parent is below the minimum income
and counts as not gainfully employed (Art. 13 para. 3 and Art. 19 para. 1bis).
Then the taxable income matters, and only then. In all three applications, that
question appears at that moment, and not before:

![The application of run 1 with an income of CHF 5,000. Under Applicant, the questions about the taxable annual income and supplementary benefits have appeared below the income. On the right, two next steps: "Income below the minimum: counts as not gainfully employed", with the minimum annual earned income of CHF 7'560 and the original German text of FamZG Art. 13 para. 3 and Art. 19 para. 1bis as sources; and "Answer the next question: Taxable annual income (CHF)", with FamZG Art. 19 para. 2.](/images/software-that-knows/first-process-below-minimum.png)

## Claim 1: the law is enough as a specification

**Claim.** For a process under a law, the law and a short prompt are enough for
an agent to build a working first version. No requirements document, no
interviews, no examples beyond one case.

**Benefit.** The expensive step that
[part 2](https://almilo.com/blog/software-that-knows-why-now/#prior-work)
calls the knowledge acquisition bottleneck shrinks to under an hour, for less
than USD 10. A team starts from a draft that already works, not from a blank
page or a first meeting.

**Check.** Three runs of three pass the happy path through the form data and
the SHACL engine. Each reads the questions, the rules and their articles from
the law: who is entitled, which children count, the age limits, the minimum
income, the amounts. Each application asks only what the answers make
relevant, updates its results after each answer, and shows each result with
its article and the original German text.

**Limit.** One law, of about 40 articles, well structured. The FamZG is public,
so the agent may have seen it in training. A law that is longer, older or less
clear, or published after the agent's training, may give weaker drafts.

## Claim 2: a goal the agent can check makes the result converge

**Claim.** The runs do not agree on the model. They agree on the outcome,
because the prompt gives three things the agent can check without a person.

**Benefit.** The agent can work on its own until the goal is met, and a person
reviews a result that already passes, not one that might.

**Check.** The three goals:

1. **The happy path, as a test.** Each run wrote it and worked until it
   passed. The expected values come from the law, not from the agent.
2. **No law in the code, as a test.** Each run wrote a test that searches the
   generator and the app for words and numbers of the law. A separate search
   after the runs found none. This is the separation of
   [part 4](https://almilo.com/blog/software-that-knows-where-knowledge-sits/#the-knowledge-centric-approach-one-file):
   the knowledge is in one file, and the code does not know it. Part 10 made
   the same check on three applications
   ([claim 1](https://almilo.com/blog/software-that-knows-one-model-three-applications/#claim-1-the-knowledge-is-in-the-model-not-in-the-applications)).
3. **A deterministic generator.** Run twice, each generator writes the same
   files. The stochastic step is the model; everything after it is code, as in
   [part 5](https://almilo.com/blog/software-that-knows-from-guideline-to-application/#stochastic-and-deterministic).

**Limit.** What the goal does not test can vary, and it does. The models have
11 to 15 questions and 12 to 16 rules, with different names. The outcome is
repeatable; the model is not. One case is also a thin goal: the next section
shows what it leaves open.

## Claim 3: the decisions are suitable, and visible

**Claim.** Where the law is not explicit, the agent decides. The decisions are
suitable: an expert could have made them. And they are written in the model,
where a person can find them, not hidden in code.

**Benefit.** A reviewer reads a list of decisions with their reasons, not code.
The questions that need an owner are already found, as
[part 8](https://almilo.com/blog/software-that-knows-the-rule-nobody-owns/#where-ai-helps-and-where-it-doesnt)
argued: writing it down does not make the decision, but it shows what has to be
decided.

**Check.** Some decisions are the same in all three runs:

- **Ages.** The law says "until the end of the month in which the child
  completes the 25th year of age". All three read it as the 25th birthday, so
  the education allowance ends on 2034-03-31.
- **A value the law does not give.** The minimum income is "half the annual
  amount of the minimum full AHV old-age pension". The FamZG does not say what
  that pension is. All three found it, CHF 1,260 a month, in an official
  source, and cited it: CHF 7,560 a year. Two cross-checked the result with the
  Federal Social Insurance Office.
- **The date of the result.** The answers describe one moment, so the result is
  for the month of the application. All three marked this as an interpretation.

Some decisions differ, and each is defensible:

- **The income of a child in education.** A child who earns more than the
  maximum full AHV pension does not count as in education. That limit is not in
  the FamZG but in an ordinance. Run 1 marked it as an open point. Run 2 wrote
  the rule and switched it off, as open. Run 3 asks the question and adds a next
  step: confirm the child's income.
- **Counts as not gainfully employed.** Run 1 shows it as a next step: answer
  the questions about the taxable income. Runs 2 and 3 show it as a value.

![The application of run 3 at the end of the happy path. On the left, seven answers and one more question: does the child earn on average more than the maximum full AHV old-age pension a month? On the right, the value: education allowance, at least CHF 268 a month, from 2025-08-01 until the end of the education, but until 2034-03-31 at the latest, with FamZG Art. 3 para. 1 b and Art. 5 para. 2. Below, two next steps: give the application to your employer, and confirm that the child earns not more than CHF 2'520 a month, with AHVG Art. 34 para. 3, AHVV Art. 49bis para. 3 and the pension ordinances as sources.](/images/software-that-knows/first-process-happy-path.png)

The design converged too. Without a hint, each run added one term to its
vocabulary for when a question is asked: `askWhen`, `relevantIf`,
`RelevanceRule`. It is the same idea as
[step 13 of "What's in a field"](https://almilo.com/blog/software-that-knows-whats-in-a-field/#step-13-when-to-ask)
and as [part 7](https://almilo.com/blog/software-that-knows-from-a-diagram-to-a-decision/#it-asks-only-what-matters),
where the application asks only what can still change the result.

**Limit.** "Suitable" is a judgement on a sample, not a proof. Nobody from a
family compensation fund has read the models. A decision that looks reasonable
can still be wrong in law.

## Claim 4: review and acceptance bring ownership

**Claim.** The runs deliver the 80% of
[part 2](https://almilo.com/blog/software-that-knows-why-now/#what-didnt-change).
The other part is not more generation. It is review and acceptance by the
people who answer for the process, and it is what makes the software ready for
production.

**Benefit.** The work of the experts changes. They do not write
specifications, and they do not read code. They read one model, each rule with
its article, and decide on a short list: the interpretations, the open points,
and the places where the runs disagree.

**Check.** What the runs leave is exactly the kind of work that part 2
predicted:

| Left by the runs | Who closes it | How |
| --- | --- | --- |
| 11 to 14 interpretations in each model | The owner of the process | Accept, or correct, each one |
| 6 to 8 open points | The owner | Decide, or keep out of scope on purpose |
| Decisions that differ between runs | The owner | Pick one; the others become alternatives on record |
| Only one tested case | The experts | Write acceptance cases: the age limits, the minimum income, a stepchild, a foster child |
| A model nobody is accountable for | The organisation | Accept it, under a name |

The acceptance cases matter most. They fix the behaviour that the happy path
leaves open, so a new run, or a new version of the law, is checked against the
same cases. Once they pass and the owner has accepted the model, it is owned
knowledge, not a draft. Accountability stays with people: an agent cannot
answer for a decision about who gets an allowance.

**Limit.** The cost of this part is not measured here. If the review takes
longer than writing the model by hand, the 80/20 split does not hold.

## What it costs

| Part | Run 1 | Run 2 | Run 3 |
| --- | --- | --- | --- |
| Model and vocabulary (Turtle) | 1,024 lines | 1,215 lines | 1,690 lines |
| Generator | 392 | 326 | 275 |
| App | 454 | 430 | 502 |
| Tests | 427 | 482 | 397 |
| Time and cost of the run | 21 min, USD 5.46 | 42 min, USD 9.29 | 25 min, USD 7.02 |

Most of each model is the law: its articles with their original text, sources,
interpretations and open points. The generator and the app are small and know
none of it. For a second process, they could stay as they are,
as [part 9](https://almilo.com/blog/software-that-knows-one-app-two-diagrams/)
showed for a second domain in the same application, and
[part 10](https://almilo.com/blog/software-that-knows-one-model-three-applications/#claim-3-a-new-domain-needs-only-its-model)
for three processes under three laws.

## How we'd know it's wrong

- A run passes the goal with a reading of the law that an expert rejects.
- The variance between runs grows with the size of the law, until no run is a
  useful start.
- Reviewing a generated model takes longer than writing one.
- The runs do much worse on a law published after the agent's training.
- Experts find more unsuitable decisions than suitable ones.

---

*The ideas and arguments in this article are my own. An AI assistant (Claude)
helped with drafting, editing and fact-checking, and Claude Code made the three
runs. The applications are readings of Swiss federal law by a coding agent, not
legal advice.*
