---
title: 'Software that knows: one model, three applications on three stacks'
description: 'One knowledge model runs in three applications on different technologies. The knowledge stays when the application changes, and tests show it.'
pubDate: 2026-10-18
tags: ['software-that-knows', 'ontology', 'architecture']
series: 'software-that-knows'
image: '/images/software-that-knows/rules-in-code-or-model.png'
draft: false
---

*Part 10 of the series ["Software that knows"](https://almilo.com/series/software-that-knows/).*

## Recap

Parts 7 to 9 each built one application on a knowledge model, and claimed that
its code knows nothing about the domain. Part 9 tested that claim with a second
domain in the same application.

This part tests it in two dimensions: the domains, with three of them and a test
domain, and the technology, with the same knowledge model run by three
applications built on different technologies, or stacks. If the knowledge is
really in the model, each application should only add what its technology is
good at, and none should need to know a domain.

- **Demo:** [lab.almilo.com/eligibility](https://lab.almilo.com/eligibility/)
  (the browser application; the two Java applications run locally)
- **Code:** [github.com/almilo/software-that-knows/eligibility](https://github.com/almilo/software-that-knows/tree/main/eligibility)

The models are simplified from Swiss federal law. They are a demonstration, not
legal or financial advice, and not checked by a lawyer or a pension fund.

## Why this matters

In most enterprise software, the business rules live in the code. They are
spread over services, user interfaces and database procedures, written in the
language of the technology of the day. That has a known consequence: changing
the technology means rewriting the application, and rewriting it means finding
the rules again in the old code, writing them again, and showing that the new
application decides as the old one did. Migrations are expensive and risky for
this reason, and many systems stay on old technology because the knowledge in
them cannot be moved without a rewrite.

Separating the business logic from the technology is an old promise:
rule engines, model-driven development and business process tools have all made
it. In practice, the rules usually ended up in a form tied to one tool, or back
in the code.

This part tests a stronger form of the separation. The knowledge is in a model,
written in open standards (RDF, SHACL, SPARQL), with the law it comes from. The
applications run the model and know only a small vocabulary for forms. If that
holds, the code becomes a means to an end: an application can be replaced, or
a second one added on another technology, and the knowledge stays where it is.
The five claims below test what that requires, and each says what it makes
possible.

![Two panels. On the left, "Rules in the code: a new technology means a rewrite". An application on technology A has rules spread over its UI, services and database. An arrow down to an application on technology B is labelled "rewrite: find the rules again, write them again, prove it decides the same"; one of the rules there has a question mark. Caption: "The knowledge moves only by hand". On the right, "Rules in a model: a new technology means a new application". A knowledge model, with questions, rules, next steps and the law each comes from, is run by a browser wizard (React + Bun), a server wizard (Vaadin), a process with tasks (Flowable) and, dashed, the next one. Below them, shared cases: every application must decide the same. Caption: "The knowledge stays; the code is a means to an end".](/images/software-that-knows/rules-in-code-or-model.png)

## The model

A domain is one process under a law, in one Turtle file: its questions as SHACL,
its rules as SPARQL, its findings and next steps, and for each, the articles it
comes from. There are three:

| Domain | Process | Law |
| --- | --- | --- |
| [`wef`](https://github.com/almilo/software-that-knows/blob/main/eligibility/knowledge/domains/wef/ontology/wef.ttl) | Pension money for a home | BVG Art. 30a–30g, WEFV |
| [`vested-benefits`](https://github.com/almilo/software-that-knows/blob/main/eligibility/knowledge/domains/vested-benefits/ontology/vested-benefits.ttl) | The vested benefit in cash | FZG Art. 2–5, 25f |
| [`parental-allowance`](https://github.com/almilo/software-that-knows/blob/main/eligibility/knowledge/domains/parental-allowance/ontology/parental-allowance.ttl) | Maternity and other parent's allowance | EOG Art. 16b–16l |

Two shared modules hold what more than one domain asks: [`person`](https://github.com/almilo/software-that-knows/blob/main/eligibility/knowledge/modules/person.ttl) (date of birth,
marriage, the spouse's consent) and [`pension`](https://github.com/almilo/software-that-knows/blob/main/eligibility/knowledge/modules/pension.ttl) (the reference age, the vested
benefit). A domain imports them with `owl:imports`, and its class is a subclass
of theirs:

```turtle
wef: owl:imports form: , pension: , <https://example.org/ch-law/bvg> ;
wef:Application rdfs:subClassOf pension:PensionApplication .
```

SHACL applies a shape for a class to the members of its subclasses, so the
questions and rules of the modules become part of the domain's form. `wef` and
`vested-benefits` share both modules; `parental-allowance` shares none, only the
vocabulary of the form.

## Three applications

| Application | Technology | Where the model runs | What it adds |
| --- | --- | --- | --- |
| A wizard in the browser | React + Bun | In the browser, with Oxigraph (WebAssembly) | A static site, with no server. A generator writes the form schema and the texts from the model; JSON Forms draws the form |
| A wizard on a server | Vaadin + Spring Boot | On the server, with Apache Jena | The model never reaches the browser. The wizard is built from the model at startup, with nothing generated |
| Applications in a process | Spring Boot + Flowable + htmx | On the server, with Jena, in a BPMN process | The decision becomes a step of a process: the model decides, its next steps become tasks of an office, and a person decides |

The two engines are separate implementations. The TypeScript core and the Java
core do the same four things: load a domain with the modules it imports, read
its form, run its rules until nothing new is derived, and read back the values,
the findings and the next steps.

![Under the heading "One model, three applications", a blue box, the knowledge model in Turtle (SHACL questions, SPARQL rules, texts in four languages, sources), holds three domains: wef, pension money for a home; vested-benefits, the vested benefit in cash; parental-allowance, maternity and other parent. wef and vested-benefits point to the shared modules pension and person; form.ttl and the law modules are used by every domain. Below, the model feeds a TypeScript core (Oxigraph, in WebAssembly) and a Java core (Apache Jena), joined by a double arrow labelled "shared cases: 240 decisions, 44 formats". The TypeScript core runs the browser wizard (React + Bun, JSON Forms, a static site, online); the Java core runs the server wizard (Vaadin + Spring Boot, the model stays on the server) and the process and tasks (Flowable, htmx, BPMN, next steps become tasks). Caption: "No application knows a domain: each knows only the vocabulary of the form".](/images/software-that-knows/one-model-three-applications.png)

The two screenshots below show one application with the same answers, first in
the browser wizard, then in the server wizard. The decision is the same in both;
only the look differs, because each uses its own components. Only the browser
wizard is online.

**1. Browser wizard (React + Bun), online.** Black step buttons and submit button.

![The browser wizard (React + Bun) for "Pension money for a home", at its last step, "4. Review and submit", with black buttons. The outcome: "No rule stops this application. You can submit it.", six next steps, each with its article, such as "Attach the purchase contract or the construction contract. WEFV Art. 10", and two values: last day to apply, 15 March 2048, and maximum withdrawal, CHF 150’000.](/images/software-that-knows/eligibility-browser-wizard.png)

**2. Server wizard (Vaadin + Spring Boot), run locally.** The same answers and
the same outcome, in Vaadin's components: grey tabs with the current step in
blue, a blue submit button.

![The server wizard (Vaadin) for the same application with the same answers, in Vaadin's own components: grey step tabs with the current one in blue, a blue submit button. The outcome is the same: the same six next steps with their articles, last day to apply 15 March 2048, maximum withdrawal CHF 150’000.](/images/software-that-knows/eligibility-server-wizard.png)

### Where it happens

| Part | Folder |
| --- | --- |
| The knowledge model: the form vocabulary, the shared modules, the domains | [knowledge/](https://github.com/almilo/software-that-knows/tree/main/eligibility/knowledge) |
| TypeScript core and generator | [react-bun/core/](https://github.com/almilo/software-that-knows/tree/main/eligibility/react-bun/core), [react-bun/generator/](https://github.com/almilo/software-that-knows/tree/main/eligibility/react-bun/generator) |
| Browser wizard | [react-bun/app/](https://github.com/almilo/software-that-knows/tree/main/eligibility/react-bun/app) |
| Java core | [java/eligibility-core/](https://github.com/almilo/software-that-knows/tree/main/eligibility/java/eligibility-core) |
| Server wizard | [java/vaadin-app/](https://github.com/almilo/software-that-knows/tree/main/eligibility/java/vaadin-app) |
| Process application | [java/flowable-app/](https://github.com/almilo/software-that-knows/tree/main/eligibility/java/flowable-app) |
| Shared cases: decisions, and how values are written | [conformance/](https://github.com/almilo/software-that-knows/tree/main/eligibility/conformance) |
| Test domain | [fixtures/domains/library-card/](https://github.com/almilo/software-that-knows/tree/main/eligibility/fixtures/domains/library-card) |

Each claim below names the tests that check it.

## Claim 1: the knowledge is in the model, not in the applications

**Claim.** The separation is between the model and the application. The model
holds what a process asks, decides and requires, and where in the law each part
comes from. The applications show a form and an outcome, and know only the
vocabulary of the form ([`form.ttl`](https://github.com/almilo/software-that-knows/blob/main/eligibility/knowledge/ontology/form.ttl)): a question, a finding, a next step, a
value.

**Benefit.** The knowledge does not have to be rewritten when the application
is. Moving to another technology means writing an application that runs the
model, not finding the rules again in old code. The model also stays readable
on its own: each rule names the article it comes from, so a change in the law
leads to a known place in the model, not to a search through the code.

**Check.** No code of the three applications or the two cores names a domain, a
question or a rule: a search for the names of the domains and their fields finds
one comment. What differs between domains is read from the model at run time, or
generated from it.

**In the code.** The search, over the applications and the cores; its one result
is a comment in [`react-bun/core/model.ts`](https://github.com/almilo/software-that-knows/blob/main/eligibility/react-bun/core/model.ts):

```bash
grep -rnwE "wef|vested-benefits|parental-allowance" react-bun/app react-bun/core java/*/src/main
```

**Limit.** The search shows that no code names a domain. It does not show that
the vocabulary of the form is general enough for a process that is not an
application under a law. Claim 3 tests one step further.

## Claim 2: the parts are reused, not copied

**Claim.** Knowledge is shared through modules, code through cores. A rule about
the spouse's consent is written once, in `person`, and applies to every domain
that imports it. The Java core serves both Java applications.

**Benefit.** A rule that is written once is changed once. When the law changes
a rule that several processes share, one module changes, and every process and
every application that uses it follows. In code, the same rule is often written
again in each system that needs it, and the copies drift apart.

**Check.** `wef` and `vested-benefits` import the same two modules and add only
their own questions and rules. A test checks, for every domain, that the
browser application loads exactly its own file and the modules it imports, and
another that the Java core reads the same texts from them as the generator
writes. Each Java application uses the core for loading, deciding, texts and the
formatting of values.

One rule was written twice: which input a question gets (radio buttons for up to
three choices, a list for more, a date, a whole number, an amount). The Vaadin
application and the Flowable pages each decided it. It is now one method of the
Java core, [`Field.input()`](https://github.com/almilo/software-that-knows/blob/main/eligibility/java/eligibility-core/src/main/java/org/softwarethatknows/eligibility/Field.java), with the reading of a typed answer:

```java
public Input input() {
    if (choices.isPresent()) return choices.get().size() <= 3 ? Input.RADIO : Input.SELECT;
    ...
}
```

**In the code.** [react-bun/test/domains.test.ts](https://github.com/almilo/software-that-knows/blob/main/eligibility/react-bun/test/domains.test.ts)
checks that each domain loads exactly its file and the modules it imports;
[TextsTest](https://github.com/almilo/software-that-knows/blob/main/eligibility/java/eligibility-core/src/test/java/org/softwarethatknows/eligibility/TextsTest.java)
that the Java core reads the same texts as the generator writes.

**Limit.** The two cores are a deliberate copy: the same four operations in
TypeScript and in Java. Claim 4 is what keeps them equal.

## Claim 3: a new domain needs only its model

**Claim.** A new process is a new Turtle file. No application changes.

**Benefit.** The cost of a new process is the cost of describing it, not of
building software for it. Every application that runs the model offers the new
process at once: as a wizard in the browser, as a wizard on a server, and as a
process with tasks for an office.

**Check.** A test domain, kept outside the knowledge model: [the library card of a
fictional town library](https://github.com/almilo/software-that-knows/blob/main/eligibility/fixtures/domains/library-card/ontology/library-card.ttl). It is small, but uses every kind of question (a choice
of two, a choice of four, a date, a whole number, an amount), a question asked
only after a rule derives a fact (a parent's consent, under 16), a refusal, a
value (the yearly fee) and next steps, with sources defined in the file, since
no law applies.

The tests of every application copy the knowledge model, add the test domain,
and run it:

| Application | What its test does with the test domain |
| --- | --- |
| Browser wizard | The generator writes its files, and the engine asks, decides and derives |
| Java core | Reads its form and rules, and decides |
| Server wizard (Vaadin) | The list shows it; the wizard asks for the parent's consent only for a child, and shows the fee |
| Process (Flowable) | The pages show its form; its applications run through the same process, with its next steps as tasks |

None of these tests changes code; the domain is the only new file.

**In the code.** One `TestDomainTest` each for the [Java core](https://github.com/almilo/software-that-knows/blob/main/eligibility/java/eligibility-core/src/test/java/org/softwarethatknows/eligibility/TestDomainTest.java),
the [server wizard](https://github.com/almilo/software-that-knows/blob/main/eligibility/java/vaadin-app/src/test/java/org/softwarethatknows/eligibility/vaadin/TestDomainTest.java) and the process application, and [react-bun/test/test-domain.test.ts](https://github.com/almilo/software-that-knows/blob/main/eligibility/react-bun/test/test-domain.test.ts).
The [Flowable one](https://github.com/almilo/software-that-knows/blob/main/eligibility/java/flowable-app/src/test/java/org/softwarethatknows/eligibility/flowable/TestDomainTest.java),
shortened: the application starts on the copy with the test domain, and the
domain's applications go through the same process:

```java
@DynamicPropertySource
static void knowledge(DynamicPropertyRegistry registry) {
    registry.add("eligibility.knowledge", () -> TestDomain.knowledge().toString());
}

@Test
void itsApplicationsRunThroughTheSameProcess() {
    var review = applications.get(applications.submit(TestDomain.NAME, ADULT, "alex"));
    assertEquals("review", review.summary().state());
    assertEquals(List.of("BringId"), review.checks().stream().map(Applications.Check::step).toList());
}
```

**Limit.** The test domain was written knowing the vocabulary. It shows that a
domain written in the vocabulary needs no code. It does not show that every
process fits the vocabulary: a process that needs a table of rows, or a
calculation over a list, would need new words.

## Claim 4: every application decides the same

**Claim.** Two engines, one result: for the same answers on the same day, every
application asks the same questions and reaches the same decision.

**Benefit.** This is what makes a migration safe. The hardest part of replacing
an application is usually not writing the new one, but showing that it decides
as the old one did. Here that proof exists before the migration: a set of cases
with their expected decisions, which every application must pass. A new
application on another technology is done, as far as decisions go, when it
passes them.

**Check.** Shared test cases. For each domain, a fixed draw of applications from
the fields of its form, one kept for each distinct outcome, at most 80, with
what the engine decided: the questions asked and missing, the values, the
findings, the next steps with their sources. The TypeScript tests and the Java
tests run all 240, and compare numbers by value.

They found a real difference. Oxigraph gave no parental allowance for most
incomes. The daily income is the monthly income divided by 30, and for most
amounts that division is inexact: the decimal result kept more digits than
Oxigraph keeps, and the next multiplication gave no result. Jena computed it.
The model now computes those amounts as `xsd:double`, which both engines compute
the same, and the cases record it. Without the cases, the two applications would
have decided differently for most incomes, and nothing would have shown it.

**In the code.** [react-bun/test/conformance.test.ts](https://github.com/almilo/software-that-knows/blob/main/eligibility/react-bun/test/conformance.test.ts)
and [ConformanceTest](https://github.com/almilo/software-that-knows/blob/main/eligibility/java/eligibility-core/src/test/java/org/softwarethatknows/eligibility/ConformanceTest.java)
run every case. The TypeScript side, in full:

```ts
test.each(cases.map((c) => [c.id, c] as const))("%s is decided as recorded", (_, c) => {
  expect(evaluate(c.answers, c.date)).toEqual(c.expected);
});
```

**Limit.** The cases cover the outcomes that the draw reached. They show that
the engines agree, not that the model reads the law correctly. Only a review of
the model against the law, by a person, shows that.

## Claim 5: every application writes the same

**Claim.** A person sees the same values in every application: 150’000, not
150000 in one and 1.5E+5 in another.

**Benefit.** The people who use the applications, and the office that answers
their questions, see the same amounts and dates wherever they look. Formatting
is a small thing, but it is one of the places where two applications that
decide the same can still disagree in front of a person.

**Check.** Shared cases for how values are written: numbers, dates and choices,
in four languages, 44 in all. Both cores run them.

The first version failed in two ways. Jena wrote a large decimal as `1.5E+5`,
which the Java formatter did not recognise as a number: one screen showed the
maximum withdrawal as 1.5E+5. And the platforms disagree on the separators:

| Platform | en-CH | de-CH | it-CH, four digits |
| --- | --- | --- | --- |
| Chrome | `150'000` | `150'000` | `1234.57` |
| Bun | `150'000` | `150’000` | `1234.57` |
| JDK | `150’000` | `150’000` | `1’234.57` |

So no application can rely on its platform for this. The vocabulary of the form
now says how numbers are written in a region, and both cores use it:

```turtle
form:SwissNumbers a form:NumberFormat ;
  form:region "CH" ; form:language "de" , "en" , "it" ;
  form:groupSeparator "’" ; form:decimalSeparator "." .
```

French uses a narrow no-break space and a comma. Dates are written by the
platform, in long form: there the platforms agree. How a region writes numbers
is knowledge too, and it moved into the model like the rest.

**In the code.** [react-bun/test/format.test.ts](https://github.com/almilo/software-that-knows/blob/main/eligibility/react-bun/test/format.test.ts)
and [CatalogTest](https://github.com/almilo/software-that-knows/blob/main/eligibility/java/eligibility-core/src/test/java/org/softwarethatknows/eligibility/CatalogTest.java)
run the cases of [conformance/display/format.json](https://github.com/almilo/software-that-knows/blob/main/eligibility/conformance/display/format.json).

**Limit.** The cases cover values, not layout. The applications deliberately
differ in how they show a question: the Vaadin wizard uses radio buttons where
the browser wizard uses a list, because each uses its own components.

## Each application, in its own idiom

When the knowledge is in the model, the technology can be chosen for what it is
good at, not for where the rules already are. Each application is written as
the community of its technology would write it:

- **The browser wizard (React + Bun).** The engine runs in the browser; the
  generator turns the model into a JSON Forms schema; the application is a static
  site, with nothing to run on a server.
- **The server wizard (Vaadin).** Server-side components, the model's texts
  through Vaadin's translation API, and tests without a browser. The model stays
  on the server, which matters when the rules are internal. There is no
  `Binder`: which questions are asked and which answers are missing is the
  engine's decision, and a binder would repeat those rules in the user interface.
- **The process (Flowable).** One BPMN process for every domain, with Flowable's
  users and groups, claimed tasks, due dates and history. Each next step that the
  model derives becomes a parallel task of the office, so a new domain also gets
  its own review steps. The decision is kept with the day it was made and a
  version of the model, so that it can be traced later. The pages are rendered on
  the server, with htmx for the form and bpmn-js for the diagram.

![The process application for the same application, as Maria Rossi of the office sees it, state "In review". The BPMN diagram shows the process: application submitted; decide with the knowledge model; a gateway "What does the model decide?" leading to complete the application (incomplete), refused by the rules (refused) or check a next step (allowed); then decide on the application, and a gateway to approved, rejected or back to complete the application (return). The steps done are green, the current one, check a next step, is yellow. Below, "Next steps, checked by the office": two are fulfilled and checked by Maria Rossi, one with the note "Purchase contract received"; two are open, assigned to her, due on 20 October, with a note field and the buttons "Not fulfilled" and "Fulfilled". Each names its article.](/images/software-that-knows/eligibility-process.png)

Two choices of the process application follow from the claims:

- **BPMN, not CMMN.** The life of an application is fixed; what varies is which
  next steps apply, and the model already decides that.
- **The model decides, not DMN.** The rules use the classes of the model, such
  as which kinds of home qualify, and derive values from other values. Decision
  tables in FEEL would be a second copy of the rules, the transcription that
  part 9 showed to be where errors enter.

## What it costs

| Part | Lines |
| --- | --- |
| TypeScript core | 432 |
| Browser wizard | 510 |
| Generator | 472 |
| Java core | 940 |
| Server wizard (Vaadin) | 669 |
| Process application (Flowable) | 1228, and 307 of templates |

The process application is the largest because it does the most: a process,
users, tasks and history around the same decision. None of these lines is about
a pension, a home or a parental allowance.

## How we'd know it's wrong

- A new domain needs a change to an application, not only its model.
- The two engines disagree on a case that the draw did not reach.
- The vocabulary of the form grows a word for each domain.
- An application needs to know a domain to look right, for example to order its
  questions or to format a value.
- A fourth application, on another technology, takes longer to write than the
  rules it runs would take to write in code.
- A lawyer reads a model and finds that it decides differently from the law.

---

*The ideas and arguments in this article are my own. An AI assistant (Claude)
helped with drafting, editing, fact-checking and the code. The knowledge models
are simplified readings of Swiss federal law, not legal or financial advice.*
