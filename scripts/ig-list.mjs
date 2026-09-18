// Liste des IG FHIR HL7 Europe couverts par le site (dernière version publiée de chacun).
// `fallbackTgzUrl` : utilisé si le package n'est pas (ou plus) trouvable sur le registre FHIR
// (packages.fhir.org / packages2.fhir.org) — le script télécharge alors directement ce package.tgz.
// `author` et `scope` : repris du `package.json` publié de chaque IG (champs `author`/`description`),
// affichés sur la page "À propos".
export const IG_LIST = [
  {
    id: 'extensions',
    displayName: 'HL7 Europe Extensions',
    packageName: 'hl7.fhir.eu.extensions',
    packageVersion: '1.3.1',
    publicationUrl: 'https://hl7.eu/fhir/extensions/',
    fallbackTgzUrl: 'https://hl7.eu/fhir/extensions/package.tgz',
    githubRepo: 'https://github.com/hl7-eu/extensions',
    author: 'HL7 Europe',
    scope: 'Extensions génériques spécifiées pour le realm européen, utilisées par les autres IG HL7 Europe.'
  },
  {
    id: 'base',
    displayName: 'Base and Core Profiles',
    packageName: 'hl7.fhir.eu.base',
    packageVersion: '2.0.0',
    publicationUrl: 'https://hl7.eu/fhir/base/',
    fallbackTgzUrl: 'https://hl7.eu/fhir/base/package.tgz',
    githubRepo: 'https://github.com/hl7-eu/base',
    author: 'HL7 Europe',
    scope:
      "Profils de base et communs pour le contexte européen (dont la carte européenne d'assurance maladie), servant de fondation aux autres IG."
  },
  {
    id: 'laboratory',
    displayName: 'Laboratory Report',
    packageName: 'hl7.fhir.eu.laboratory',
    packageVersion: '2.0.0',
    publicationUrl: 'https://hl7.eu/fhir/laboratory/',
    fallbackTgzUrl: 'https://hl7.eu/fhir/laboratory/package.tgz',
    githubRepo: 'https://github.com/hl7-eu/laboratory',
    author: 'HL7 Europe',
    scope: 'Représentation du compte-rendu de laboratoire (Laboratory Report) dans le realm européen.'
  },
  {
    id: 'mpd',
    displayName: 'Medication Prescription and Dispense',
    packageName: 'hl7.fhir.eu.mpd',
    packageVersion: '1.0.0',
    publicationUrl: 'https://hl7.eu/fhir/mpd/',
    fallbackTgzUrl: 'https://hl7.eu/fhir/mpd/package.tgz',
    githubRepo: 'https://github.com/hl7-eu/mpd',
    author: 'HL7 Europe',
    scope: 'Représentation de la prescription et de la dispensation de médicaments dans le contexte européen.'
  },
  {
    id: 'health-data-api',
    displayName: 'EU Health Data API',
    packageName: 'hl7.fhir.eu.health-data-api',
    packageVersion: '1.0.0-ballot',
    publicationUrl: 'https://hl7.eu/fhir/health-data-api/1.0.0-ballot/en/',
    fallbackTgzUrl: 'https://hl7.eu/fhir/health-data-api/1.0.0-ballot/package.tgz',
    githubRepo: 'https://github.com/euridice-org/eu-health-data-api',
    author: 'HL7 Europe',
    scope:
      "API FHIR pour l'accès et l'échange de données de santé dans l'espace européen des données de santé (EHDS) ; combine des spécifications IHE (MHD...) et HL7 existantes. Code source maintenu sur le repo du projet Euridice (IHE Europe / HL7 Europe), pas sous l'org GitHub hl7-eu."
  },
  {
    id: 'imaging',
    displayName: 'Imaging Report',
    packageName: 'hl7.fhir.eu.imaging',
    packageVersion: '1.0.0-ballot',
    publicationUrl: 'https://hl7.eu/fhir/imaging/1.0.0-ballot/en/',
    fallbackTgzUrl: 'https://hl7.eu/fhir/imaging/1.0.0-ballot/package.tgz',
    githubRepo: 'https://github.com/hl7-eu/imaging-r4',
    author: 'HL7 Europe',
    scope: "Représentation du compte-rendu d'imagerie (Imaging Report) dans le realm européen, en FHIR R4."
  },
  {
    id: 'cancer-common',
    displayName: 'HL7 Europe Common Cancer Model',
    packageName: 'hl7.fhir.eu.cancer-common',
    packageVersion: '1.0.0-ballot',
    publicationUrl: 'https://hl7.eu/fhir/cancer-common/1.0.0-ballot/',
    fallbackTgzUrl: 'https://hl7.eu/fhir/cancer-common/1.0.0-ballot/package.tgz',
    githubRepo: 'https://github.com/hl7-eu/cancer-common',
    author: 'HL7 Europe',
    scope: 'Modèle commun pour la représentation des données liées au cancer dans le contexte européen.'
  },
  {
    id: 'hdr',
    displayName: 'Hospital Discharge Report',
    packageName: 'hl7.fhir.eu.hdr',
    packageVersion: '0.1.0-ballot',
    publicationUrl: 'https://hl7.eu/fhir/hdr/',
    fallbackTgzUrl: 'https://hl7.eu/fhir/hdr/package.tgz',
    githubRepo: 'https://github.com/hl7-eu/hdr',
    author: 'HL7 Europe',
    scope: "Compte-rendu de sortie d'hospitalisation (Hospital Discharge Report), tel que défini par les lignes directrices eHN."
  },
  {
    id: 'eps',
    displayName: 'European Patient Summary',
    packageName: 'hl7.fhir.eu.eps',
    packageVersion: '1.0.0-ballot',
    publicationUrl: 'https://hl7.eu/fhir/eps/1.0.0-ballot/',
    fallbackTgzUrl: 'https://hl7.eu/fhir/eps/1.0.0-ballot/package.tgz',
    githubRepo: 'https://github.com/hl7-eu/eps',
    author: 'HL7 Europe',
    scope: 'Représentation du résumé patient (Patient Summary) dans le realm européen.'
  }
];
