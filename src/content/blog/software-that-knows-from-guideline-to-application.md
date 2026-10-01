---
title: 'Software that knows: from guideline to application'
description: 'A working application built from published WHO guidance: where the knowledge comes from, the two models behind it, and what an agent does.'
pubDate: 2026-09-28
tags: ['software-that-knows', 'ontology', 'knowledge-management']
draft: false
series: 'Software that knows'
image: '/images/software-that-knows/guideline-to-application.png'
linkedin: 'https://www.linkedin.com/posts/alberto-mijares-1138017_softwarearchitecture-knowledgemanagement-share-7510431005283950592-pNkx/'
medium: 'https://medium.com/@almilo/software-that-knows-from-guideline-to-application-08a5b228f75e'
---

*Part 5 of the series "Software that knows".*

## Recap

Parts 1 to 4 described the approach: capture knowledge, make it formal and
explicit, and derive the software from it. This part applies it end to end, to
published clinical guidance, and shows the result as a working application.

- **Demo:** [lab.almilo.com/imci-fever](https://lab.almilo.com/imci-fever/)
- **Code:** [github.com/almilo/software-that-knows/imci-fever](https://github.com/almilo/software-that-knows/tree/part-5/imci-fever)

**Disclaimer:** the application is a demonstration. It is not a medical device and has not been
reviewed by a clinician.

## The use case

A health worker assesses a sick child aged 2 months to 5 years. The application
asks the questions, classifies the case and lists the treatments, following the
World Health Organization (WHO) guidance for fever, malaria and measles, as
published in its digital adaptation kit (DAK) for child health. The DAK builds
on the WHO Integrated Management of Childhood Illness (IMCI) guidance.

The assessment starts with the fever questions. After the child is recorded
with fever and an axillary temperature of 38.6 °C, new questions appear: the
malaria risk of the area, how long the fever has lasted, and signs of other
infections. The result panel asks for the assessment to be completed.

![The application form on the Fever tab. Fever reported is checked and the axillary temperature is 38.6 °C. Below, questions on malaria risk, fever duration, stiff neck, limbs, urine, cough, runny nose and red eyes have appeared. On the right, a grey card says: Fever: complete the assessment.](/images/software-that-knows/app-fever-questions.png)

The area has a high malaria risk, and the rapid test is positive. The result is
MALARIA, with its treatments: paracetamol in the clinic for the high fever, an
oral antimalarial, advice on when to return, and a follow-up in 3 days. Below
the treatments are the IDs of the WHO rules the result comes from.

![The same form with malaria risk high, fever for 7 days or less and a positive malaria test. On the right, a yellow card titled MALARIA lists four treatments, followed by the source: WHO digital adaptation kit (DAK) for child health (2024), Web Annex B, with rule IDs such as CHE.DT.01.CL86.](/images/software-that-knows/app-malaria-result.png)

A danger sign changes the result. With "unconscious or lethargic" checked, the
child is classified as VERY SEVERE FEBRILE DISEASE, with first doses of
medication and urgent referral.

![The Danger signs tab with Unconscious or lethargic checked. On the right, a pink card titled VERY SEVERE FEBRILE DISEASE lists first doses of artesunate, ampicillin and gentamicin, prevention of low blood sugar, paracetamol for high fever, and Refer URGENTLY to the hospital.](/images/software-that-knows/app-danger-sign.png)

The application covers 35 questions, 4 decision tables, 9 classifications and
22 treatments.

## Where knowledge is found

Organisations already hold much of their knowledge in written form: standard
operating procedures (SOPs), guidelines, regulations, product specifications and
decision tables. The rest sits with people
([part 4](https://almilo.com/blog/software-that-knows-where-knowledge-sits/)).
An organisation would start from its own documents. This example uses a public
source instead.

The source is the WHO
[DAK for child health](https://www.who.int/publications/i/item/9789240089907)
(2024). A DAK turns WHO clinical guidance into requirements for digital
systems. Two of its annexes matter here:

- **Web Annex A, the data dictionary.** Every data element, with an ID, a
  definition and its allowed values.
- **Web Annex B, the decision-support logic.** Decision tables in which every
  row has an ID.

A data element, from Annex A:

| ID | Label | Input options |
| --- | --- | --- |
| CHE.B25.H.DE01 | Malaria risk | High malaria risk, Low malaria risk, No malaria risk |

A decision row, from Annex B:

| ID | Conditions | Classification |
| --- | --- | --- |
| CHE.DT.01.CL86 | "Fever" = TRUE; "Malaria risk" = "High malaria risk"; severe classification = FALSE; "Malaria test results" = "Malaria-positive" | Malaria |

Against the three checks from
[part 3](https://almilo.com/blog/software-that-knows-what-knowing-means/):

- **Explicit:** yes. The rules are written down, each with an ID.
- **Readable by experts:** yes. They are tables in spreadsheets.
- **Formal:** partly. The structure is regular, but the conditions are text in
  cells. A program cannot execute them as they are.

The missing step is making the knowledge formal. That is what the knowledge
model adds.

## Two models

The application rests on two models with different purposes.

### The knowledge model: the domain

The knowledge model describes the domain: the questions, the conditions, the
classifications and the treatments, each linked to the DAK entries it comes
from. It is one
[Turtle file](https://github.com/almilo/software-that-knows/blob/part-5/imci-fever/ontology/imci-fever.ttl)
of about 650 lines, in the format introduced in
[part 4](https://almilo.com/blog/software-that-knows-where-knowledge-sits/).

A question, and when it is asked:

```turtle
[ sh:path imci:highParasiteDensity ; sh:datatype xsd:boolean ;
  sh:name "High parasite density" ;
  prov:wasDerivedFrom dak:CHE.B24.G.DE71 ;
  imci:shownWhen [ imci:field imci:malariaTest ; imci:equals "positive" ] ]
```

The MALARIA row of the fever table:

```turtle
imci:Malaria a imci:Classification ;
  rdfs:label "MALARIA" ;
  imci:severity imci:Yellow ;
  prov:wasDerivedFrom dak:CHE.DT.01.CL86 , dak:CHE.DT.01.CL88 , ... ;
  imci:matchesWhen [ imci:allOf (
    imci:malariaApplies
    [ imci:anyOf (
        imci:hasSevereClassification
        [ imci:field imci:malariaTest ; imci:equals "positive" ]
        [ imci:field imci:malariaTest ; imci:equals "unknown" ] ) ] ) ] ;
  imci:qualifiers ( imci:MalariaUnconfirmed imci:HighParasiteDensity imci:MalariaLongFever ) ;
  imci:treatments ( imci:ParacetamolHighFever imci:Antimalarial imci:ReferForAssessmentMalaria
                    imci:AdviseReturn imci:FollowUp3DaysFever ) .
```

Conditions such as `imci:malariaApplies` are defined once, in the same file, and
reused. Each rule names its DAK rows, so it can be checked against the source
row by row.

### The application model: the software

The application model describes the software: which fields the form has, when
each one is shown, and the decision tables in a form a program can evaluate. It
knows nothing about fever. It is three JSON files, generated from the knowledge
model:

- **[`schema.json`](https://github.com/almilo/software-that-knows/blob/part-5/imci-fever/generated/schema.json):**
  the fields, their types and their allowed values.
- **[`uischema.json`](https://github.com/almilo/software-that-knows/blob/part-5/imci-fever/generated/uischema.json):**
  the form layout, and when each field is shown.
- **[`rules.json`](https://github.com/almilo/software-that-knows/blob/part-5/imci-fever/generated/rules.json):**
  the decision tables, their rows and treatments.

The same question, in the application model:

```json
{
  "type": "Control",
  "scope": "#/properties/highParasiteDensity",
  "rule": {
    "effect": "SHOW",
    "condition": {
      "scope": "#",
      "schema": {
        "properties": { "malariaTest": { "const": "positive" } },
        "required": ["malariaTest"]
      }
    }
  }
}
```

Every condition becomes a JSON Schema: the answers match the condition when they
are valid against it. The form library ([JSON Forms](https://jsonforms.io/))
and the classifier both use these schemas, so no separate rule engine is
needed. The translation is short
([`compile-condition.ts`](https://github.com/almilo/software-that-knows/blob/part-5/imci-fever/generator/compile-condition.ts)):

```ts
const field = o.one(c, `${IMCI}field`);
if (field) {
  const name = local(field);
  const equals = o.one(c, `${IMCI}equals`);
  const atLeast = o.number(c, `${IMCI}atLeast`);
  const test = equals ? { const: literal(equals) } : { minimum: atLeast };
  return { properties: { [name]: test }, required: [name] };
}
for (const op of ["allOf", "anyOf"]) {
  const items = o.one(c, `${IMCI}${op}`);
  if (items) return { [op]: o.list(items).map((item) => compileCondition(o, item)) };
}
```

### The generic application

The application renders the form from `schema.json` and `uischema.json`, and
evaluates `rules.json` against the answers. For each table in use, it finds the
matching row and the treatments that apply
([`classify.ts`](https://github.com/almilo/software-that-knows/blob/part-5/imci-fever/app/classify.ts)):

```ts
return rules.tables
  .filter((table) => matches(table.usedWhen, input))
  .map((table) => {
    const row = table.rows.find((r) => matches(r.matchesWhen, input));
    const treatments = row.treatments.filter((t) => !t.givenWhen || matches(t.givenWhen, input));
    // ...
  });
```

*Simplified; the full function also handles pending tables, qualifiers and
sources.*

| Part | Lines | Contains |
| --- | --- | --- |
| Knowledge model | about 650 | The domain: questions, rules, treatments, sources |
| Generator | about 250 | Knowledge model to application model |
| Application | about 200 | Form, classifier, result cards |

All the medical content is in the knowledge model. The generator and the
application contain none.

## Stochastic and deterministic

![A flow from left to right. Source: WHO DAK spreadsheets. A dashed arrow labelled extracts leads to the knowledge model, Turtle: the domain. This step is marked stochastic, done by a coding agent. Below the knowledge model, experts accept it. A solid arrow labelled generator leads to the application model, JSON: form and rules, and then to a generic application with no domain content. These steps are marked deterministic, done by code: same input, same output.](/images/software-that-knows/guideline-to-application.png)

**Stochastic (coding agent):**

- An agent reads the DAK spreadsheets and writes the knowledge model.
- An agent wrote the generator and the application, once.
- The output of each run can differ, so it is reviewed before it is used.

**Deterministic (code):**

- The generator turns the knowledge model into the application model.
- The application renders the form and evaluates the rules.
- The tests check clinical paths and general properties, such as "every pink
  result refers urgently".
- The same knowledge model always produces the same application.

**People:**

- Choose the source.
- Accept the knowledge model, rule by rule, against the source.
- Remain accountable for it
  ([part 2](https://almilo.com/blog/software-that-knows-why-now/)).

This is the split described in
[part 4](https://almilo.com/blog/software-that-knows-where-knowledge-sits/):
agents write the generators once, and generation afterwards is a cheap,
deterministic step.

## How LLMs make this feasible

Turning guidance like the DAK into a formal model used to need knowledge
engineers and significant time. That cost was a main reason expert systems and
model-driven development stalled
([part 2](https://almilo.com/blog/software-that-knows-why-now/)).

In this example, a coding agent produced the knowledge model from the DAK
spreadsheets in one working session. An agent also wrote the generator and the
application. The effort moves from writing the model to accepting it, and
the total effort is a fraction of what it used to be
([part 2](https://almilo.com/blog/software-that-knows-why-now/)).

A hypothetical future version of the DAK shows the effect. The agent updates
the knowledge model from the new spreadsheets. Experts accept the change, as a
readable difference in one file, with each rule pointing to its DAK row. The
generator produces a new application model. The application code stays the
same.

## How the example fits the earlier claims

| Claim | Part | In the example |
| --- | --- | --- |
| Knowledge can be made formal and explicit | [1](https://almilo.com/blog/software-that-knows-the-hypothesis/), [3](https://almilo.com/blog/software-that-knows-what-knowing-means/) | DAK tables turned into an executable knowledge model |
| LLMs lower the cost of capturing knowledge | [2](https://almilo.com/blog/software-that-knows-why-now/) | The knowledge model was produced by a coding agent |
| Acceptance by the people who own the knowledge | [2](https://almilo.com/blog/software-that-knows-why-now/) | Every rule names its DAK row, so it can be accepted row by row |
| One model, several artefacts, all generated | [4](https://almilo.com/blog/software-that-knows-where-knowledge-sits/) | Schema, form and rules generated from one file |
| Traceability through provenance | [4](https://almilo.com/blog/software-that-knows-where-knowledge-sits/) | Every result shows the DAK rules behind it |
| Changes land in the knowledge, not in the code | [1](https://almilo.com/blog/software-that-knows-the-hypothesis/) | A new DAK version changes the knowledge model; the application stays the same |

## How we'd know it's wrong

- The application model cannot express what the next domain needs, and domain
  logic ends up in the application code.
- Accepting a knowledge model rule by rule takes longer than reviewing the
  equivalent code.

---

*The ideas and arguments in this article are my own. An AI assistant (Claude)
helped with drafting, editing and fact-checking. The demo is adapted from the
WHO digital adaptation kit for child health (CC BY-NC-SA 3.0 IGO); WHO did not
create the adaptation and is not responsible for it.*
