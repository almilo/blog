---
title: 'Software that knows: the knowledge model as grounding'
description: 'A free-text note instead of a form: four interpreters, from plain words to LLMs, all grounded in the same knowledge model.'
pubDate: 2026-10-01
tags: ['software-that-knows', 'ontology', 'llm']
draft: false
series: 'Software that knows'
image: '/images/software-that-knows/knowledge-model-as-grounding.png'
---

*Part 6 of the series "Software that knows".*

## Recap

[Part 5](https://almilo.com/blog/software-that-knows-from-guideline-to-application/)
derived a form application from the WHO digital adaptation kit (DAK) for child
health: a knowledge model, extracted from the DAK by a coding agent, and a
generic application generated from the knowledge model. This part adds a second interface on the
same knowledge model: a note in free text, turned into form answers by an
interpreter, with or without AI.

- **Demo:** [lab.almilo.com/imci-fever](https://lab.almilo.com/imci-fever/), with the words
  interpreter. The cloud interpreters need the app on your own computer:
  [setup](https://github.com/almilo/software-that-knows/tree/part-6/imci-fever#run-it-on-your-computer).
- **Code:** [github.com/almilo/software-that-knows/imci-fever](https://github.com/almilo/software-that-knows/tree/part-6/imci-fever)

**Disclaimer:** the application is a demonstration. It is not a medical device and has not been
reviewed by a clinician.

## The use case

A health worker describes the child in a note, as they would for a colleague,
instead of answering the form question by question. An interpreter proposes
form answers, each with where it comes from in the note. The health worker
confirms them, and they fill the same form. The classification still comes
from the WHO rules, as in part 5.

![The application with a note: Baby is floppy and hard to wake. Fever. Refuses the breast. All four interpreters are listed, with gpt-6-luna selected. Below, three proposed answers, each with a quote from the note: Unconscious or lethargic: yes, "floppy and hard to wake"; Not able to drink or breastfeed: yes, "Refuses the breast"; Fever reported: yes, "Fever". Buttons: Add to the form, Discard.](/images/software-that-knows/note-proposals.png)

After confirmation, the answers are in the form, and the result is VERY SEVERE
FEBRILE DISEASE, with urgent referral. Each tab shows how many of its questions
have an answer.

![The form after the answers were added: the Danger signs tab, with a count of 2, has Unconscious or lethargic and Not able to drink checked. On the right, a pink card titled VERY SEVERE FEBRILE DISEASE lists first doses of ampicillin and gentamicin, prevention of low blood sugar, and Refer URGENTLY to the hospital, with the DAK rule IDs.](/images/software-that-knows/note-result.png)

## What the knowledge model adds

### Words: copied by code, extended by an agent

A note uses words, so the knowledge model gets a new part: the words that state
each question, its absence and its values. Code copies what the DAK already has,
each question's label and definition, and the form shows the definition when a
question has the focus. A coding agent proposes the rest (synonyms such as
"very sleepy", "drinks well" for absence, abbreviations such as "RDT"),
following a skill: written instructions that ship with the code, so every run
follows the same procedure. It makes three independent runs, and code keeps a
word only if two runs agree and the results on the development notes do not get
worse.

```turtle
imci:lethargic skos:altLabel "lethargic", "unconscious", "very sleepy", "difficult to wake", ... .

imci:notAbleToDrink skos:altLabel "unable to drink", "cannot drink", "not breastfeeding", ... ;
  imci:absentLabel "drinks well", "drinking well", "able to drink" .

imci:malariaRisk skos:altLabel "malaria risk", "risk area", "malaria area" ;
  imci:valueLabel [ imci:value "high" ; skos:altLabel "high risk", "high transmission" ] , ...
```

`skos:altLabel` comes from SKOS, a W3C standard for vocabularies. The generator
writes the words to a fourth file, `lexicon.json`, next to the form and the
rules.

### Grounding, generated from the same model

An interpreter is grounded when its answers are constrained by, and checked
against, the knowledge model. Three constraints apply to every interpreter:

- **Fields and values:** an answer must name a question of the form and one of
  its allowed values. The AI interpreters receive the questions and values as a
  JSON Schema generated from the knowledge model, and code rejects anything
  else.
- **Structure:** an answer that the form would not ask, given the other
  answers, is dropped. For example, the hot-to-touch question is asked only
  when no thermometer is available.
- **Evidence:** each answer must quote the note, and code checks that the quote
  is in it. This applies to the words and to the LLMs. Jev, a System 1 model,
  returns a confidence instead of a quote. Its answers are kept only above a
  threshold (95%), and a person cannot check a confidence against the note the
  way they can check a quote.

## Four interpreters, one note

The example note from the screenshots:

> Baby is floppy and hard to wake. Fever. Refuses the breast.

**Words of the knowledge model.** Code looks up the words of the knowledge
model in the note, handles negation ("no cough") and reads numbers and
durations. No AI, in the browser.

**Words + Jev.** The words first. For every question the words leave
unanswered, Jev answers a typed question, such as yes or no, with a confidence.
Jev, from TypeSafe, is a System 1 model: it makes fast, typed decisions, after
the fast, intuitive thinking that Daniel Kahneman calls System 1 in *Thinking,
Fast and Slow* (2011), and writes no text.

**Claude Haiku 4.5 and gpt-6-luna.** Two small frontier models: the smaller,
cheaper tiers of the Anthropic and OpenAI model families. They are small only
next to the largest models; they run in the provider's cloud, not on a laptop.
Each reads the whole note against every question of the form, and each answer
must quote the note.

| Interpreter | Proposes | Evidence |
| --- | --- | --- |
| Words | Fever reported: yes | "Fever" |
| Words + Jev | Fever reported: yes; lethargic: yes; not able to drink: yes | "Fever"; confidence 99%; confidence 100% |
| Claude Haiku 4.5 | Fever reported: yes; lethargic: yes; not able to drink: yes | "Fever"; "floppy and hard to wake"; "Refuses the breast" |
| gpt-6-luna | The same three answers | The same kind of quotes |

- The words miss "floppy and hard to wake": the phrase is not in the knowledge
  model.
- Jev finds the missing answers, without quotes. It also proposed the oral
  fluid test result at 71% confidence, which the threshold dropped.
- The LLMs find the paraphrases and show where they are in the note.

## How they compare

The interpreters were measured on 15 test notes with 49 stated facts. The test
notes were written before any improvement of the interpreters and were never
used to adjust the words, the prompt or the checks; 30 other notes were used
for that. Results on notes an interpreter was tuned on tend to look better
than they are, so only the test notes are reported.

- **Found:** the share of the stated facts that the interpreter proposed.
- **Correct:** the share of the proposed answers that were right.
- **Danger signs wrong:** danger signs proposed as present although the note
  does not state them, or as absent although the note does not say they are
  absent. A danger sign leads to urgent referral; a missed one delays it.

| Interpreter | Found | Correct | Danger signs wrong | Evidence |
| --- | --- | --- | --- | --- |
| Words | 78% | 97% | 0 | Quote |
| Words + Jev | 96% | 94% | 0 | Quote, or confidence for Jev |
| Claude Haiku 4.5 | 94% | 98% | 0 | Quote |
| gpt-6-luna | 100% | 98% | 0 | Quote |

- **Without AI**, the words find about four facts in five, almost all correct.
  They find what the knowledge model names, and no more: a paraphrase, or a
  negation spread over "and" ("not awake and alert"), gives no answer rather
  than a wrong one. One run of the skill
  added 195 words without changing these results: they are precise phrases,
  while the test notes use paraphrases such as "floppy and hard to wake".
- **The two small frontier models** close the gap, with no danger sign wrong. The difference
  between them (3 facts out of 49) is too small to rank them. The choice
  between them comes down to cost, speed and data handling.
- **Jev** is fast and cheap, but slightly less precise, and gives no quotes.

The notes are few and were written by the author. Notes written by health
workers would be a stronger test.

## Stochastic and deterministic

![A flow from left to right. A note in free text goes to an interpreter: words, Jev or an LLM. This step is marked stochastic. A dashed arrow labelled proposes leads to the checks: question, value, quote and structure. The checks and the form and rules are marked deterministic, done by code. From the checks, the flow goes to Person confirms, and from there to the form and rules, which give the classification. Below, the knowledge model, with its questions, values and words, grounds the interpreter and generates the checks. Under Person confirms: accountability stays with people.](/images/software-that-knows/knowledge-model-as-grounding.png)

The split from part 5 applies at run time too:

- **Stochastic (interpreter):** proposes answers. The same note can give
  different proposals.
- **Deterministic (code):** checks the proposals against the knowledge model,
  and classifies the confirmed answers with the rules.
- **People:** confirm or discard each proposal, and remain accountable for the
  answers.

## How the example fits the earlier claims

| Claim | Part | In the example |
| --- | --- | --- |
| Agents connect to the knowledge at the centre | [1](https://almilo.com/blog/software-that-knows-the-hypothesis/) | The interpreters get their questions, values and checks from the knowledge model |
| LLMs lower the cost of capturing knowledge | [2](https://almilo.com/blog/software-that-knows-why-now/) | Code copies the DAK text; a coding agent, following a skill that ships with the code, proposes the other words in three runs, and code checks them |
| Returns that compound | [1](https://almilo.com/blog/software-that-knows-the-hypothesis/) | The note interface reuses the questions, values and rules; the words extend the same model |
| Cheaper platform changes | [1](https://almilo.com/blog/software-that-knows-the-hypothesis/) | Switching the AI provider changed one call; the prompt, schema and checks stayed the same |
| Accountability stays with people | [2](https://almilo.com/blog/software-that-knows-why-now/) | The interpreter proposes with evidence; a person confirms |
| Traceability through provenance | [4](https://almilo.com/blog/software-that-knows-where-knowledge-sits/), [5](https://almilo.com/blog/software-that-knows-from-guideline-to-application/) | The words and the LLMs quote the note; Jev gives a confidence; each result names its DAK rules |

## How we'd know it's wrong

- Extending the words costs more than the interpreters save.
- Grounded interpreters invent or deny answers on notes written by others.
- Answers without quotes get confirmed without being checked.

---

*The ideas and arguments in this article are my own. An AI assistant (Claude)
helped with drafting, editing and fact-checking. The demo is adapted from the
WHO digital adaptation kit for child health (CC BY-NC-SA 3.0 IGO); WHO did not
create the adaptation and is not responsible for it.*
