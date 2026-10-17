---
title: 'Software that knows: thirteen practices'
description: 'The series so far as a reference: thirteen practices, each with the problem it solves and the article that shows it working.'
pubDate: 2026-11-03
tags: ['software-that-knows', 'ontology', 'architecture']
series: 'software-that-knows'
draft: true
---

*Part 12 of the series ["Software that knows"](https://almilo.com/series/software-that-knows/).*

## How to use this page

Eleven parts and two companion posts have built applications on knowledge models:
a clinical form, a decision tool, a model choice, and four processes under
Swiss law, on several technologies. Along the way, the same practices came back
again and again.

This page lists them. Each one has three parts:

- **Problem:** what goes wrong without it, and for whom.
- **Practice:** what to do instead, in one or two sentences.
- **Shown in:** the sections of the series where it works, with the code.

Read it from top to bottom, or jump to the problem you have.

| # | Practice | The problem it solves |
| --- | --- | --- |
| 1 | [Rules in a model, not in code](#1-rules-in-a-model-not-in-code) | Rules that nobody but developers can find |
| 2 | [Facts, questions and opinions apart](#2-facts-questions-and-opinions-apart) | Knowledge that cannot be reviewed piece by piece |
| 3 | [An LLM drafts, people decide](#3-an-llm-drafts-people-decide) | Formalising that is too slow, or has no owner |
| 4 | [Write down what is there, conflicts included](#4-write-down-what-is-there-conflicts-included) | Decisions made silently by whoever writes the code |
| 5 | [Grow by adding, not by changing](#5-grow-by-adding-not-by-changing) | Model changes that break the applications |
| 6 | [Generate the software, review the diff](#6-generate-the-software-review-the-diff) | Model changes with unknown effects |
| 7 | [A new process is a file, not an application](#7-a-new-process-is-a-file-not-an-application) | One application to build for each process |
| 8 | [Shared knowledge, written once](#8-shared-knowledge-written-once) | Copies of a rule that drift apart |
| 9 | [Behaviour derived from the rules](#9-behaviour-derived-from-the-rules) | Long forms and unexplained decisions |
| 10 | [AI at the edges, grounded](#10-ai-at-the-edges-grounded) | AI answers that nobody can check |
| 11 | [Verify the model, not only the code](#11-verify-the-model-not-only-the-code) | Gaps and conflicts that reach users silently |
| 12 | [The same decision on every technology](#12-the-same-decision-on-every-technology) | Migrations that cannot show they decide the same |
| 13 | [Know the limits](#13-know-the-limits) | Clean checks taken for correct knowledge |

## Where the knowledge lives

### 1. Rules in a model, not in code

**Problem.** Business rules are spread over code, databases, procedures and
people's heads. Each change of a rule, or of the technology, means finding them
again in the code. The experts who own the rules cannot read them there, and
when the developers leave, the rules leave with them.

**Practice.** Write the rules in one formal, explicit model, next to what they
mean. Every rule names where it comes from and who owns it. The software reads
the model, or is generated from it. The application then becomes a means to an
end: it can be replaced, or a second one added on another technology, without
writing the rules again, and each technology can be chosen for what it is good
at.

**Shown in:**
[Part 1 › The diagnosis](https://almilo.com/blog/software-that-knows-the-hypothesis/#the-diagnosis) ·
[Part 4 › The knowledge-centric approach](https://almilo.com/blog/software-that-knows-where-knowledge-sits/#the-knowledge-centric-approach-one-file) ·
[Part 5 › Two models](https://almilo.com/blog/software-that-knows-from-guideline-to-application/#two-models) ·
[Part 10 › Why this matters](https://almilo.com/blog/software-that-knows-one-model-three-applications/#why-this-matters) ·
[Part 10 › Claim 1: the knowledge is in the model](https://almilo.com/blog/software-that-knows-one-model-three-applications/#claim-1-the-knowledge-is-in-the-model-not-in-the-applications) ·
[Part 10 › Each application, in its own idiom](https://almilo.com/blog/software-that-knows-one-model-three-applications/#each-application-in-its-own-idiom)

### 2. Facts, questions and opinions apart

**Problem.** A source mixes facts with an author's judgement. Mixed together,
they cannot be reviewed by the right people, carry their own licence, or be
replaced one at a time: changing the opinion means touching the facts.

**Practice.** Keep the facts, the questions about a situation, and the rules
that decide in separate files, joined by names. Shared knowledge goes into
modules that each process imports.

**Shown in:**
[Part 7 › Three kinds of knowledge](https://almilo.com/blog/software-that-knows-from-a-diagram-to-a-decision/#three-kinds-of-knowledge) ·
[Part 10 › The model](https://almilo.com/blog/software-that-knows-one-model-three-applications/#the-model)

## Capturing knowledge

### 3. An LLM drafts, people decide

**Problem.** Formalising knowledge used to be too slow and too expensive: expert
systems and model-driven development stalled on it. A model that nobody reviews
has a different problem: when it is wrong, nobody answers for it, and it fails
any compliance check.

**Practice.** Let an agent write the first draft from the documents, with its
sources. The people who own the knowledge review it, correct it and accept it.
They stay accountable; the agent does not.

**Shown in:**
[Part 2 › What changed](https://almilo.com/blog/software-that-knows-why-now/#what-changed) ·
[Part 2 › What didn't change](https://almilo.com/blog/software-that-knows-why-now/#what-didnt-change) ·
[Part 5 › How LLMs make this feasible](https://almilo.com/blog/software-that-knows-from-guideline-to-application/#how-llms-make-this-feasible) ·
[Part 8 › Where AI helps, and where it doesn't](https://almilo.com/blog/software-that-knows-the-rule-nobody-owns/#where-ai-helps-and-where-it-doesnt) ·
[Part 11 › The 20%: review and acceptance](https://almilo.com/blog/software-that-knows-where-the-magic-happens/#the-20-review-and-acceptance)

### 4. Write down what is there, conflicts included

**Problem.** Sources disagree, leave terms undefined, or contain errors. Code
cannot keep a contradiction, so the developer, or the coding agent, picks one
reading. Nobody with the authority to decide made that decision, the code does
not say it was made, and a month later it is "the system".

**Practice.** Transcribe the source as it is. Record disagreements as claims,
with their authors, and corrections as readings, with their reasons. Add checks
that report what is missing (an owner, a source, a definition), so the open
points become questions for named people.

**Shown in:**
[Part 8 › Writing it down instead](https://almilo.com/blog/software-that-knows-the-rule-nobody-owns/#writing-it-down-instead) ·
[Part 9 › Write down what is drawn](https://almilo.com/blog/software-that-knows-one-app-two-diagrams/#write-down-what-is-drawn) ·
[Part 9 › Two readings, recorded](https://almilo.com/blog/software-that-knows-one-app-two-diagrams/#two-readings-recorded) ·
[Part 11 › Decisions: what the agent decided for us](https://almilo.com/blog/software-that-knows-where-the-magic-happens/#decisions-what-the-agent-decided-for-us)

### 5. Grow by adding, not by changing

**Problem.** A model that changes what it already says breaks every application
that reads it. Each improvement then needs a coordinated release.

**Practice.** Grow the model by adding statements: a definition, a source, a
unit, a translation, a rule. The generator reads what it knows and ignores the
rest, and it grows in the same way, by adding mappings.

**Shown in:**
[What's in a field › The build-up at a glance](https://almilo.com/blog/software-that-knows-whats-in-a-field/#the-build-up-at-a-glance) ·
[From statements to a working form › What the generator ignores](https://almilo.com/blog/software-that-knows-from-statements-to-a-working-form/#what-the-generator-ignores-and-how-it-grows)

## From the model to the software

### 6. Generate the software, review the diff

**Problem.** When a model drives an application, a small change to the model can
change the application in ways nobody sees. A change that nobody can see cannot
be reviewed.

**Practice.** Keep two models: the knowledge model for the domain, and an
application model for the software, generated from it in standard formats. Keep
the generated files in version control, so each change to the knowledge shows,
in the same review, what changes in the application.

**Shown in:**
[Part 5 › Two models](https://almilo.com/blog/software-that-knows-from-guideline-to-application/#two-models) ·
[From statements to a working form › Why generate](https://almilo.com/blog/software-that-knows-from-statements-to-a-working-form/#why-generate-and-not-read-the-model-at-run-time) ·
[Part 11 › Freeze what the agent built](https://almilo.com/blog/software-that-knows-where-the-magic-happens/#freeze-what-the-agent-built)

### 7. A new process is a file, not an application

**Problem.** Each new process, product or regulation becomes a new application
to build, test and maintain. The cost grows with the number of processes, not
with what is new in them.

**Practice.** Write one generic application that knows only a small vocabulary,
such as a question, a rule and a finding. A new process is then a new model in
that vocabulary, and every application that runs the vocabulary offers it.

**Shown in:**
[Part 9 › One application, two domains](https://almilo.com/blog/software-that-knows-one-app-two-diagrams/#one-application-two-domains) ·
[Part 10 › Claim 3: a new domain needs only its model](https://almilo.com/blog/software-that-knows-one-model-three-applications/#claim-3-a-new-domain-needs-only-its-model)

### 8. Shared knowledge, written once

**Problem.** The same rule, for example the written consent of a spouse, is
needed by several processes. Copied into each one, the copies drift apart, and
a change in the law needs a change in every copy.

**Practice.** Put what several processes need into shared modules, and let each
process import them. To reuse a model written in other words, map its words to
yours (`rdfs:subClassOf`, `rdfs:subPropertyOf`) instead of editing it.

**Shown in:**
[Part 9 › Mapping, not rewriting](https://almilo.com/blog/software-that-knows-one-app-two-diagrams/#mapping-not-rewriting) ·
[Part 10 › Claim 2: the parts are reused, not copied](https://almilo.com/blog/software-that-knows-one-model-three-applications/#claim-2-the-parts-are-reused-not-copied)

### 9. Behaviour derived from the rules

**Problem.** Forms ask every question, even those that cannot change the
result. Decisions come without reasons, so people do not trust them, and there
is no record to audit later.

**Practice.** Compute the behaviour from the rules: ask only the questions whose
answer can still change the outcome, explain a decision with the rule and the
answers that led to it, and write the decision down as a record.

**Shown in:**
[Part 7 › It asks only what matters](https://almilo.com/blog/software-that-knows-from-a-diagram-to-a-decision/#it-asks-only-what-matters) ·
[Part 7 › It says why](https://almilo.com/blog/software-that-knows-from-a-diagram-to-a-decision/#it-says-why) ·
[Part 7 › It leaves a record](https://almilo.com/blog/software-that-knows-from-a-diagram-to-a-decision/#it-leaves-a-record)

### 10. AI at the edges, grounded

**Problem.** An LLM in the middle of a decision gives answers that may name
fields that do not exist, values that are not allowed, or facts that the input
never stated. Nobody can check them, and nobody can stand behind them.

**Practice.** Use AI where input is unstructured, such as a note in free text,
and let deterministic rules decide. Ground the AI in the model: its answers must
name a field and an allowed value, fit the structure of the form, and quote
their evidence, and code checks all three.

**Shown in:**
[Part 5 › Stochastic and deterministic](https://almilo.com/blog/software-that-knows-from-guideline-to-application/#stochastic-and-deterministic) ·
[Part 6 › Words: copied by code, extended by an agent](https://almilo.com/blog/software-that-knows-the-knowledge-model-as-grounding/#words-copied-by-code-extended-by-an-agent) ·
[Part 6 › Grounding](https://almilo.com/blog/software-that-knows-the-knowledge-model-as-grounding/#grounding-generated-from-the-same-model)

## Checking the model

### 11. Verify the model, not only the code

**Problem.** A gap (a situation with no answer) or a conflict (a situation with
two) reaches users silently. A rule order such as "the first rule that applies
decides" hides conflicts: one rule always wins, and the other is never seen.

**Practice.** When the answers are finite, test every situation. Check the
structure of the model, such as one branch for each answer, and its behaviour,
such as exactly one outcome for each situation. Look for overlaps while ignoring
the order of the rules.

**Shown in:**
[Part 7 › It is tested in every situation](https://almilo.com/blog/software-that-knows-from-a-diagram-to-a-decision/#it-is-tested-in-every-situation) ·
[Part 9 › Two kinds of checks](https://almilo.com/blog/software-that-knows-one-app-two-diagrams/#two-kinds-of-checks) ·
[Part 9 › The order hides conflicts](https://almilo.com/blog/software-that-knows-one-app-two-diagrams/#the-order-hides-conflicts)

### 12. The same decision on every technology

**Problem.** The hardest part of replacing an application is to show that the
new one decides as the old one did. Without that proof, a migration is a risk,
and many systems stay on old technology for that reason. Even two applications
that decide the same can show different amounts to the same person.

**Practice.** Keep shared test cases next to the model: answers, and the
decision they must give, including how its values are written. Every
application, on every technology, must pass them before it is done.

**Shown in:**
[Part 10 › Claim 4: every application decides the same](https://almilo.com/blog/software-that-knows-one-model-three-applications/#claim-4-every-application-decides-the-same) ·
[Part 10 › Claim 5: every application writes the same](https://almilo.com/blog/software-that-knows-one-model-three-applications/#claim-5-every-application-writes-the-same)

### 13. Know the limits

**Problem.** A model that passes every check can still be wrong about its
source, and an AI that scores well on the examples it was tuned on can do worse
on new ones. Clean results are easily taken for correct knowledge.

**Practice.** Treat checks as proof of consistency, not of correctness: only a
person who knows the source can review the model against it. Measure on cases
kept apart from the ones used for tuning. And state, for each result, what would
prove it wrong.

**Shown in:**
[Part 6 › How they compare](https://almilo.com/blog/software-that-knows-the-knowledge-model-as-grounding/#how-they-compare) ·
[Part 9 › Two readings, recorded](https://almilo.com/blog/software-that-knows-one-app-two-diagrams/#two-readings-recorded) ·
[Part 10 › Claim 4](https://almilo.com/blog/software-that-knows-one-model-three-applications/#claim-4-every-application-decides-the-same) ·
the last section of every part

## How the practices fit together

The practices depend on each other. Rules in a model (1) are what an agent can
draft and people can review (3), and what checks can verify (11). A model that
grows by adding (5) is what a generator can follow (6), and a small vocabulary
is what lets one application run many processes (7) and many applications run
one model (12). Grounding (10) and derived behaviour (9) both read the same
model as the application. Writing conflicts down (4) and knowing the limits (13)
keep all of it honest.

## How we'd know it's wrong

- A reader with one of these problems cannot find the practice for it from the
  table.
- A practice cannot be understood, or applied, without reading the article it
  points to.
- The next parts need practices that do not fit any of these thirteen.

---

*The ideas and arguments in this article are my own. An AI assistant (Claude)
helped with drafting, editing and fact-checking.*
