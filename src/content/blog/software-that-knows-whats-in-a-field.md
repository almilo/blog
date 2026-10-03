---
title: 'Software that knows, in detail: what''s in a field?'
description: 'One input field in an ontology, from bare concept to translated question with a rule: what an application keeps in ten places, stated once.'
pubDate: 2026-10-04
tags: ['software-that-knows', 'ontology', 'shacl']
series: 'Software that knows, in detail'
image: '/images/software-that-knows/one-field-one-source.png'
draft: false
---

*A companion to [part 5](https://almilo.com/blog/software-that-knows-from-guideline-to-application/) of the series "Software that knows".*

An application usually keeps what it knows about a single input field in about
ten places: a glossary, validation code, resource files for each language,
constants for clinical thresholds, business logic, a synonym list, release
notes. Each copy has to be updated by hand when something changes. This article
puts all of it in one file, for one field, and shows what an ontology adds: one
place for each fact, one format that every tool can read, and room for new kinds
of knowledge without breaking what already uses the model.

## Why one field

One field is enough to show what an ontology adds. The field is the axillary
temperature (taken under the armpit) from the imci-fever application of
[part 5](https://almilo.com/blog/software-that-knows-from-guideline-to-application/),
built from the WHO digital adaptation kit (DAK) for child health.

In 18 small steps, the field grows from a bare concept to a translated question
with a clinical rule. Each step adds one kind of knowledge that an application
usually keeps somewhere else; the table at the end shows where. A last part
shows that the model can be checked like any other data.

![Left, a usual application: the knowledge about the axillary temperature is copied into ten places, from a glossary and validation code to resource files, threshold constants, business logic, a synonym list and release notes. Right, a knowledge model: one box for the axillary temperature holds its concept and source, question and limits, translations, clinical ranges and rule, words in notes and versions, and the form, validation, rules, note interpreter, documents and checks all read from it.](/images/software-that-knows/one-field-one-source.png)

Not every step is used by imci-fever today. That is part of the point: the
model can hold more than the application reads yet, and nothing that reads it
breaks. Every step only **adds** statements; nothing earlier is removed or
changed (a *monotonic* extension).

For each step: what it adds, and whether imci-fever uses it today ("ignored"
means it does not read it yet). Prefixes are omitted. Lines marked `# +` are
new.

## Step 0: the concept in words

DAK entry `CHE.B6.DE01`: the child's temperature taken under the armpit, in
°C. For children from 2 months to 5 years:

- Below 35.5: hypothermia.
- 35.5 to 37.4: normal.
- 37.5 to 38.4: fever.
- 38.5 and above: high fever.

## Part A: the concept, with no form

### Step 1: a name

```turtle
imci:axillaryTemperature a rdf:Property ;                 # +
  rdfs:label "axillary temperature"@en .                  # +
```

An identifier that other models can point to. The label has a language tag
from the start, so adding languages later (step 12) is a pure addition.

*imci-fever: ignored.*

### Step 2: a definition

```turtle
  skos:definition "The child's temperature taken under the armpit, in degrees Celsius."@en .   # +
```

*imci-fever: ignored.*

### Step 3: the source

```turtle
  prov:wasDerivedFrom dak:CHE.B6.DE01 .                   # +
```

On the concept, the source holds wherever the concept is used.

*imci-fever: ignored here; it records sources on the form questions.*

### Step 4: related concepts

```turtle
imci:bodyTemperature a rdf:Property ; rdfs:label "body temperature"@en .    # +

imci:axillaryTemperature
  rdfs:subPropertyOf imci:bodyTemperature ;               # +
  skos:exactMatch <https://loinc.org/8328-7/> .           # + LOINC: axillary temperature
```

The model's rectal temperature field, which measures about 0.5 °C higher,
also becomes a body temperature. A rule can use that (step 16).
The code links the concept to a standard terminology.

*imci-fever: ignored.*

### Step 5: values and unit

```turtle
  rdfs:range xsd:decimal ;                                # +
  qudt:hasUnit unit:DEG_C .                               # +
```

*imci-fever: ignored. The unit is only "(°C)" in the label text.*

## Part B: the question in a form

### Step 6: the field exists

```turtle
imci:AssessmentShape sh:property [
  sh:path imci:axillaryTemperature ;                      # +
  sh:group imci:FeverTab ; sh:order 2                     # +
] .
```

Second question on the Fever tab. The generator stops with "no type": it does
not guess.

*imci-fever: used.*

### Step 7: the data type

```turtle
  sh:datatype xsd:decimal ;                               # +
```

A number input.

*imci-fever: used.*

### Step 8: plausibility limits

```turtle
  sh:minInclusive 30 ; sh:maxInclusive 44 ;               # +
```

These catch typing errors, such as 375 for 37.5. They do not say what a fever
is; that comes in step 14. A first change in behaviour: values accepted before
are now errors, although the step only added statements.

*imci-fever: used.*

### Step 9: one value

```turtle
  sh:maxCount 1 ;                                         # +
```

Optional, so no `sh:minCount`: without a thermometer, "hot to touch" replaces
the measurement.

*imci-fever: ignored.*

### Step 10: the question's label

```turtle
  sh:name "Axillary temperature (°C)"@en ;                # +
```

Step 1 names the concept; this is the text of the question.

*imci-fever: used.*

### Step 11: help text

```turtle
  sh:description "Taken under the armpit."@en ;           # +
```

*imci-fever: used.*

### Step 12: translations

```turtle
  sh:name "Axillary temperature (°C)"@en , "Température axillaire (°C)"@fr ,        # +
          "Temperatura axilar (°C)"@es , "درجة الحرارة الإبطية (°م)"@ar ;          # +
  sh:description "Taken under the armpit."@en , "Prise sous l'aisselle."@fr ,        # +
                 "Tomada debajo de la axila."@es , "تُقاس تحت الإبط."@ar ;            # +
```

The translations sit next to the question, and a check can refuse a question
without them. Arabic reads right to left; RDF 1.2 can state that in the data
(`@ar--rtl`). The translations are illustrative, not reviewed.

*imci-fever: not yet; it is in English.*

### Step 13: when to ask

```turtle
  imci:shownWhen [ imci:not [ imci:field imci:thermometerNotAvailable ;     # +
                              imci:equals true ] ] ;                        # +
```

The question disappears without a thermometer, and an earlier answer no longer
counts. Again, only statements were added, yet the form changed. Monotonic
means that earlier statements stay true, not that the application stays the
same.

The field also decides other questions: a value of 37.5 °C or more means fever,
which reveals the fever questions and a whole tab.

*imci-fever: the condition format is used; this condition is not (the
temperature is always asked).*

The question, complete:

```turtle
imci:AssessmentShape sh:property [
  sh:path imci:axillaryTemperature ;
  sh:group imci:FeverTab ; sh:order 2 ;
  sh:datatype xsd:decimal ;
  sh:minInclusive 30 ; sh:maxInclusive 44 ;
  sh:maxCount 1 ;
  sh:name "Axillary temperature (°C)"@en , "Température axillaire (°C)"@fr ,
          "Temperatura axilar (°C)"@es , "درجة الحرارة الإبطية (°م)"@ar ;
  sh:description "Taken under the armpit."@en , "Prise sous l'aisselle."@fr ,
                 "Tomada debajo de la axila."@es , "تُقاس تحت الإبط."@ar ;
  imci:shownWhen [ imci:not [ imci:field imci:thermometerNotAvailable ; imci:equals true ] ] ;
  prov:wasDerivedFrom dak:CHE.B6.DE01
] .
```

## Part C: what a measured value means

In imci-fever, the meaning sits inside conditions: "axillary temperature at
least 37.5" is fever, and a second condition repeats it for the other
temperature field with 38.0. The next steps turn this into data and one rule.

### Step 14: the clinical ranges, as data

```turtle
imci:TemperatureBand a rdfs:Class .                                             # +

imci:Hypothermia a imci:TemperatureBand ; imci:below 35.5 ;                     # +
  rdfs:label "Hypothermia"@en , "Hypothermie"@fr , "Hipotermia"@es , "انخفاض حرارة الجسم"@ar .
imci:Normal a imci:TemperatureBand ; imci:from 35.5 ; imci:below 37.5 ;         # +
  rdfs:label "Normal"@en , "Normale"@fr , "Normal"@es , "طبيعية"@ar .
imci:Fever a imci:TemperatureBand , imci:FeverBand ; imci:from 37.5 ; imci:below 38.5 ;   # +
  rdfs:label "Fever"@en , "Fièvre"@fr , "Fiebre"@es , "حمّى"@ar .
imci:HighFever a imci:TemperatureBand , imci:FeverBand ; imci:from 38.5 ;       # +
  rdfs:label "High fever"@en , "Forte fièvre"@fr , "Fiebre alta"@es , "حمّى شديدة"@ar .
```

"37.5 °C is a fever" is now a fact with a name in four languages (and a
source, `dak:CHE.B6.DE01`, on each range), not a number inside a condition.

*imci-fever: not yet.*

### Step 15: other measurement sites

```turtle
imci:axillaryTemperature imci:offsetToAxillary 0.0 .                            # +
imci:rectalTemperature imci:offsetToAxillary -0.5 ;                             # +
  rdfs:subPropertyOf imci:bodyTemperature ; prov:wasDerivedFrom dak:CHE.B6.DE04 .
```

DAK entry `CHE.B6.DE04` gives the ranges for the armpit and the difference for
any other site.

*imci-fever: not yet.*

### Step 16: one rule

```turtle
imci:AssessmentShape sh:rule [ a sh:SPARQLRule ; sh:prefixes imci: ;            # +
  sh:construct """
    CONSTRUCT { $this imci:temperatureBand ?band }
    WHERE {
      $this ?site ?value .
      ?site rdfs:subPropertyOf imci:bodyTemperature ; imci:offsetToAxillary ?offset .
      BIND (?value + ?offset AS ?axillary)
      ?band a imci:TemperatureBand .
      OPTIONAL { ?band imci:from ?from }  OPTIONAL { ?band imci:below ?below }
      FILTER ((!BOUND(?from) || ?axillary >= ?from) && (!BOUND(?below) || ?axillary < ?below))
    }""" ] ,
  [ a sh:SPARQLRule ; sh:prefixes imci: ;                                        # +
    sh:construct """
      CONSTRUCT { $this imci:fever true }
      WHERE { $this imci:temperatureBand/a imci:FeverBand }""" ] .
```

Standard SPARQL, in the rule format from
[part 4](https://almilo.com/blog/software-that-knows-where-knowledge-sits/).
One rule covers every measurement site: a new site needs an offset, not a rule.
The thresholds 37.5 and 38.0 now follow from the data, and the result has
labels in four languages ("Temperature: high fever"). Open point: if two sites
disagree, the rule gives two ranges. Which counts is a clinical decision.

*imci-fever: not yet; it uses its own conditions.*

## Part D: words and versions

### Step 17: words used in notes

```turtle
imci:axillaryTemperature
  skos:altLabel "armpit"@en , "under the arm"@en , "sous l'aisselle"@fr ,       # +
                "en la axila"@es , "تحت الإبط"@ar ;                             # +
  skos:hiddenLabel "T ax"@en .                                                  # +
```

[Part 6](https://almilo.com/blog/software-that-knows-the-knowledge-model-as-grounding/)
read free-text notes with these words. A hidden label is an abbreviation to
recognise but never to show.

*imci-fever: used, in English.*

### Step 18: versions

```turtle
imci:axillaryTemperature dct:modified "2026-10-03"^^xsd:date .                  # +
imci:Fever2027 a imci:TemperatureBand , imci:FeverBand ;                        # +
  prov:wasRevisionOf imci:Fever ; imci:from 37.8 .        # example values
imci:Fever owl:deprecated true ; dct:isReplacedBy imci:Fever2027 .              # +
```

When the source changes, the old range is marked as replaced, not deleted. Old
assessments keep their meaning.

*imci-fever: ignored.*

## The build-up at a glance

| Step | Aspect | Main terms | Standard | imci-fever today |
| --- | --- | --- | --- | --- |
| 1–3 | Concept, definition, source | `rdfs:label`, `skos:definition`, `prov:wasDerivedFrom` | RDFS, SKOS, PROV-O | Ignored |
| 4 | Related concepts | `rdfs:subPropertyOf`, `skos:exactMatch` | RDFS, SKOS | Ignored |
| 5 | Values and unit | `rdfs:range`, `qudt:hasUnit` | RDFS, QUDT | Ignored (unit in the label) |
| 6–8 | Field, type, plausibility | `sh:path`, `sh:datatype`, `sh:minInclusive` | SHACL | Used |
| 9 | One value | `sh:maxCount` | SHACL | Ignored |
| 10–11 | Label and help | `sh:name`, `sh:description` | SHACL | Used (English) |
| 12 | Translations | language tags | RDF | Not yet |
| 13 | When asked | `imci:shownWhen` | Own vocabulary | Used |
| 14–15 | Clinical ranges, measurement sites | data | Own vocabulary | Not yet |
| 16 | Rule | `sh:rule`, `sh:SPARQLRule` | SHACL-AF, SPARQL | Not yet |
| 17 | Words in notes | `skos:altLabel`, `skos:hiddenLabel` | SKOS | Used (English) |
| 18 | Versions | `prov:wasRevisionOf`, `owl:deprecated` | PROV-O, OWL | Ignored |

- **Two kinds of limits.** Plausibility limits (step 8) belong to the form. The
  clinical ranges (steps 14–16) belong to the knowledge.
- **Additions can change behaviour.** Steps 8, 13 and 16 only add statements,
  yet the application changes after each.
- **Relations save rules.** One `rdfs:subPropertyOf` and a table of offsets let
  one rule serve every measurement site.

## One file, many kinds of knowledge

Where an application usually keeps what these steps wrote down:

| Knowledge | Step | Usual place in an application |
| --- | --- | --- |
| Concept and definition | 1–2 | A glossary or a wiki, if anywhere |
| Source | 3 | A ticket or a code comment |
| Link to a terminology | 4 | A mapping table in an integration layer |
| Unit | 5 | A variable name or a label |
| Question, type, limits | 6–9 | UI code, validation code, database schema |
| Labels and help | 10–11 | UI code or resource files |
| Translations | 12 | One resource file per language |
| When to ask | 13 | UI code |
| Clinical ranges | 14–15 | Constants in code, copied into reports |
| Rule | 16 | Business logic in code |
| Words in notes | 17 | A search index or a synonym list |
| Versions | 18 | Git history and release notes |

Twelve kinds of knowledge in about ten places, each updated by hand
([part 4](https://almilo.com/blog/software-that-knows-where-knowledge-sits/)
followed one threshold through them). Three properties let an ontology hold
them all:

- **One building block.** Each item is a statement about a named thing: "this
  is a body temperature", "the French label is…", "fever starts at 37.5". Any
  tool that reads statements (validator, rule engine, generator, agent) reads
  all of it.
- **One place for each fact.** 37.5 is stated once. The form, the rule, the
  translations, the documents and the checks refer to it. Change it once, and
  everything derived follows.
- **Open to new kinds of knowledge.** The unit, the languages and the history
  each needed only a new property: no new table, file format or migration.
  Anything that can be named can be described and linked. Standard vocabularies
  cover much of it: SKOS for terms, PROV-O for sources, QUDT for units,
  OWL-Time for time, GeoSPARQL for places (the malaria risk of an area), the
  W3C Organization Ontology for roles, Schema.org for everyday things. Models
  that share names merge by putting their statements together.

Potentially anything, but not everything belongs there. An ontology describes
meaning and relations. Millions of transactions, heavy computation and screen
layout stay in their own tools; the ontology describes what their data means,
as part 4 showed for existing databases mapped with R2RML.

## Checking the model

The model is data, so it can be checked like data, with the same standards, on
every change and before anything is generated.

**Structure.** SHACL shapes can check the model itself. Every question has one
label per language, a source, and a type or a list of choices (the "no type"
error of step 6, found before the generator runs):

```turtle
check:QuestionShape a sh:NodeShape ;
  sh:targetObjectsOf sh:property ;
  sh:property [ sh:path sh:name ; sh:languageIn ( "en" "fr" "es" "ar" ) ;
                sh:uniqueLang true ; sh:minCount 4 ] ;
  sh:property [ sh:path prov:wasDerivedFrom ; sh:minCount 1 ] ;
  sh:or ( [ sh:path sh:datatype ; sh:minCount 1 ] [ sh:path sh:in ; sh:minCount 1 ] ) .
```

**Consistency.** SPARQL queries find statements that contradict each other.
This one reports clinical ranges that overlap:

```turtle
check:BandShape a sh:NodeShape ;
  sh:targetClass imci:TemperatureBand ;
  sh:sparql [ sh:prefixes imci: ; sh:message "Overlaps with {?other}." ;
    sh:select """
      SELECT $this ?other WHERE {
        ?other a imci:TemperatureBand . FILTER (?other != $this)
        OPTIONAL { $this imci:from ?from1 }  OPTIONAL { $this imci:below ?below1 }
        OPTIONAL { ?other imci:from ?from2 } OPTIONAL { ?other imci:below ?below2 }
        FILTER ((!BOUND(?below1) || !BOUND(?from2) || ?from2 < ?below1) &&
                (!BOUND(?below2) || !BOUND(?from1) || ?from1 < ?below2))
      }""" ] .
```

The same way: no gaps between the ranges, every range inside the plausibility
limits, every property used by a rule declared in the model (a typo otherwise
makes a rule silently never apply), every cited DAK entry present in the DAK
(imci-fever checks this one in code).

**Behaviour.** Examples are data too: a value and the result the source
expects.

```turtle
check:case1 imci:axillaryTemperature 37.4 ; check:expects imci:Normal .
check:case2 imci:axillaryTemperature 37.5 ; check:expects imci:Fever .
```

Code runs the rules on each example and compares. Values on the limits are
where errors hide. imci-fever already has one test per path through its
decision tables, and rules that must hold for any answers, checked on 3,000
random assessments.

**Change.** Whether a change only adds can be checked mechanically: a statement
in the old version and missing in the new one breaks monotonicity and needs a
person to look at it. W3C RDF Dataset Canonicalization (RDFC-1.0) makes two
versions comparable as plain sets. Because additions can change behaviour, the
old examples are run again: if a result changes, the change is either a fix or
a mistake.

**Limits.** Checks find structural errors, contradictions and broken examples.
Whether 37.5 °C is the right threshold stays with the experts, who read the
model through generated documents
([part 4](https://almilo.com/blog/software-that-knows-where-knowledge-sits/)).
The checks make sure the model says what they approved.

## How we'd know it's wrong

- Models built up in small steps grow beyond what anyone reviews.
- Additions that change behaviour get through without the examples that would
  catch them.
- The shapes that check the model grow as large as the model.
- The knowledge moved into data in part C is harder for experts to read than
  the conditions it replaced.
- Some knowledge proves awkward to state as statements and ends up in code or
  documents again.

---

*The ideas and arguments in this article are my own. An AI assistant (Claude)
helped with drafting, editing and fact-checking. The example is adapted from
the WHO digital adaptation kit for child health (CC BY-NC-SA 3.0 IGO); WHO did
not create the adaptation and is not responsible for it.*
