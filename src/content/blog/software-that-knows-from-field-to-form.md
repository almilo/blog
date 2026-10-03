---
title: 'Software that knows, in detail: from field to form'
description: 'How a generator of about 370 lines turns the statements of a knowledge model into a form, validation, rules and words, without knowing what fever is.'
pubDate: 2026-10-05
tags: ['software-that-knows', 'ontology', 'code-generation']
series: 'Software that knows, in detail'
draft: true
---

*A companion to the series "Software that knows". It follows the field from
[What's in a field?](https://almilo.com/blog/software-that-knows-whats-in-a-field/)
into the running imci-fever application from
[part 5](https://almilo.com/blog/software-that-knows-from-guideline-to-application/).*

## From statements to a working form

The previous companion built the axillary temperature field from statements:
a type, limits, a label, a condition, a source, words. This one follows those
statements through the generator of the imci-fever application, and shows what
each one becomes in the running form.

The path has three stages:

1. **The knowledge model:** one Turtle file, the single source of truth.
2. **The generator:** about 370 lines of TypeScript. It reads the model and
   writes four JSON files.
3. **The application:** about 460 lines that read only those JSON files. Two
   standard libraries do most of the work: JSON Forms draws the form, and AJV
   checks data against JSON Schema.

- **Code:** [github.com/almilo/software-that-knows/imci-fever/generator](https://github.com/almilo/software-that-knows/tree/part-6/imci-fever/generator)

## What the generator knows

The generator knows standards and a few terms of its own. It does not know the
domain.

- **It knows:** SHACL (fields, types, limits, groups, order), PROV-O (sources),
  SKOS (words), and a small vocabulary for conditions and decision tables
  (`shownWhen`, `allOf`, `anyOf`, `atLeast`, a table, a row).
- **It does not know:** fever, temperature, malaria, children. No domain term
  appears in its code, except in comments that give examples.

So the generator never decides that 37.5 °C is a fever. It only knows that a
condition can say "this field is at least this number", and turns that into
something the application can check.

## One field, through the generator

The field as the model has it today:

```turtle
[ sh:path imci:axillaryTemperature ; sh:datatype xsd:decimal ;
  sh:group imci:FeverTab ; sh:order 2 ;
  sh:name "Axillary temperature (°C)" ; sh:minInclusive 30 ; sh:maxInclusive 44 ;
  prov:wasDerivedFrom dak:CHE.B6.DE01 ]
```

What the generator writes for it, in `schema.json`:

```json
"axillaryTemperature": {
  "type": "number",
  "title": "Axillary temperature (°C)",
  "description": "The child's axillary temperature (temperature taken under the armpit), measured in °C.",
  "minimum": 30,
  "maximum": 44
}
```

Each statement has one rule in the generator. The sections below take them in
turn.

### Type, limits, label

```ts
const datatypes = { [`${XSD}boolean`]: "boolean", [`${XSD}integer`]: "integer", [`${XSD}decimal`]: "number" };

const choices = o.one(node, `${SH}in`);
const property = choices
  ? { type: "string", enum: o.list(choices).map(literal) }
  : { type: datatypes[o.text(node, `${SH}datatype`)] };
if (!property.type) throw new Error(`The field ${name} has no type`);
property.title = o.text(node, `${SH}name`);
```

A small table maps each XML Schema type to a JSON Schema type. A list of
choices (`sh:in`) becomes an `enum`, which JSON Forms draws as a drop-down
list. `sh:minInclusive` and `sh:maxInclusive` become `minimum` and `maximum`;
AJV then reports "must be >= 30" for 3.75. `sh:minCount 1` becomes `required`.
A field without a type stops the generator: it does not guess.

### Help text from the source

The field has no `sh:description`, yet the generated field has one. It comes
from the WHO source, through the provenance statement:

1. `prov:wasDerivedFrom dak:CHE.B6.DE01` names the data element.
2. The generator looks it up in the DAK data dictionary, which code extracted
   from the WHO spreadsheet.
3. The first paragraph of the definition becomes the help text.

A `sh:description` in the model wins over the DAK text. Provenance here is not
only a record: it is how the source's own words reach the screen.

### Tabs and order

`sh:group` and `sh:order` become the UI schema: one tab for each group, the
questions in order.

```json
{ "type": "Control", "scope": "#/properties/axillaryTemperature" }
```

### When a question is shown

The question "Hot to touch" is shown only without a thermometer:

```turtle
imci:shownWhen [ imci:field imci:thermometerNotAvailable ; imci:equals true ]
```

The generator turns each condition into JSON Schema. The form data meets the
condition when it is valid against that schema:

```json
"rule": { "effect": "SHOW", "condition": { "scope": "#", "schema": {
  "properties": { "thermometerNotAvailable": { "const": true } },
  "required": ["thermometerNotAvailable"] } } }
```

`imci:equals` becomes `const`, `imci:atLeast` becomes `minimum`, and `allOf`,
`anyOf` and `not` stay as they are. The `required` matters: without it, a
field with no answer would meet every condition. The whole compiler is 35
lines.

JSON Forms reads this rule and shows or hides the question. The same condition
also goes to `rules.json`, so that the classifier ignores an answer to a
question that is hidden.

### What a value means

In the model, the fever threshold is stated once, in a named condition:

```turtle
imci:hasFever a imci:Condition ;
  imci:anyOf ( [ imci:field imci:feverReported ; imci:equals true ]
               [ imci:field imci:hotToTouch ; imci:equals true ]
               [ imci:field imci:axillaryTemperature ; imci:atLeast 37.5 ]
               ... ) .
```

The generator copies a named condition into every rule that uses it, so
`rules.json` contains the number 37.5 twenty-five times. That is acceptable for
a generated file: nobody edits it, it is regenerated on every change, and a
test fails if it differs from a fresh generation. The single source of truth
is the model, not the output.

The decision tables get one more change. In the model, the first row that
matches wins. In `rules.json`, each row also says "and no row above matches",
so the rows exclude each other, and the classifier does not depend on their
order.

### Words for notes

For the note interpreter of
[part 6](https://almilo.com/blog/software-that-knows-the-knowledge-model-as-grounding/),
the generator writes `lexicon.json`:

```json
"axillaryTemperature": {
  "labels": ["axillary temperature", "axillary", "under the arm", "armpit", ...],
  "definition": "The child's axillary temperature (temperature taken under the armpit), measured in °C."
}
```

The first label comes from `sh:name` without the unit; the others are the
`skos:altLabel` words of the model. The generator also checks the words: a word
already derived from the label, or one that can never match because a note is
split at commas, stops the generation.

## Each statement and what it becomes

| Statement in the model | Generated | Used by the application for |
| --- | --- | --- |
| `sh:path` | Property name | Form, rules and words all refer to it |
| `sh:datatype`, `sh:in` | `type`, `enum` | Input control, type check |
| `sh:minInclusive`, `sh:maxInclusive` | `minimum`, `maximum` | Error message for an impossible value |
| `sh:minCount` | `required` | A missing answer |
| `sh:name` | `title`, first word label | Question text, note interpreter |
| `sh:description`, or the DAK text through `prov:wasDerivedFrom` | `description` | Help text, context for the note interpreter |
| `sh:group`, `sh:order` | UI schema tabs and order | Layout |
| `imci:shownWhen` | JSON Forms `SHOW` rule, `shownWhen` in rules | Hiding a question, ignoring its old answer |
| Conditions, tables, rows | JSON Schema per row | Classification |
| `prov:wasDerivedFrom` on rows and treatments | `derivedFrom` | The sources under each result |
| `skos:altLabel` | `labels` | Reading notes |

## Why generate, and not read the model at run time

The application could read the Turtle file in the browser. Generating first
has three advantages here:

- **Standard inputs for standard libraries.** JSON Forms and AJV read JSON
  Schema. They need no knowledge of RDF.
- **A reviewable change.** Git tracks the generated files. A change to the
  model shows, in the same review, exactly what changes in the form and the
  rules.
- **Less in the browser.** The application loads small JSON files, not an RDF
  library and a query engine.

The cost: the generated formats are less expressive than the model. JSON
Schema can test a value against a number; it cannot convert a value
measured at any other site of the body to an axillary one. The rule from the
previous companion needs a rule engine that runs SPARQL, in the generator or in
the application.

## What the generator ignores, and how it grows

The previous companion added statements that the imci-fever application does
not use yet: a unit, translations, a maximum count, clinical ranges as data.
The generator reads only what it knows and ignores the rest, so these
additions break nothing. Each one becomes useful with one more mapping, not
with a change to the application:

- **Translations:** write one label per language, under the keys that JSON
  Forms uses for translations (`axillaryTemperature.label`), and let the
  application choose the language.
- **Unit:** add it to the title in the language of the form, instead of
  writing "(°C)" by hand in each label.
- **Clinical ranges:** a rule engine derives the range from the data, as shown
  in the previous companion.

This is the same monotonic growth, one level down: the model grows by adding
statements, and the generator grows by adding mappings.

## Is it really domain-agnostic?

Mostly. The generator and the classifier contain no knowledge of fever. Two
limits remain:

- The vocabulary for conditions and tables has the `imci:` prefix. The terms
  are generic (a condition, a table, a row), but their names still carry the
  demo's name.
- Two messages in the application still name fever, for example "the fever
  chart does not apply". They belong in the model.

A second domain would be the real test: a new Turtle file, the same generator,
the same application. Nothing in the generator should stop it, but this
article does not show it.

## How we'd know it's wrong

- The generator grows branches for special cases of one domain.
- The vocabulary for conditions grows into a programming language that only
  engineers can read.
- Someone edits a generated file by hand, and the change is lost at the next
  generation.
- Too much of the knowledge needs features that the generated formats cannot
  express, and ends up in application code.

---

*The ideas and arguments in this article are my own. An AI assistant (Claude)
helped with drafting, editing and fact-checking. The example is adapted from
the WHO digital adaptation kit for child health (CC BY-NC-SA 3.0 IGO); WHO did
not create the adaptation and is not responsible for it.*
