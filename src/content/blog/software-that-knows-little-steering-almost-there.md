---
title: 'Software that knows: little steering, almost there'
description: 'A reference, a short prompt and a goal it can check: a coding agent gets almost there, and a final review takes it the rest of the way.'
pubDate: 2026-11-06
tags: ['software-that-knows', 'llm', 'coding-agents', 'ontology']
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
starts from nothing, and asks where the 80% actually comes from.

- **Code:** three runs, on three branches:
  [run 1](https://github.com/almilo/software-that-knows/tree/first-process-run-4),
  [run 2](https://github.com/almilo/software-that-knows/tree/first-process-run-5),
  [run 3](https://github.com/almilo/software-that-knows/tree/first-process-run-6)

The example is a process under Swiss federal law. The applications are a
demonstration, not legal advice, and not checked by anyone who runs the
process.

## Where the magic happens

No single ingredient is new. What works is putting all of them together, so
that each step of the pipeline has what it needs and nothing more:

1. **An outcome, with its proof.** Not a list of features, but what we want:
   something that works. And a way to show that it works: an acceptance test for
   at least the one scenario that sets the goal. The agent can run it itself, so
   "done" is not its opinion.
2. **Directives for the architecture.** The technologies to use, and the type
   of application: here, a form that asks only the relevant questions and shows
   its results with their sources. It could as well be a multi-step form or a
   wizard. These are decisions we want to keep, so we make them in advance.
3. **A source, as the reference.** A document that can serve as a specification, without being
   complete or perfect: a law, a guideline, a policy, an SOP. Here, a law.
4. **A method.** How to turn the source into software: formalise the knowledge
   as a model in open standards, an ontology, with each rule and its source;
   keep the code free of that knowledge; mark every interpretation. This is the
   approach of this series, given to the agent in a few lines.
5. **Freedom, for a capable agent.** Nothing about how to read the source, which
   questions to ask, or how to write the generator. A frontier coding agent
   fills that space itself, and works until the test passes.

Together, they make a pipeline. The source goes in, the method turns it into a
knowledge model, a generator turns the model into an application of the type
we asked for, and the acceptance test checks the outcome. Each ingredient
steers one step, and none of them is long: the prompt below has 329 words.

![Two panels. The upper panel, "The pipeline: five ingredients, each steers one step", shows five boxes from left to right: Source (ingredient 3: the reference, not perfect), Coding agent (ingredient 5: with freedom), Knowledge model (requirements and decisions), Generator (deterministic, written by the agent, frozen) and Application (no knowledge of the source). Ingredient 4, "A method: ontology, sources", points down to the coding agent. Ingredient 2, "Directives for the architecture: technologies, type of application", points down to the generator and the application. Below the application, ingredient 1, "Outcome: acceptance test", checks the application, and an arrow back to the coding agent says "the agent works until the test passes". The lower panel, "The effort", compares two bars on a time axis. Before: one long bar, "Specify, then implement: weeks to months". Now: a short bar with a thin segment, "Agent: 20 to 40 minutes, about 80% of the result", and a wider one, "Review and acceptance: a few hours, about 4 times more". Illustrative, not to scale.](/images/software-that-knows/little-steering-pipeline.png)

That is enough to get a working application in less than an hour: the 80%.
It is not 100%, and the gap does not close by running the agent again. The last 20% is review and acceptance, and only people can do
it, because only people can own the result.

What the agent delivers has two parts, and the difference between them is the
key to the last 20%:

- **Requirements.** What the reference says, written into the model with the
  place it comes from. A reviewer can check each one against the source.
- **Decisions.** What the reference does not say, or says unclearly, and the
  agent decided for us: an interpretation, a value from another source, a
  question to add or to leave out, a point left open. Nobody asked for these
  decisions one by one. The agent made them because the application could not
  work without them.

The agent also writes the code that turns the model into the application. That
code is reviewed once and then frozen: what the agent did stochastically
becomes a deterministic step that runs the same way every time.

The rest of this part shows each of these steps in one experiment.

## The experiment

The reference: the Federal Act on Family Allowances (FamZG), version of
1 January 2026. It is public, versioned and citable, which makes the
experiment repeatable. The process: the federal child allowance and education
allowance for one child.

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

Each part of the prompt is one of the ingredients:

| Ingredient | In the prompt | What it controls |
| --- | --- | --- |
| An outcome, with its proof | Task; done when | What "working" means, and when the agent stops |
| Directives for the architecture | Architecture 2 and 3; behaviour; requirements | The type of application and its technology |
| A source | Source; scope | The content: every requirement comes from here |
| A method | Architecture 1; rules | Knowledge in a model with its sources, code without it ([part 5](https://almilo.com/blog/software-that-knows-from-guideline-to-application/#two-models)), decisions marked |
| Freedom | Everything the prompt leaves out | The questions, the rules, the vocabulary, the generator |

The rules of the method matter most for the last 20%. Without "mark every
interpretation", the agent still makes the decisions, but they disappear into
the model or the code.

## The 80%

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

The goal was one case, but the applications do more. With an income of
CHF 5,000 a year instead of 60,000, the parent is below the minimum income and
counts as not gainfully employed. Then the taxable income matters, and only
then. In all three applications, that question appears at that moment, and
not before:

![The application of run 1 with an income of CHF 5,000. Under Applicant, the questions about the taxable annual income and supplementary benefits have appeared below the income. On the right, two next steps: "Income below the minimum: counts as not gainfully employed", with the minimum annual earned income of CHF 7'560 and the original German text of FamZG Art. 13 para. 3 and Art. 19 para. 1bis as sources; and "Answer the next question: Taxable annual income (CHF)", with FamZG Art. 19 para. 2.](/images/software-that-knows/first-process-below-minimum.png)

The models do not agree with each other: 11 to 15 questions, 12 to 16 rules,
different names. The outcome repeats because the goal is fixed, not because
the agent is. What the goal does not test can vary, and it does.

## Requirements: what the reference says

Most of each model is requirements. Each rule names the article it comes from;
run 3 also keeps the original German text of the 28 provisions it cites, and
shows it next to each result. Who is entitled, which children count, the age
limits, the minimum income, the amounts: each is in the model once, with its
source.

A requirement is easy to review. The reviewer opens the article and compares.
If the model says "at least CHF 268 a month" and Art. 5 para. 2 says "mindestens
268 Franken pro Monat", the requirement is accepted. This is the work that
[part 5](https://almilo.com/blog/software-that-knows-from-guideline-to-application/#stochastic-and-deterministic)
described as accepting the model "rule by rule, against the source".

## Decisions: what the agent decided for us

The reference is not complete. The law refers to other acts, uses terms it
does not define, and leaves cases open. The agent had to decide each of these
to make the application work. Some decisions are the same in all three runs:

- **Ages.** The law says "until the end of the month in which the child
  completes the 25th year of age". All three read it as the 25th birthday, so
  the education allowance ends on 2034-03-31.
- **A value the law does not give.** The minimum income is "half the annual
  amount of the minimum full AHV old-age pension". The FamZG does not say what
  that pension is. All three found it, CHF 1,260 a month, in an official
  source, and cited it: CHF 7,560 a year. Two cross-checked the result with the
  Federal Social Insurance Office.
- **The date of the result.** The answers describe one moment, so the result is
  for the month of the application.

Some decisions differ, and each is defensible:

- **The income of a child in education.** A child who earns more than the
  maximum full AHV pension does not count as in education. That limit is in an
  ordinance, not in the FamZG. Run 1 marked it as an open point. Run 2 wrote
  the rule and switched it off, as open. Run 3 asks the question and adds a next
  step: confirm the child's income.
- **Counts as not gainfully employed.** Run 1 shows it as a next step: answer
  the questions about the taxable income. Runs 2 and 3 show it as a value.

![The application of run 3 at the end of the happy path. On the left, seven answers and one more question: does the child earn on average more than the maximum full AHV old-age pension a month? On the right, the value: education allowance, at least CHF 268 a month, from 2025-08-01 until the end of the education, but until 2034-03-31 at the latest, with FamZG Art. 3 para. 1 b and Art. 5 para. 2. Below, two next steps: give the application to your employer, and confirm that the child earns not more than CHF 2'520 a month, with AHVG Art. 34 para. 3, AHVV Art. 49bis para. 3 and the pension ordinances as sources.](/images/software-that-knows/first-process-happy-path.png)

There are also decisions about the design. Without a hint, each run added one
term to its vocabulary for when a question is asked: `askWhen`, `relevantIf`,
`RelevanceRule`. It is the same idea as
[step 13 of "What's in a field"](https://almilo.com/blog/software-that-knows-whats-in-a-field/#step-13-when-to-ask)
and as [part 7](https://almilo.com/blog/software-that-knows-from-a-diagram-to-a-decision/#it-asks-only-what-matters),
where the application asks only what can still change the result.

The decisions are suitable: an expert could have made each of them. But they
are the agent's, not ours. Each run marked 11 to 14 interpretations and 6 to 8
open points, because the prompt asked for it. That list is the most valuable
thing the agent produces, because it is the list of what someone has to decide.
As [part 8](https://almilo.com/blog/software-that-knows-the-rule-nobody-owns/#where-ai-helps-and-where-it-doesnt)
put it, writing it down does not make the decision, but it shows what has to be
decided.

## The 20%: review and acceptance

The agent cannot close the gap, because the gap is not missing work. It is
missing ownership. An agent cannot answer for a decision about who gets an
allowance ([part 2](https://almilo.com/blog/software-that-knows-why-now/#what-didnt-change)).
The people who run the process have to make the agent's work their own:

| Left by the agent | What people do |
| --- | --- |
| Requirements, each with its source | Check each against the reference, and accept it |
| Decisions: interpretations, values from other sources | Accept, correct or replace each one |
| Open points | Decide, or keep out of scope on purpose |
| Decisions that differ between runs | Pick one; the others stay on record as alternatives |
| One tested case | Write acceptance cases: the age limits, the minimum income, a stepchild, a foster child |
| A model nobody answers for | Accept it, under a name |

The acceptance cases fix what the one case in the prompt left open. A new run,
or a new version of the reference, is then checked against them. When they
pass and the owner has accepted every requirement and every decision, the
model is owned knowledge, and ready for production. The next part goes through
this review.

## Compiled AI: freeze what the agent built

The agent did not only write the model. It also wrote the generator and the
application, 275 to 392 lines of generator and 430 to 502 lines of app in each
run, and a test that shows that neither contains the law.

One could ask an agent to build the application again for every change in the
reference. Each build would be a new stochastic result, and each would need a
new review. The alternative is sometimes called compiled AI: let the agent
write the implementation once, review it, polish it, and freeze it. From then
on, a deterministic generator turns any model into an application, the same way
every time. The agent's stochastic work becomes a deterministic step, as in
[part 5](https://almilo.com/blog/software-that-knows-from-guideline-to-application/#stochastic-and-deterministic).

The three runs show both the value and the need for review:

- **Frozen, it is deterministic.** Run twice, each generator writes the same
  files.
- **It does not know the process.** A separate search found no word or number
  of the law in any generator or app. So the same generator can serve the next
  process, as
  [part 9](https://almilo.com/blog/software-that-knows-one-app-two-diagrams/)
  showed for a second domain and
  [part 10](https://almilo.com/blog/software-that-knows-one-model-three-applications/#claim-3-a-new-domain-needs-only-its-model)
  for three processes under three laws.
- **It needs polish before it is frozen.** Run 2 takes about a second for each
  check, because its SHACL engine starts a new SPARQL engine for every query.
  Run 3 found the same problem and patched the engine. Only two runs write
  numbers in the Swiss format. And each run invented its own vocabulary: to
  freeze one, someone has to choose it.

So the review in the last 20% has two objects: the model, which holds the
knowledge, and the generator, which is reviewed once and then reused.

## The effort

[Part 2](https://almilo.com/blog/software-that-knows-why-now/#what-changed)
compared two ways to get formal knowledge into software. Before: specialists
interview experts, someone writes a specification, and developers implement
it, over weeks or months. With LLMs: a draft in a fraction of that time, then a
review by the people who own the knowledge. The lower half of the diagram above
shows the same comparison with the numbers of this part.

**The 80% took almost no time.** Each run took 21 to 42 minutes and cost USD 5
to 10, with no person involved. The result was a working application, a
knowledge model with its sources, a generator and the tests:

| Part | Run 1 | Run 2 | Run 3 |
| --- | --- | --- | --- |
| Model and vocabulary (Turtle) | 1,024 lines | 1,215 lines | 1,690 lines |
| Generator | 392 | 326 | 275 |
| App | 454 | 430 | 502 |
| Tests | 427 | 482 | 397 |
| Time and cost of the run | 21 min, USD 5.46 | 42 min, USD 9.29 | 25 min, USD 7.02 |

**The 20% takes longer.** Someone has to check 12 to 16 rules against
their articles, decide on 11 to 14 interpretations and 6 to 8 open points,
choose where the runs differ, write the acceptance cases, and review the
generator before it is frozen. Even when this is streamlined, it takes a couple
of iterations: some hours of meetings with the people who run the process, or
of focused work. That is about four times the time the agent took, which is the
split part 2 predicted: about 20% of the time for the draft, about 80% for the
review.

**The whole is still much less.** The review is the larger part of the new
effort, but the new effort is hours, where specifying and implementing the same
process used to take weeks. That was the claim of part 2: even with review,
the total effort is a fraction of what it used to be. The review effort here is
an estimate, not a measurement. The next part goes through the review and
measures it.

## Limits

- One reference, of about 40 articles, well structured.
- The FamZG is public, so the agent may have seen it in training.
- One tested case. Nobody who runs the process has read the models.
- The effort of the review is an estimate; the next part measures it.
- "Suitable" is a judgement on a sample, not a proof: a decision that looks
  reasonable can still be wrong in law.

## How we'd know it's wrong

- A run passes the goal with a reading of the reference that an expert
  rejects.
- Reviewing the requirements and decisions takes longer than writing the model
  by hand.
- The variance between runs grows with the size of the reference, until no run
  is a useful start.
- The runs do much worse on a reference published after the agent's training.
- A frozen generator needs changes for each new process.

---

*The ideas and arguments in this article are my own. An AI assistant (Claude)
helped with drafting, editing and fact-checking, and Claude Code made the three
runs. The applications are readings of Swiss federal law by a coding agent, not
legal advice.*
