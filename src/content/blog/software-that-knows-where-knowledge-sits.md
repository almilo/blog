---
title: 'Software that knows: where knowledge sits'
description: 'One fever rule, found in code, a database, configuration, an SOP and a clinician''s head. And the alternative: one formal, explicit file.'
pubDate: 2026-09-27
tags: ['software-that-knows', 'ontology', 'knowledge-management']
draft: false
series: 'Software that knows'
image: '/images/software-that-knows/where-knowledge-sits.png'
linkedin: 'https://www.linkedin.com/posts/alberto-mijares-1138017_softwarearchitecture-knowledgemanagement-share-7509938251433136128-Z1Gl/'
medium: 'https://medium.com/@almilo/software-that-knows-where-knowledge-sits-04fce838876b'
---

*Part 4 of the series "Software that knows".*

## Recap

[Part 3](https://almilo.com/blog/software-that-knows-what-knowing-means/)
defined knowing: Knowledge and Understanding, applied to observations. This
article asks where that Knowledge actually sits, using the same rule: above
about 38 °C, a body temperature is usually considered a fever.

## The classic approach: scattered knowledge

A clinician opens the application: a form with a temperature field and a table
of readings. It shows 38.5. Is that a fever, and what should happen next? The
answer is spread across several places.

Each place gets the same three checks:

- **Formal:** a machine can interpret it without ambiguity.
- **Explicit:** it is written down where people can see and question it.
- **Readable by experts:** a clinician can check it without an engineer.

### Code without types

```ts
if (t > 38) {
  fever = true;
}
```

What is `t`? Which unit? Why 38? Only the engineer knows.

*Formal: yes, the computer executes it. Explicit: no, the meaning of `t`, the
unit and the reason for 38 are written nowhere. Readable by experts: no.*

### Code with types

```ts
type Celsius = number;
interface BodyTemperature { value: Celsius; measuredAt: Date }
const FEVER_THRESHOLD: Celsius = 38;
function hasFever(t: BodyTemperature) { return t.value > FEVER_THRESHOLD; }
```

Better names and structure. But `Celsius` is only a name, not a check, there
is no rationale, and the rule is locked inside one application.

A stronger type system would help, within limits. TypeScript is only the
example here; the same applies to Java, C# or any mainstream language. Types
describe the shape of data inside one program. Whether 38.5 is a fever is a rule
about values, which is ordinary logic rather than a type. Refinement and
dependent types can express some rules of this kind, but they are rare in
business software. Types also have no place for the reason behind a rule.
Depending on the language, they may not exist at runtime at all (TypeScript
erases them); where they do, as with Java reflection, they expose structure,
not rules or reasons. And none of it is visible to the database, the report or
the alerting tool.

*Formal: yes, it is compiled and type-checked. Explicit: partly, names and
structure are stated, but the unit is not enforced and the reason is not
recorded. Readable by experts: no, it is code.*

### Database

```sql
CREATE TABLE vitals (patient_id INT, temp NUMERIC(4,1), measured_at TIMESTAMP);
-- 42 | 38.5 | 2026-09-25 08:00
```

The observation. "Fever" isn't in the database; it only exists in code.

*Formal: partly, columns and types are defined, but not what `temp` means.
Explicit: no, fever appears nowhere. Readable by experts: no.*

### And also…

- **The UI:** input validation, and a red cell above 38.
- **The API contract:** `temperature: number`, with no unit and no meaning.
- **A report:** the threshold copied into its SQL.
- **The alerting tool:** the threshold again.
- **Tests:** the expected behaviour, often the most accurate record of the rule.
- **Tickets:** why 38, if anyone can still find it.

The 38 now appears in at least four places. Change it to 38.3, and every copy
has to be found.

### Standard operating procedure (SOP)

> Patients with a temperature above 38 °C are considered febrile. For patients
> on chemotherapy, escalate immediately.

Readable, and it even covers chemotherapy. But it is informal, and separate
from the application.

*Formal: no, a machine cannot act on prose. Explicit: yes, it is written down.
Readable by experts: yes.*

### The clinician's head

> The SOP says to check for chemotherapy. The temperature screen doesn't show
> it, so I open the medication screen.

The application holds both facts, on two different screens. That they are
connected exists only in the clinician's head.

*Formal: no. Explicit: no, it was never written down. Readable by experts:
only by this clinician.*

### The result

Software with little knowledge of its own. It holds Data and Information. The
Knowledge is spread across code, configuration, a PDF and people, and the
clinician has to bring those pieces together while clicking through tables and
forms.

## The knowledge-centric approach: one file

```turtle
# Prefixes (clinic, prov, rdf, rdfs, sh, xsd) omitted for brevity.

# ── Ontology: what things mean (Knowledge and Understanding) ──

clinic:Patient a rdfs:Class ;
  rdfs:label "Patient" .

clinic:onChemotherapy a rdf:Property ;
  rdfs:label "on chemotherapy" ;
  rdfs:domain clinic:Patient ; rdfs:range xsd:boolean .

clinic:BodyTemperature a rdfs:Class ;
  rdfs:label "Body temperature" .

clinic:patient a rdf:Property ;
  rdfs:domain clinic:BodyTemperature ; rdfs:range clinic:Patient .

clinic:celsius a rdf:Property ;
  rdfs:label "value in °C" ;
  rdfs:domain clinic:BodyTemperature ; rdfs:range xsd:decimal .

clinic:Fever a rdfs:Class ;
  rdfs:subClassOf clinic:BodyTemperature ;
  rdfs:label "Fever" ;
  rdfs:comment "Above about 38 °C. The body's response to infection: a signal, not the problem itself." .

clinic:UrgentFever a rdfs:Class ;
  rdfs:subClassOf clinic:Fever ;
  rdfs:label "Urgent fever" ;
  rdfs:comment "Fever in a patient on chemotherapy. Chemotherapy suppresses the immune system, so an infection can escalate quickly." .

# ── Shapes: what a valid reading looks like ──

clinic:BodyTemperatureShape a sh:NodeShape ;
  sh:targetClass clinic:BodyTemperature ;
  sh:property [ sh:path clinic:patient ; sh:class clinic:Patient ; sh:minCount 1 ; sh:maxCount 1 ] ;
  sh:property [ sh:path clinic:celsius ; sh:datatype xsd:decimal ; sh:minCount 1 ; sh:maxCount 1 ] ;

# ── Rules: what follows (from the SOP, now formal) ──

  sh:rule [
    a sh:SPARQLRule ;
    rdfs:comment "Above 38 °C is considered a fever." ;
    prov:wasDerivedFrom <https://example.org/sop/fever#section-3> ;
    prov:wasAttributedTo clinic:ClinicalBoard ;
    sh:prefixes clinic: ;
    sh:construct """
      CONSTRUCT { $this a clinic:Fever }
      WHERE { $this clinic:celsius ?c . FILTER (?c > 38) }
    """
  ] ;
  sh:rule [
    a sh:SPARQLRule ;
    rdfs:comment "Fever in a patient on chemotherapy is treated as urgent." ;
    sh:order 1 ;
    sh:prefixes clinic: ;
    sh:construct """
      CONSTRUCT { $this a clinic:UrgentFever }
      WHERE { $this a clinic:Fever ; clinic:patient ?p . ?p clinic:onChemotherapy true . }
    """
  ] .
```

The observation is not part of the knowledge model. Here it is, with the result
of applying the rules:

```turtle
clinic:patientX a clinic:Patient ; clinic:onChemotherapy true .
clinic:reading42 a clinic:BodyTemperature ; clinic:patient clinic:patientX ; clinic:celsius 38.5 .

# rules applied →
clinic:reading42 a clinic:Fever , clinic:UrgentFever .
```

The 38 appears once. The connection that existed only in the clinician's head,
between the temperature screen and the medication screen, is now a rule, with
its reason stated next to it.

Rules can also record where they came from and who approved them, as the fever
rule does. The reason for 38 no longer depends on finding an old ticket.

*Formal: yes, engines validate it and apply the rules. Explicit: yes, every
concept, rule and reason is written down in one place. Readable by experts:
yes, through generated documents and diagrams, or explained by an LLM.*

## How it fits together

- **One file, many outputs.** Deterministic code generates the code types, the
  validation, the UI labels and help text, the database schema (shapes become
  tables, `minCount 1` becomes `NOT NULL`, `sh:class` becomes a foreign key),
  and documents and diagrams for the experts, from the labels and comments. No
  AI is needed to run it.
- **Agents read the file directly.**
- **Legacy databases don't need replacing.** They can be mapped to the
  ontology instead, using the W3C standard R2RML. The knowledge is captured
  and the existing system stays.
- **This is the knowledge-centric diagram from
  [part 1](https://almilo.com/blog/software-that-knows-the-hypothesis/), made
  concrete.**
- **The format isn't the point; the properties are:** formal, explicit, shared.
  The core of the knowledge model is an ontology, classically defined as a
  "formal, explicit specification of a shared conceptualisation" (Studer et
  al., 1998).

## Isn't this just model-driven development?

Both generate software artefacts from a model. The differences:

|                         | Model-driven development (MDD)     | Knowledge-centric                                    |
| ----------------------- | ---------------------------------- | ---------------------------------------------------- |
| What is modelled        | The software: classes, components  | The domain: meanings, rules, reasons                 |
| Who can read it         | Engineers (UML)                    | Engineers and domain experts (generated documents)   |
| Why things are so       | Not recorded                       | Recorded next to each concept and rule               |
| Traceability            | Kept separately; links go stale    | Each rule records its source and approver            |
| After generation        | An input that drifts from the code | Stays in use: rules run, agents query it             |
| Standards               | Often proprietary tooling          | Open W3C standards: RDF, SHACL, SPARQL               |

MDD depended on hand-written generators that were expensive to build and
maintain. Coding agents could write those generators today as well, so cost
alone no longer separates the two approaches. What remains is what the model
contains. An MDD model describes the software: generating code from it, with or
without an LLM, reproduces the structure of the application, not the meaning of
fever, the reason for 38 or the link to chemotherapy. UML can describe a
domain, and OCL can express constraints, but in practice both were often left
out. A knowledge model describes the domain itself, keeps the reasons next to
the rules, and stays in use after generation.

In the knowledge-centric approach, coding agents write the generators once, and
people review them. From then on, producing the schema, types, validation and
documents is a cheap, deterministic step: the same knowledge model always
produces the same output.

**Why now?** Two costs fell. LLMs made capturing knowledge cheap
([part 2](https://almilo.com/blog/software-that-knows-why-now/)), and coding
agents make building the generators cheap. In turn, the knowledge model gives
agents firm ground: they know what "fever" means instead of guessing from
scattered code.

## Summary

![A two-by-two grid. Columns: implicit and explicit. Rows: formal and informal. Formal and implicit, described as precise but hidden: code, database schema, configuration, reports and alerts. Informal and explicit, readable but ambiguous: the SOP. Informal and implicit: the clinician's head. Formal and explicit, precise and readable, highlighted: the knowledge model, with ontology, shapes and rules.](/images/software-that-knows/where-knowledge-sits.png)

## How we'd know it's wrong

- Keeping generated artefacts and the knowledge model in sync costs more than
  the duplication it removes.
- Domain experts still don't read the generated documents.
- Rules outgrow SHACL and SPARQL and end up back in code.
- Generators written by coding agents turn out as costly to maintain as
  hand-written ones.

---

*The ideas and arguments in this article are my own. An AI assistant (Claude)
helped with drafting, editing and fact-checking.*
