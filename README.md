# check-eu-bindings

Ce repo recense les Implementation Guides (IG) FHIR publiés par HL7 Europe, en vue d'analyser les *bindings* (`ElementDefinition.binding` vers des ValueSets) qu'ils définissent.

## IG HL7 Europe

| IG | Statut | Repo GitHub | Publication |
|---|---|---|---|
| HL7 Europe Extensions | STU 1.3 (R5) | [hl7-eu/extensions](https://github.com/hl7-eu/extensions) | https://hl7.eu/fhir/extensions/ |
| Base and Core Profiles | STU 2.0 | [hl7-eu/base](https://github.com/hl7-eu/base) | https://hl7.eu/fhir/base/ |
| Laboratory Report | STU 2.0 | [hl7-eu/laboratory](https://github.com/hl7-eu/laboratory) | https://hl7.eu/fhir/laboratory/ |
| Medication Prescription and Dispense | STU 1.0 | [hl7-eu/mpd](https://github.com/hl7-eu/mpd) | https://hl7.eu/fhir/mpd/ |
| EU Health Data API | ballot 1.0.0 | [euridice-org/eu-health-data-api](https://github.com/euridice-org/eu-health-data-api) | https://hl7.eu/fhir/health-data-api/1.0.0-ballot/en/ |
| Imaging Report | ballot 1.0.0 | [hl7-eu/imaging-r4](https://github.com/hl7-eu/imaging-r4) | https://hl7.eu/fhir/imaging/1.0.0-ballot/en/ |
| Common Cancer Model | ballot 1.0.0 | [hl7-eu/cancer-common](https://github.com/hl7-eu/cancer-common) | https://hl7.eu/fhir/cancer-common/1.0.0-ballot/ |
| Hospital Discharge Report | ballot 0.1.0 | [hl7-eu/hdr](https://github.com/hl7-eu/hdr) | https://hl7.eu/fhir/hdr/ |
| European Patient Summary | ballot 1.0.0 | [hl7-eu/eps](https://github.com/hl7-eu/eps) | https://hl7.eu/fhir/eps/1.0.0-ballot/ |

> Note : le code source de l'IG *EU Health Data API* se trouve sur `euridice-org/eu-health-data-api` et non sur `hl7-eu/health-data-api`, qui n'est qu'un pointeur. L'IG *Extensions* est la dernière version publiée (R5) ; les 8 autres sont en R4.

## Site des bindings

Un site statique, généré à partir des packages FHIR publiés de ces IG, présente pour chaque IG un tableau *Profil × Élément × Force du binding × ValueSet × Terminologies (CodeSystem)*, ainsi qu'une page de résumé listant toutes les terminologies utilisées à travers les IG.

- Site publié : https://nriss.github.io/check-eu-bindings/
- Génération locale : `npm install && npm run generate` (sortie dans `_site/`)
- Génération sur GitHub : déclencher manuellement le workflow **Generate bindings site** (onglet *Actions* du repo, `workflow_dispatch`)

Le code du générateur est dans `scripts/` (Node.js, via [`fhir-package-loader`](https://github.com/FHIR/fhir-package-loader)).
