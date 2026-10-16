---
title: 'Software that knows: one app, two diagrams'
description: 'One generic app, a second diagram: the new domain is four files, no new code, and checks find two places where the drawing is ambiguous.'
pubDate: 2026-10-16
tags: ['software-that-knows', 'ontology', 'testing']
series: 'Software that knows'
image: '/images/software-that-knows/one-app-two-diagrams.png'
linkedin: 'https://www.linkedin.com/posts/alberto-mijares-1138017_softwarearchitecture-knowledgemanagement-share-7516846543212228609-zg9C/'
medium: 'https://almilo.medium.com/software-that-knows-one-app-two-diagrams-ffc4a8266c69'
draft: false
---

*Part 9 of the series "Software that knows".*

## Recap

[Part 7](https://almilo.com/blog/software-that-knows-from-a-diagram-to-a-decision/)
wrote one diagram and its author's rules down as an ontology, and built an
application on them: it asks only the questions that matter, decides, and says
why. It claimed that the decision code knows nothing about
software architecture.

This part tests that claim with a second diagram from the same author, on a
different subject, in one application. It also asks a question that part 7 left
open: how do we know that a knowledge model is right?

- **Demo:** [lab.almilo.com/choices/chatgpt-models](https://lab.almilo.com/choices/chatgpt-models/)
  and [lab.almilo.com/choices/cloud-architecture](https://lab.almilo.com/choices/cloud-architecture/)
- **Code:** [github.com/almilo/software-that-knows/choices](https://github.com/almilo/software-that-knows/tree/main/choices)

Both diagrams are Alok Sharan's. The way they are written down here is mine: he
has not reviewed it.

## A diagram that already decides

Alok Sharan's "ChatGPT Model Tree" goes with a post titled "Pick the task. Then
the model." Unlike the diagram of part 7, it is already a decision:

- **A tree.** Five yes/no questions, such as "Do you need finished work, not
  just an answer?", lead to six models: three in Chat, three in Work & Codex.
- **A column per model.** What it is best for, which plans have it, its effort
  levels, how to use it, and a prompt example.
- **An effort ladder.** Seven combinations of model and reasoning effort, "lightest
  to heaviest". The post says how to use it: "Increase capability when the output
  falls short, rather than defaulting to maximum effort."

So the question here is not how to get a decision out of the diagram. It is what
writing a drawn decision down adds.

## One application, two domains

Part 7's code was generic in its core, which evaluates conditions and orders
rules. Around the core, it used the words of its domain: an architecture style, parts of the
system, a platform, an architecture decision record. The new application,
`choices`, replaces them with neutral words, in one vocabulary file:

| Part 7 | `choices` |
| --- | --- |
| architecture style | option |
| style rule: the first that applies decides | choice rule |
| part rule: every one that applies adds a part | addition rule |
| a tool on a platform | a tool available with an answer |
| architecture decision record | record, titled by the domain |

The generator, the decision code and the application know only these words. A
domain is one decision, in a folder with four files that have the same names in
every domain. There are two: `cloud-architecture`, part 7's choice of a software
architecture style, and `chatgpt-models`, the choice of a ChatGPT model:

| File | `cloud-architecture` (part 7) | `chatgpt-models` |
| --- | --- | --- |
| `facts.ttl` | 3 styles × 8 dimensions, and their tools | 6 models × 7 dimensions, and the effort levels |
| `questions.ttl` | 8 questions about the team | the 5 questions of the tree, and the plan |
| `rules.ttl` | 6 rules, written as conditions | the tree, as its arrows; 4 cautions; the ladder |
| `domain.ttl` | the words of the page; a mapping of words | the words of the page; the first question |

![Three boxes side by side under the heading "Two domains, one vocabulary". On the left, cloud-architecture, part 7 in its own words: facts.ttl, questions.ttl and rules.ttl, unchanged, and domain.ttl, the words mapped. In the middle, highlighted, Vocabulary, neutral words for a choice: option, criterion, choice rule, addition, caution, branch, ladder; choice.ttl. On the right, chatgpt-models, the model tree in these words: facts.ttl, questions.ttl, rules.ttl with the tree, cautions and the ladder, and domain.ttl. Arrows from both domains point to the vocabulary, labelled "mapped, subClassOf" and "written in". An arrow goes down from the vocabulary to The app: generator, checks, page; it knows only the words of the vocabulary.](/images/software-that-knows/one-app-two-diagrams.png)

### Part 7, unchanged

The `cloud-architecture` domain uses part 7's three files exactly as they are.
Part 7's files use their own words, such as
`:StyleRule` and `:recommends`. The fourth file says what they mean in the new
vocabulary:

```turtle
:StyleRule  rdfs:subClassOf    choice:ChoiceRule .
:recommends rdfs:subPropertyOf choice:recommends .
:onPlatform rdfs:subPropertyOf choice:availableWith .
```

Before it reads a model, the generator applies two rules of RDF Schema: a
statement with a subproperty also holds with its superproperty, and a member of
a subclass is also a member of its superclass. Each is one SPARQL update. After
them, "a style rule recommends Microservices" is also "a choice rule recommends
Microservices", and the generator reads only the new words.

Part 7 said that its model used no reasoning. This is the first place in the
series where it does, and it is small: two rules, so that two vocabularies can
meet without either file changing.

### Mapping, not rewriting

Saying how the terms of two ontologies relate, without changing either, is
called ontology mapping, or alignment. It matters beyond this example: the
models that an organisation already has keep their words and their owners, and a
new application reads them through a mapping instead of a copy.

The mapping file has 17 statements, one for each word of part 7 that the
application needs. Each says that a word of part 7 is a special case of a word
of `choices`, not that the two are the same. The difference matters. A subclass
works in one direction only: the mapping adds statements in the words of
`choices`, and nothing in the words of part 7 changes. A stronger statement,
such as `owl:equivalentClass`, works in both directions, and would let the
`choices` vocabulary add claims to part 7's terms.

This works because each word of part 7 has one counterpart. A word that must be
split in two, or two words that become one, need rules that build the new
statements, not a subclass. Here the simple mapping is enough, and
complete: on all 13,122 situations of part 7, the two applications decide the
same. So part 7's model, without one of its lines rewritten, gets everything
that the generic application adds, such as the checks described below.

### What the second domain needed

The new domain needed three things that part 7 did not have. Each became a word
of the vocabulary, not code about ChatGPT:

- **A tree.** The rules file writes the arrows of the drawing, and the generator
  turns the path to each model into its conditions:

  ```turtle
  :Scoped choice:branch [ choice:answer choice:yes ; choice:to :ScopedWork ] ,
                        [ choice:answer choice:no  ; choice:to :Ambiguous ] .
  ```

- **A caution for one choice.** "Free & Go get Luna in the desktop app" applies
  only when the recommendation is GPT-6 Luna. The tree never asks for the plan;
  the application asks for it only when a caution depends on it.
- **A ladder.** Steps in order, each a model at an effort level. A recommendation
  says where to start, and what to try when the result falls short.

![The application after three answers: finished work Yes, scoped No, ambiguous No. Not asked, because no answer can change the recommendation: careful reasoning, hardest problem, and the plan. The recommendation is GPT-6.1 Sol, with the author's words "GPT-6.1 Sol for documents, coding, and deliverables you will refine", the three answers as the reasons, where to start on the ladder (low effort) and the next step (extra high effort), what comes with it from the diagram, and the other models to reconsider.](/images/software-that-knows/choices-model-tree.png)

Nobody wrote the navigation of the tree into the application. After "Yes" to
finished work, the questions of the other half cannot change the result, so the
same code that skipped questions in part 7 skips them here.

## How do we know the model is right?

### Write down what is drawn

The first step is a faithful transcription: each arrow of the drawing becomes
one statement, as drawn. An agent that writes the model must not correct the
drawing quietly. If it does, the checks have nothing to find, and the author's
mistake becomes an undocumented decision of ours.

As drawn, the right half of the tree has a problem. "Is it scoped, repeatable or
high-volume?" has only a "No" arrow. "Ambiguous, high-stakes or exacting?" has
three: "Yes" to GPT-6 Luna, "No" to GPT-6.1 Sol, and "Yes" to GPT-6 Astra.

### Two kinds of checks

| Check | Finds | Needs |
| --- | --- | --- |
| One arrow per answer | an answer that leads nowhere, or to two places | the tree |
| One path per model | a model that no path, or two paths, lead to | the tree |
| Gap | a situation without a recommendation | the rules only |
| Overlap | a situation where two rules apply | the rules only |
| Never used | a rule that no situation uses | the rules only |
| Ladder | a step where the effort of a model goes down | the ladder |

The first two check the **structure** of the drawing; the first is one SPARQL
query that counts arrows. The others check the **behaviour** of the rules in
every situation: 5 yes/no questions and 4 plans give 128. They do not need a
tree, so they also run on part 7's rules, which never had one.

The arrow check, slightly shortened. For each question and each of its answers,
it counts the arrows, and keeps the counts that are not one:

```sparql
SELECT ?criterion ?answer (COUNT(?branch) AS ?arrows) WHERE {
  ?criterion a choice:Criterion ;
             choice:answers/rdf:rest*/rdf:first ?answer .   # each answer it allows
  OPTIONAL { ?criterion choice:branch ?branch .
             ?branch choice:answer ?answer }                 # each arrow for that answer
}
GROUP BY ?criterion ?answer
HAVING (COUNT(?branch) != 1)
```

On the diagram as drawn, they find this:

```
structure: Ambiguous: 2 arrows for "yes"
structure: Scoped: 0 arrows for "yes"
gap: finishedWork=yes, scoped=yes: no choice rule applies
overlap: finishedWork=yes, scoped=no, ambiguous=yes: ScopedWork, AmbiguousWork apply
never chosen: AmbiguousWork
never applies: AstraLimitedOnPlus
ladder: GPT-6.1 Sol goes from Extra high (Rung3) to Low (Rung4)
```

For a person, the gap means that a scoped, repeatable task gets no
recommendation, and the overlap means that an ambiguous task gets two. The
structure checks find the cause in the drawing; the behaviour checks find the
effect on the person.

### The order hides conflicts

Part 7's rule "the first rule that applies decides" would hide the overlap.
GPT-6 Luna comes first in the order, so it always wins, and the application
shows one recommendation without a sign of trouble. The only trace is that GPT-6
Astra is never chosen, and then its caution about the Plus plan never applies.
Part 7's tests checked that every rule is used, but not for overlaps. The overlap
check ignores the order, so it names the conflict directly.

### The ladder

The ladder is drawn "lightest to heaviest", but rung 3 is GPT-6.1 Sol at Extra
high and rung 4 is GPT-6.1 Sol at Low. The check finds that the effort of one
model goes down. The diagram itself suggests which part is wrong: the column of
GPT-6.1 Sol says "Effort: Medium, Extra high to polish", and rung 4 is "Polished
deliverables". So the two effort badges are probably swapped, not the two rungs.

### Two readings, recorded

The model corrects both, and says so:

```turtle
:Scoped choice:branch [ choice:answer choice:yes ; choice:to :ScopedWork ] ,   # our reading (1)
```

The rules file explains both readings and their reasons. The drawing as drawn
stays in the tests: if the checks stop finding its problems, the tests fail.
These are readings, not facts. The author can confirm or correct them, and each
correction is one line.

With the readings, both domains pass every check:

```
┌────────────────────┬────────────┬────────────────────┬────────────────────┐
│                    │ situations │ structure findings │ behaviour findings │
├────────────────────┼────────────┼────────────────────┼────────────────────┤
│     chatgpt-models │ 128        │ 0                  │ 0                  │
│ cloud-architecture │ 13122      │ 0                  │ 0                  │
└────────────────────┴────────────┴────────────────────┴────────────────────┘
```

The checks find inconsistency, not error. A model with no findings can still
give a recommendation that the author would not give. Only a review of the
model against its source, by a person, finds that.

## Comparing the two domains

The application is built so that the two domains can be compared directly:

- **Page.** Both domains show the same sections: the questions, the
  recommendation with its reasons, and the diagram as a table. `chatgpt-models`
  also shows its ladder.
- **Files.** Each domain has the same four files, with the same roles.
- **Checks.** One test runs the same checks on every domain, and one table
  reports the results.
- **Differences.** The README of the application lists what only one domain uses
  (the tree, the ladder, cautions for one choice, the mapping of part 7's words)
  and the word of the vocabulary for each.
- **Part 7.** Its application stays unchanged at its address, and the `choices`
  version decides the same in every situation.

## How we'd know it's wrong

- A third domain needs a change to the code, not only four new files.
- The vocabulary grows a word for every domain, and stops being generic.
- The checks pass, and people still get recommendations that the author would
  not give.
- The author answers, and our readings of the drawing are wrong.
- The model names change faster than anyone updates the facts.

---

*The ideas and arguments in this article are my own. An AI assistant (Claude)
helped with drafting, editing, fact-checking and the code. The diagrams
"Microservices VS Serverless VS Modular Monolith" and "ChatGPT Model Tree" are
Alok Sharan's; how they are written down as rules, and both readings of the
second diagram, are my interpretation.*
