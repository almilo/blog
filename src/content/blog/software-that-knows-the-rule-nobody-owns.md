---
title: 'Software that knows: the rule nobody owns'
description: 'A refund policy with six sources and no owner. Written down as a model, it cannot decide either, but it shows exactly what has to be decided.'
pubDate: 2026-10-13
tags: ['software-that-knows', 'knowledge-management', 'requirements']
series: 'Software that knows'
image: '/images/software-that-knows/rule-nobody-owns.png'
draft: false
---

*Part 8 of the series "Software that knows".*

## Recap

[Part 4](https://almilo.com/blog/software-that-knows-where-knowledge-sits/)
followed one fever rule through code, a database, an SOP and a clinician's
head. The rule was scattered, but everyone agreed on it. This part looks at a
rule that is scattered *and* disputed, and asks what writing it down can and
cannot do.

## Code is not the hard part

William Alexander's
[post](https://www.linkedin.com/posts/william-alexander-software-delivery-lead_enterprise-code-is-simple-there-are-no-complex-share-7514983659297370112-Xlap/)
argues that enterprise code is simple, mostly if/else, and that what makes
enterprise software hard is deciding what to build. AI writing the code barely
changes that.

The example is a refund policy. In short:

- A purchase less than 30 days old can be refunded.
- Customer success managers can extend that for "exceptional circumstances".
- Finance wants to sign off on refunds over €5,000.
- Support says that sign-off has never been applied, and nothing went wrong.
- One compliance officer agrees with support. Another says skipping it is a
  violation, but cannot find the document that says so.
- Sales has been promising 60 days, based on an old wiki page by someone who
  has since left.

The post concludes: "None of this is a coding problem." I agree. This article is
about what kind of problem it is, and what software can still do about it.

## Where the refund rule sits

Apply part 4's three checks to each source: is it formal (a machine can act on
it), explicit (written down where people can question it), and does it have an
owner?

| Source | Says | Formal | Explicit | Owner |
| --- | --- | --- | --- | --- |
| The policy | 30 days | no | probably | not stated |
| Customer success | longer, in exceptional circumstances | no | no: "exceptional" is undefined | each manager |
| Finance | sign-off over €5,000 | no | yes | finance |
| Support | the sign-off is never applied | no | no: it is practice | nobody |
| Compliance | it is required; it is not | no | one view has a missing document | two people, disagreeing |
| Sales | 60 days | no | yes, a wiki page | someone who left |

Six sources, none formal, two contradictions, one undefined term, and a base
rule whose owner nobody names. It is part 4's picture again, with one
difference: in part 4 the scattered copies agreed. Here they don't.

## What code does with it

A developer, or a coding agent, has to write something. So it picks a reading:

```ts
if (ageInDays <= 30 || overriddenByCsm) {
  if (amount > 5000) requireFinanceApproval();
  approveRefund();
}
```

This code makes three decisions: 30 days, not 60; any override counts; the
sign-off applies. Nobody with the authority to make them did. The person who
wrote the code made them, and the code does not say so. A month later, it is
"the system", and the system is the rule.

Faster code generation makes this worse, not better. An agent picks a reading
in seconds, and the contradiction disappears into the code without anyone
noticing it was there.

## Writing it down instead

The same policy, written as a knowledge model. A sketch, not a working model:

```turtle
# Prefixes omitted for brevity.

:RefundWithin30Days a :Rule ;
    rdfs:comment "A purchase less than 30 days old can be refunded."@en ;
    :maxAgeDays 30 .

:RefundWithin60Days a :Rule ;
    rdfs:comment "A purchase less than 60 days old can be refunded."@en ;
    :maxAgeDays 60 ;
    prov:wasDerivedFrom <https://wiki.example.com/refunds> ;
    prov:wasAttributedTo :FormerEmployee .

:ExceptionalCircumstances a :Concept ;
    rdfs:label "Exceptional circumstances"@en .

:FinanceSignOff a :Rule ;
    rdfs:comment "A refund over €5,000 needs sign-off by finance."@en ;
    :minAmountEur 5000 ;
    :owner :Finance ;
    :claim [ :by :Support ;     :says "Never applied, never a problem."@en ] ,
           [ :by :ComplianceA ; :says "Not needed."@en ] ,
           [ :by :ComplianceB ; :says "Required."@en ; :evidence :NotFound ] .
```

Nothing here is decided. Both refund windows are in the model, each with what
is known about it. The compliance disagreement is recorded as claims, with
their authors, not settled by whoever types first.

What the model adds is a set of checks on itself:

```turtle
:RuleShape a sh:NodeShape ;
    sh:targetClass :Rule ;
    sh:property [ sh:path :owner ; sh:minCount 1 ;
                  sh:message "Nobody owns this rule."@en ] ;
    sh:property [ sh:path prov:wasDerivedFrom ; sh:minCount 1 ;
                  sh:message "Nobody knows where this rule comes from."@en ] .

:ConceptShape a sh:NodeShape ;
    sh:targetClass :Concept ;
    sh:property [ sh:path skos:definition ; sh:minCount 1 ;
                  sh:message "This term has no definition."@en ] .
```

One more check, in SPARQL, finds two rules in force that set different refund
windows. Run a validator, and the report is a list of questions, each about
something specific:

| Finding | Question to answer |
| --- | --- |
| Two refund windows in force: 30 and 60 days | Which one? And what about customers already promised 60? |
| The 30-day rule has no owner and no source | Who owns the refund policy? |
| The 60-day rule's author has left | Does anyone stand behind it? |
| "Exceptional circumstances" has no definition | What counts, and who decides? |
| The €5,000 sign-off has conflicting claims and missing evidence | Is it required, and by what? |

The model does not answer any of them. It turns "everyone has a slightly
different idea" into five questions that can be put on someone's desk.

## What changes when they are answered

Each answer is a change to the model: one rule removed, an owner added, a
definition written, a source linked. The checks pass when the last one is in.
From then on:

- **The decision has a place to live.** Not in a meeting nobody minuted, not
  in the code: next to the rule, with who made it and why.
- **It survives people leaving.** The next time someone leaves, the reason for
  30 days does not leave with them, unlike the wiki page sales relied on.
- **The code follows.** The if/else, a switch, a state machine, a BPMN flow:
  any of them can be generated from, or checked against, the model. They
  structure the logic; the model keeps what the logic means and who owns it.

Until then, the application can still act on what is agreed and hand the rest
to people: refund automatically under 30 days, and send anything else to a
person with the open question attached. That interim behaviour is a decision
too, and someone has to own it. But it is one decision, written down and easy
to reverse, instead of three hidden in code.

## Where AI helps, and where it doesn't

LLMs can do a lot of the work here. They can read the wiki, the tickets and the
chat threads, draft the rules with their sources, and point out that sales and
the policy disagree. That is the knowledge acquisition step that made this
approach too expensive before
([part 2](https://almilo.com/blog/software-that-knows-why-now/)).

They cannot make the call. On that, the post is right. What a knowledge model
adds is a place where the call becomes visible before it is made, and stays
visible after.

So I'd put the conclusion a little differently. Figuring out what to build is
the bottleneck, partly because the knowledge needed to decide is scattered,
unwritten and contradictory. Writing it down doesn't make the decision. It
makes clear what has to be decided, by whom, and keeps the answer once it
exists.

## Summary

![On the left, six sources under the heading "Six sources, two contradictions": Policy: 30 days; Customer success: exceptions; Finance: sign-off over €5,000; Support: never applied; Compliance: yes, and no; Sales wiki: 60 days. Two arrows leave them. The upper one goes to Code, where someone picks a reading, such as "if age is at most 30", and on to Hidden decisions, made by whoever wrote the code. The lower one goes to the highlighted Knowledge model, with rules, claims, sources and checks on them, and on to Five questions: Which refund window? Who owns the policy? Who stands behind 60 days? What is "exceptional"? Is the sign-off required? Caption: The model does not decide. It shows what has to be decided, and by whom.](/images/software-that-knows/rule-nobody-owns.png)

## How we'd know it's wrong

- The questions the checks raise go unanswered as long as before: making the
  gaps visible does not make anyone own them.
- Organisations prefer the ambiguity: an undefined "exceptional circumstances"
  is flexibility someone wants to keep.
- Recording disputes, with names, makes people less willing to state a view.
- Real policies are too fluid to model: by the time a rule is written down and
  approved, practice has moved on.

---

*The ideas and arguments in this article are my own. An AI assistant (Claude)
helped with drafting, editing and fact-checking. The refund example is from
William Alexander's post; the way it is written down here is mine and has not
been reviewed by its author.*
