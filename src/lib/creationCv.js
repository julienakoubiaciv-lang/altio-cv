/**
 * creationCv — règles de l'assistant « Nouveau CV » de la version école
 * (pages/GenerateEcole.jsx) et du guide de complétude de l'éditeur.
 * Fonctions pures, testées (creationCv.test.js).
 *
 * L'élève part d'un CV existant (import) ou de zéro (questions guidées).
 * Son identité, ses coordonnées et sa formation viennent de sa fiche du CRM
 * (lib/ficheEleve.js) ; ce qu'il saisit est mis en forme par l'IA, qui
 * reformule sans rien inventer.
 */
import { calcBananaScore } from './bananaScore';

// ── Pré-remplissage ──────────────────────────────────────────────────────────

/** Identité et contact depuis la fiche élève (jamais la date de naissance). */
export function prefillDepuisFiche(fiche, formationTitre) {
  const t = (v) => (typeof v === 'string' ? v.trim() : '');
  return {
    prenom: t(fiche?.first_name),
    nom: t(fiche?.last_name),
    email: t(fiche?.email),
    telephone: t(fiche?.phone),
    ville: t(fiche?.city),
    linkedin: t(fiche?.linkedin_url),
    formation: t(formationTitre),
  };
}

const normaliser = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ').split(' ').filter((m) => m.length > 2 && !['bac', 'niveau', 'titre', 'pro'].includes(m));

/**
 * Idées de postes pour la formation de l'école : la formation du catalogue
 * (`FORMATIONS`) dont l'intitulé partage le plus de mots avec elle (au moins
 * deux), puis ses postes types (`POSTES`). Aucune correspondance : aucune idée.
 */
export function suggestionsPostes(formationTitre, formations, postes) {
  const cible = new Set(normaliser(formationTitre));
  if (!cible.size) return [];
  let meilleur = null;
  let score = 1;
  for (const f of formations || []) {
    const commun = normaliser(f.l).filter((m) => cible.has(m)).length;
    if (commun > score) { meilleur = f; score = commun; }
  }
  return meilleur ? (postes?.[meilleur.v] || []).slice(0, 4) : [];
}

// ── Annonce ──────────────────────────────────────────────────────────────────

const MOTS_VIDES = new Set(['de','le','la','les','du','des','un','une','en','et','ou','au','aux','par','pour','dans','sur','avec','son','sa','ses','ce','cette','ces','qui','que','dont','est','sont','être','avoir','faire','nous','vous','ils','notre','votre','leur','plus','très','bien','tout','tous','peut','doit','sera','seront','pas','ne','ni','aussi','mais','donc','car','si','comme','entre','sous','sans','chez','vers','contre','après','avant','depuis','même','autre','autres','chaque','quelques','plusieurs','peu','beaucoup','trop','fois','ici','alors','puis','enfin','déjà','encore','toujours','jamais','souvent','parfois','type','profil','recherche','recherchons','poste','candidat','candidature','contrat','entreprise','société','missions','mission','activités','expérience','formation','diplôme','minimum','ans','idéalement','alternance','alternant','alternante']);

/** Les mots les plus fréquents d'une annonce (hors mots vides), 10 au plus. */
export function motsClesAnnonce(texte) {
  const mots = String(texte || '').toLowerCase()
    .replace(/[^a-zàâäéèêëïîôùûüÿçœæ\s/-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !MOTS_VIDES.has(w));
  const freq = new Map();
  mots.forEach((w) => freq.set(w, (freq.get(w) || 0) + 1));
  return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([w]) => w);
}

/** Une annonce exploitable : assez longue pour en tirer quelque chose. */
export const annonceUtilisable = (texte) => String(texte || '').trim().length > 30;

// ── Saisie de l'élève ────────────────────────────────────────────────────────

/** Nouvelle expérience vide. */
export const experienceVide = () => ({ poste: '', lieu: '', periode: '', missions: '' });
/** Nouveau diplôme vide. */
export const diplomeVide = () => ({ titre: '', annee: '', etablissement: '' });

const rempli = (v) => typeof v === 'string' && v.trim().length > 0;

/** Les lignes d'expérience réellement remplies (au moins un intitulé ou des missions). */
export function experiencesRemplies(experiences) {
  return (experiences || []).filter((e) => rempli(e?.poste) || rempli(e?.missions));
}

export function diplomesRemplis(diplomes) {
  return (diplomes || []).filter((d) => rempli(d?.titre));
}

/**
 * Ce que l'élève a saisi, en texte pour l'IA. Tout vient de lui : l'IA ne
 * fait que mettre en forme.
 */
export function saisieEnTexte(s) {
  const l = [];
  const id = s.identite || {};
  l.push(`Prénom : ${id.prenom || ''}`, `Nom : ${id.nom || ''}`);
  if (id.email) l.push(`Email : ${id.email}`);
  if (id.telephone) l.push(`Téléphone : ${id.telephone}`);
  if (id.ville) l.push(`Ville : ${id.ville}`);
  if (id.linkedin) l.push(`LinkedIn : ${id.linkedin}`);
  if (id.formation) l.push(`Formation en cours (école) : ${id.formation}, en alternance`);
  if (s.poste) l.push(`Poste visé : ${s.poste}`);
  const exps = experiencesRemplies(s.experiences);
  if (exps.length) {
    l.push('', 'Expériences :');
    exps.forEach((e) => l.push(`- ${e.poste || 'Expérience'}${e.lieu ? ` — ${e.lieu}` : ''}${e.periode ? ` (${e.periode})` : ''}${rempli(e.missions) ? ` : ${e.missions.trim()}` : ''}`));
  } else if (s.sansExperience) {
    l.push('', "Expériences : aucune pour l'instant (ne pas en inventer).");
  }
  const dips = diplomesRemplis(s.diplomes);
  if (dips.length) {
    l.push('', 'Diplômes précédents :');
    dips.forEach((d) => l.push(`- ${d.titre}${d.annee ? ` (${d.annee})` : ''}${d.etablissement ? ` — ${d.etablissement}` : ''}`));
  }
  if ((s.langues || []).length) l.push('', `Langues : ${s.langues.join(', ')}`);
  if ((s.interets || []).length) l.push(`Centres d'intérêt : ${s.interets.join(', ')}`);
  return l.join('\n');
}

// ── Étapes ───────────────────────────────────────────────────────────────────

/** Peut-on passer à l'étape suivante ? Renvoie `null` si oui, sinon la raison à afficher. */
export function blocageEtape(etape, s) {
  if (etape === 1) {
    if (!s.depart) return 'Choisis ton point de départ.';
    if (s.depart === 'import' && !s.fichier) return 'Importe ton CV (PDF ou photo) pour continuer.';
    return null;
  }
  if (etape === 2) {
    if (!rempli(s.identite?.prenom) || !rempli(s.identite?.nom)) return 'Indique ton prénom et ton nom.';
    if (!rempli(s.poste)) return 'Indique le poste que tu vises.';
    if (s.depart === 'zero' && !experiencesRemplies(s.experiences).length && !s.sansExperience && !diplomesRemplis(s.diplomes).length) {
      return 'Ajoute au moins une expérience ou un diplôme, ou coche « Je n’ai encore aucune expérience ».';
    }
    return null;
  }
  return null;
}

/** Le récapitulatif de l'étape « Générer ». */
export function recapitulatif(s) {
  const id = s.identite || {};
  const n = (k, un, plusieurs) => (k ? `${k} ${k > 1 ? plusieurs : un}` : null);
  const contenu = s.depart === 'import'
    ? `Ton CV importé : ${s.fichier?.name || 'fichier'}`
    : [
        n(experiencesRemplies(s.experiences).length, 'expérience', 'expériences') || (s.sansExperience ? 'aucune expérience pour l’instant' : null),
        n(diplomesRemplis(s.diplomes).length, 'diplôme', 'diplômes'),
        n((s.langues || []).length, 'langue', 'langues'),
        n((s.interets || []).length, 'centre d’intérêt', 'centres d’intérêt'),
      ].filter(Boolean).join(', ');
  return [
    `${[id.prenom, id.nom].filter(Boolean).join(' ')}${id.ville ? ` · ${id.ville}` : ''}`,
    id.formation ? `${id.formation} en tête des formations` : null,
    s.poste ? `Poste visé : ${s.poste}` : null,
    contenu || null,
    s.offre?.texte && annonceUtilisable(s.offre.texte) ? `Adapté à l’offre${s.offre.titre ? ` ${s.offre.titre}` : ''}` : 'CV général, sans offre précise',
  ].filter(Boolean);
}

// ── Consigne pour l'IA ───────────────────────────────────────────────────────

export function consigneCreation({ avecAnnonce }) {
  return `Tu mets en forme le CV d'un élève en alternance. Retourne UNIQUEMENT un objet JSON valide, sans markdown ni backticks.

STRUCTURE JSON EXACTE :
{
  "prenom": "string", "nom": "string", "telephone": "string ou vide", "email": "string ou vide",
  "adresse": "ville ou vide", "linkedin": "url ou vide",
  "poste": "INTITULÉ EN MAJUSCULES",
  "accroche": "4 à 6 lignes à la 1re personne : formation en alternance, poste visé, atouts réels",
  "experiences": [{"poste":"","entreprise":"","lieu":"","periode":"","missions":[]}],
  "formations": [{"titre":"","etablissement":"","periode":"","isAltio":false}],
  "competences": {"techniques":[],"comportementales":[],"outils":[]},
  "langues": [{"langue":"","niveau":""}],
  "centresInteret": []${avecAnnonce ? ',\n  "matchAnalysis": {"matched":[],"missing":[],"score":0,"adaptations":"","formationFit":""}' : ''}
}

RÈGLES :
- N'INVENTE RIEN : aucune expérience, entreprise, date, diplôme, langue ou compétence que l'élève n'a pas donnés. Un champ inconnu reste vide.
- Reprends EXACTEMENT prénom, nom, email, téléphone, ville et LinkedIn fournis.
- Reformule chaque expérience en 2 à 4 missions qui commencent par un verbe d'action, à partir de ce que l'élève a écrit.
- Un job d'été, du bénévolat ou un projet d'école est une vraie expérience : mets-le en valeur honnêtement.
- La formation en cours de l'école est la PREMIÈRE formation, avec "isAltio": true.
- Compétences : déduis seulement celles que les expériences et la formation montrent clairement.
- Sans aucune expérience, l'accroche s'appuie sur la formation, la motivation et les centres d'intérêt.
- Expériences et formations dans l'ordre antéchronologique.${avecAnnonce ? `
- ANNONCE : reprends son vocabulaire quand c'est vrai pour l'élève, sans jamais ajouter ce qu'il n'a pas. Remplis "matchAnalysis".` : ''}`;
}

/** Le JSON du CV dans la réponse de l'IA (avec ou sans ```json autour). Lève une erreur lisible sinon. */
export function lireJsonCv(texte) {
  const brut = String(texte || '').trim().replace(/^```json?\s*/, '').replace(/```\s*$/, '').trim();
  try {
    return JSON.parse(brut);
  } catch {
    const debut = brut.indexOf('{');
    const fin = brut.lastIndexOf('}');
    if (debut >= 0 && fin > debut) {
      try { return JSON.parse(brut.slice(debut, fin + 1)); } catch { /* message ci-dessous */ }
    }
    throw new Error('La génération n’a pas abouti. Réessaie dans un instant.');
  }
}

/**
 * Remet dans le CV ce qui vient de la fiche et de l'élève, quoi que l'IA ait
 * renvoyé : identité exacte, poste visé, formation de l'école en tête.
 */
export function completerCvData(cvData, s) {
  const d = { ...(cvData || {}) };
  const id = s.identite || {};
  if (id.prenom) d.prenom = id.prenom;
  if (id.nom) d.nom = id.nom;
  if (id.email) d.email = id.email;
  if (id.telephone) d.telephone = id.telephone;
  if (id.ville && !d.adresse) d.adresse = id.ville;
  if (id.linkedin && !d.linkedin) d.linkedin = id.linkedin;
  const poste = (d.poste || s.poste || '').trim();
  if (poste) d.poste = poste.toUpperCase();
  d.formations = Array.isArray(d.formations) ? d.formations : [];
  if (id.formation && !d.formations.some((f) => f?.isAltio)) {
    d.formations.unshift({ titre: id.formation, etablissement: '', periode: 'En cours, en alternance', isAltio: true });
  }
  return d;
}

// ── Guide de complétude de l'éditeur ─────────────────────────────────────────

/** Rubrique de l'éditeur (EditorAtelier, `STEPS`) où se corrige chaque règle. */
const RUBRIQUE = {
  prenom: 'identite', nom: 'identite', email: 'identite', telephone: 'identite', adresse: 'identite',
  poste: 'identite', accrocheShort: 'identite', accrocheFull: 'identite', photo: 'identite',
  exp1: 'experiences', exp2: 'experiences', expMissions: 'experiences', expPeriodes: 'experiences',
  formAltio: 'formations', formExtra: 'formations',
  compTech3: 'competences', compTech6: 'competences', compSoft: 'competences', compOutils: 'competences',
  langues: 'langues', interets: 'interets',
};

/**
 * Complétude (règles de l'espace étudiant) et les 3 actions qui la font le
 * plus monter, chacune avec son gain en points de pourcentage et la
 * rubrique de l'éditeur où la faire.
 */
export function guideCompletude(cvData, photo) {
  const { pct, max, tips } = calcBananaScore(cvData, { photo: Boolean(photo) }, { ecole: true });
  return {
    pct,
    actions: tips.map((t) => ({ id: t.id, texte: t.tip, gain: Math.max(1, Math.round((t.pts * 100) / max)), rubrique: RUBRIQUE[t.id] || 'identite' })),
  };
}
