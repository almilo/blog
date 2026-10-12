---
title: 'Software that knows: from a diagram to a decision'
description: 'A popular comparison diagram, written down as facts, questions and its author''s rules: an app that asks only what matters, decides and says why.'
pubDate: 2026-10-12
tags: ['software-that-knows', 'ontology', 'software-architecture']
draft: false
series: 'Software that knows'
image: '/images/software-that-knows/diagram-to-decision.png'
---

*Part 7 of the series "Software that knows".*

## Recap

[Part 5](https://almilo.com/blog/software-that-knows-from-guideline-to-application/)
built an application from published clinical guidance: the knowledge in a model,
the application derived from it. This part applies the same approach to a much
smaller and much more common source: a diagram from a LinkedIn post, and the
rules of thumb its author wrote next to it.

- **Demo:** [lab.almilo.com/cloud-architecture](https://lab.almilo.com/cloud-architecture/)
- **Code:** [github.com/almilo/software-that-knows/cloud-architecture](https://github.com/almilo/software-that-knows/tree/main/cloud-architecture)

The diagram and the heuristics are Alok Sharan's. The way they are written down here is mine: he has
not reviewed it.

## A good diagram that cannot decide

Alok Sharan's infographic
[Microservices VS Serverless VS Modular Monolith](https://www.linkedin.com/feed/update/urn:li:activity:7514433067860582400/)
compares three ways to build a cloud application. Nine branches, from core
purpose and structure to cost, security, what each style is best for and its
tools, each show the three styles side by side.

It is a good comparison. It shows what each style gives and what it costs, and
it says plainly that none of them is a maturity level. What it cannot do is
tell a team which one fits *them*. The reader has to weigh nine branches
against their own situation, and most readers do not know which branches
matter for them.

The post that goes with the diagram has the missing part. It ends with the
author's view:

> Start with modular clarity. Use serverless for event-driven execution. Move
> to microservices when scale, ownership, and domain boundaries justify the
> operational cost.

So the knowledge for a decision exists, in two places and two forms: a picture
for the facts, a paragraph for the judgement. Neither can be applied by
software. This article writes both down, and builds a small application on
them.

## Three kinds of knowledge

A diagram and its post mix three kinds of knowledge. Written down, they are
kept apart, in three files:

| | Kind | Whose | File |
| --- | --- | --- | --- |
| **Facts** | what each style is like | the diagram | `cloud-native-architecture.ttl` |
| **Questions** | how to describe a team | ours | `criteria.ttl` |
| **Opinion** | which style for which team | the author, mapped by us | `rules.ttl` |

They are kept apart for three reasons:

- **They come from different places.** The facts and the opinion are the
  author's; the questions are ours. Each file can say where it comes from and
  carry its own licence.
- **They change at different speeds.** The diagram is fixed. The questions can
  be refined. The rules are an opinion, and another author's could replace them
  on the same facts.
- **They are reviewed by different people.** Anyone can check the facts against
  the picture, and the rules against the post, each on its own.

The most important line between them: the facts never decide. The diagram says
that microservices are "best for large engineering teams". In the facts, that
stays a label. Only the rules act on the size of a team.

The three files are joined by names. Every thing in them has a name in the same
namespace, such as `:Microservices`, `:TeamSizeLarge` or `:AwsLambda`, so a
rule that recommends `:Microservices` means exactly the style that the facts
describe.

![Three boxes side by side under the heading "Kept apart, joined by names". On the left, Questions: how to describe a team, ours, criteria.ttl. In the middle, highlighted, Opinion: which style for which team, the author, mapped by us, rules.ttl. On the right, Facts: what each style is like, the diagram, cloud-native-architecture.ttl. Arrows go from Opinion to Questions, labelled "when :TeamSizeLarge", and to Facts, labelled "recommends :Microservices". An arrow goes down from Opinion to The app: asks only what matters, decides, says why.](/images/software-that-knows/diagram-to-decision.png)

## The facts: the diagram as data

The first file holds what the diagram shows: 3 styles, 8 dimensions, 57
characteristics and 12 tools. One style, with two of its dimensions:

```turtle
:Microservices a :ArchitectureStyle ;
    rdfs:label "Microservices"@en ;
    :hasCostModel :ContinuousInfrastructureCost , :HigherOperationalOverhead , :EfficientAtLargeScale ;
    :supportedBy  :Kubernetes , :Docker , :Istio , :ApacheKafka .
```

Each characteristic is a thing with a name and a label, not a piece of text:

```turtle
:MinimalIdleCost a :CostModel ; rdfs:label "Minimal idle cost"@en .
```

Each dimension is a property, and all eight are declared as kinds of the same
property, "has characteristic". The code finds the dimensions by asking for
those properties, so it has no list of them, and a ninth dimension would need
no code change.

In the application, this file becomes the table at the bottom of the page: the
diagram redrawn from data, with the recommended style marked. It also gives
every recommendation its "what comes with it": the scalability, complexity,
cost and security of the chosen style, in the diagram's words.

![The table "The three styles, from the diagram": rows for core purpose, architecture structure, deployment model, scalability, complexity, cost model, security level, best for and tools; columns for Microservices, marked recommended, Serverless, marked for parts, and Modular monolith. The Microservices column is shaded blue, the Serverless column lighter.](/images/software-that-knows/app-comparison-table.png)

## The questions: a vocabulary for a team

A rule cannot act on "a large team" until "large" is defined. The second file
defines eight questions about a team: its size, the number of teams, how
separate the business areas are, the traffic, background work, the platform,
the expected growth and the team's experience of running distributed systems.
Every question and every answer has a definition:

```turtle
:Traffic a :Criterion ; skos:notation "traffic" ; sh:order 4 ;
    rdfs:label "Traffic"@en ;
    skos:definition "How the load from users changes over time."@en ;
    :answers ( :TrafficSteady :TrafficSpikyPredictable :TrafficUnpredictable ) .

:TrafficUnpredictable a :Answer ; skos:notation "unpredictable" ;
    rdfs:label "Unpredictable"@en ;
    skos:definition "The load has peaks the team cannot foresee."@en .
```

Each statement has a job in the application:

| Statement | Example | In the application |
| --- | --- | --- |
| label | "Unpredictable" | the answer button |
| definition | "The load has peaks the team cannot foresee." | the hint under the button |
| notation | `unpredictable` | the code that the rules use |
| order | 4 | when the question is asked |

"Not sure" is an answer to every question. It is not in the file: the
generator adds it, so the file only states real answers.

The answers and their definitions are ours. The post names its criteria (team
size, domain complexity, scaling needs, operational maturity) but not their
values. Writing them down forced decisions the post leaves open, such as where
a medium team ends: here, at 10 developers.

## The opinion: the author's rules

The third file is the only one that decides. Its rules have conditions on the
answers of the second file, and recommend styles of the first.

The author's sentence about microservices becomes four conditions:

```turtle
:MoveToMicroservices a :StyleRule ; sh:order 1 ;
    :recommends :Microservices ;
    :quote "Move to microservices when scale, ownership, and domain boundaries justify the operational cost."@en ;
    :when [ :anyOf ( [ :criterion :ExpectedScale ; :in ( :ScaleHigh ) ]
                     [ :criterion :TeamSize ; :in ( :TeamSizeLarge ) ] ) ] ,
          [ :criterion :Teams ; :in ( :TeamsTwoOrThree :TeamsMoreThanThree ) ] ,
          [ :criterion :DomainSeparation ; :in ( :DomainsClearlySeparate ) ] ,
          [ :criterion :OpsMaturity ; :in ( :OpsMedium :OpsHigh ) ] .
```

Scale is high expected growth or a large team. Ownership is more than one team.
Domain boundaries are business areas that different teams could build and
release. The operational cost is justified for a team that already runs
distributed systems.

The words are the author's; the mapping from his words to answers is ours. The
rule keeps both: the conditions for the code, the quote for the reader. A
reader who disagrees with the mapping can see exactly where, and change one
line.

There are three kinds of rule:

| Kind | How it applies | Rules |
| --- | --- | --- |
| Style of the system | the first that applies decides | microservices, as above; otherwise a modular monolith ("Start with modular clarity") |
| A part of the system | every one that applies adds a part | serverless for scheduled and event-driven jobs ("Use serverless for event-driven execution"); serverless for the parts with unpredictable traffic |
| Caution | every one that applies adds a warning | microservices would fit, but the team lacks the operations experience; continuous processing is costly on serverless |

The first caution comes straight from the words "justify the operational cost".
A large organisation with separate domains but no experience of running
distributed systems gets a modular monolith, and a warning that says why
microservices are not yet the answer.

The file also adds facts about things it does not own:

```turtle
:AwsLambda :onPlatform :PlatformAws .
```

`:AwsLambda` is one of the diagram's tools; `:PlatformAws` is an answer to the
platform question. The line joins them without changing either file, so a
recommendation can name the serverless tool for the team's own platform.

## What the knowledge makes possible

Because the rules are data and not code, the application can do four things
that the diagram cannot.

### It asks only what matters

The application asks one question at a time. Before each one, it checks
whether any answer could still change the recommendation, given the answers so
far. If none can, the question is not asked.

A team of six answers "one team" to the second question. No answer to the
remaining questions can make the microservices rule apply, because it needs
more than one team. So the domains, the expected growth and the operations
experience are never asked; the page says so. The platform is asked only when a
part of the system is serverless, because only then does it change the answer.
Four to six answers are usually enough.

![The application after five answers. On the left, Your situation: team size Medium, number of teams One, traffic Steady, background work Scheduled or event-driven jobs, platform AWS, each with a Change button. Below: Not asked, because no answer can change the recommendation: domain separation, expected scale, operations maturity. On the right, the recommendation Modular monolith, with the quote "Start with modular clarity.", serverless for scheduled and event-driven jobs on AWS Lambda, what comes with it, and when to reconsider microservices.](/images/software-that-knows/app-questions-that-matter.png)

Nobody wrote "skip the domains question when there is one team". The
application finds it by trying the answers against the rules. With nothing
answered, that takes about 30 milliseconds in the browser.

### It says why

A recommendation shows the author's words, and the answers that met the rule:

> **Microservices.** "Move to microservices when scale, ownership, and domain
> boundaries justify the operational cost." Because: Expected scale: High;
> Number of teams: More than three; Domain separation: Clearly separate;
> Operations maturity: High.

A modular monolith shows what would have to change instead: "Reconsider
microservices when: Number of teams: Two or three / More than three; Domain
separation: Clearly separate". Both lists are read from the rule. Nobody wrote
them.

### It is tested in every situation

Eight questions with three to six answers each give 13,122 possible teams. The
tests check every one of them: each gets a recommendation, every rule applies
to some team, and no team is warned off microservices while being recommended
them. A diagram cannot be tested; written-down rules can, completely.

### It leaves a record

The decision can be downloaded as an architecture decision record: the answers
as the context, the decision with its reasons, the consequences from the
diagram, and when to revisit it. A team keeps it next to its code.

## How it is built

![Before the app runs: an Ontology box in Turtle with facts, questions and rules, then an arrow labelled generator to decision.json, one file. In the browser: a Decision box (the outcome of the answers, the questions that can still change it, why and when to reconsider), with an arrow down to the App, which shows what the decision returns. Footnote: the decision code knows nothing about architecture; it evaluates conditions and orders rules.](/images/software-that-knows/diagram-to-decision-build.png)

A generator reads the three files and writes one JSON file. The decision code
reads that file and knows nothing about architecture: it evaluates conditions
and orders rules. The application only displays what the decision code
returns. It is a static page; everything runs in the browser.

The repository's commits follow the same order as this article: the facts, then
the questions and the rules, then the decision, then the application.

## Is an ontology needed here?

What made the application possible is that the knowledge is written down, as
data, apart from the code. The questions that matter, the explanations and the
complete tests all follow from that. A plain JSON file with the same rules
would give the same application.

What the ontology adds is in how the knowledge is kept:

- **Three sources, one set of names.** The facts, the questions and the rules
  live in separate files, with separate owners and licences, and still refer
  to each other exactly.
- **Facts added without editing the source.** The rules file links the
  diagram's tools to the platforms without touching the diagram's file.
- **Standard vocabularies.** Labels and definitions use SKOS, order uses SHACL,
  sources use Dublin Core: any tool that reads RDF can read the model, not only
  this application.

What this application does not use is reasoning or queries; the model is small
and the rules are simple. The ontology would earn more with a second set of
rules on the same facts and questions, from another author with another view.
The application could then show where two experts agree and where they differ.

## How we'd know it's wrong

- The mapping from the author's words to answers is disputed, and changing it
  needs code, not one line of a rule.
- The rules need conditions that the small vocabulary (an answer is one of
  these, all of these clauses, any of these) cannot express.
- A team answers the questions honestly and gets a recommendation that the
  author himself would not give.
- Teams skip the questions and read the table, as they read the diagram.

---

*The ideas and arguments in this article are my own. An AI assistant (Claude)
helped with drafting, editing and fact-checking. The diagram "Microservices VS
Serverless VS Modular Monolith" and the heuristics are Alok Sharan's; how they
are written down as rules is my interpretation.*
