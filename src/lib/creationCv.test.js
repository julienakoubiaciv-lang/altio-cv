import { describe, expect, it } from 'vitest';
import {
  annonceUtilisable, blocageEtape, completerCvData, consigneCreation, experienceVide, guideCompletude,
  lireJsonCv, motsClesAnnonce, prefillDepuisFiche, recapitulatif, saisieEnTexte, suggestionsPostes,
} from './creationCv';

const base = () => ({
  depart: 'zero',
  fichier: null,
  identite: { prenom: 'Léa', nom: 'Martin', email: 'lea@x.fr', telephone: '0600000000', ville: 'Lyon', linkedin: '', formation: 'Bachelor Marketing digital' },
  poste: 'Assistante marketing digital',
  experiences: [{ poste: 'Vendeuse', lieu: 'Magasin, Lyon', periode: 'Été 2025', missions: 'conseil, caisse' }, experienceVide()],
  sansExperience: false,
  diplomes: [{ titre: 'Bac STMG', annee: '2024', etablissement: '' }],
  langues: ['Anglais B2'],
  interets: ['Photographie', 'Handball'],
  offre: null,
});

describe('prefillDepuisFiche', () => {
  it('identité, contact et formation ; jamais la date de naissance', () => {
    const p = prefillDepuisFiche({ first_name: ' Léa ', last_name: 'Martin', email: 'lea@x.fr', phone: null, city: 'Lyon', linkedin_url: null, birth_date: '2004-01-01' }, 'Bachelor');
    expect(p).toEqual({ prenom: 'Léa', nom: 'Martin', email: 'lea@x.fr', telephone: '', ville: 'Lyon', linkedin: '', formation: 'Bachelor' });
    expect(JSON.stringify(p)).not.toContain('2004');
  });
  it('fiche absente : champs vides', () => {
    expect(prefillDepuisFiche(null, null).prenom).toBe('');
  });
});

describe('annonce', () => {
  it('mots-clés : les plus fréquents, sans mots vides', () => {
    const k = motsClesAnnonce('Nous recherchons un alternant marketing : réseaux sociaux, marketing digital, Canva, reporting et reporting hebdo.');
    expect(k[0]).toBe('marketing');
    expect(k).toContain('reporting');
    expect(k).not.toContain('alternant');
  });
  it('annonce utilisable au-delà de 30 caractères', () => {
    expect(annonceUtilisable('court')).toBe(false);
    expect(annonceUtilisable('x'.repeat(31))).toBe(true);
  });
});

describe('blocageEtape', () => {
  it('étape 1 : un point de départ, et un fichier si import', () => {
    expect(blocageEtape(1, { depart: null })).toMatch(/point de départ/);
    expect(blocageEtape(1, { depart: 'import', fichier: null })).toMatch(/Importe/);
    expect(blocageEtape(1, { depart: 'zero' })).toBeNull();
  });
  it('étape 2 : nom, poste, et du contenu quand on part de zéro', () => {
    expect(blocageEtape(2, base())).toBeNull();
    expect(blocageEtape(2, { ...base(), poste: ' ' })).toMatch(/poste/);
    const vide = { ...base(), experiences: [experienceVide()], diplomes: [] };
    expect(blocageEtape(2, vide)).toMatch(/aucune expérience/);
    expect(blocageEtape(2, { ...vide, sansExperience: true })).toBeNull();
    // Un CV importé apporte déjà son contenu.
    expect(blocageEtape(2, { ...vide, depart: 'import', fichier: { name: 'cv.pdf' } })).toBeNull();
  });
});

describe('saisie et récapitulatif', () => {
  it('le texte pour l’IA reprend la saisie, ignore les lignes vides', () => {
    const t = saisieEnTexte(base());
    expect(t).toContain('Vendeuse — Magasin, Lyon (Été 2025) : conseil, caisse');
    expect(t).toContain('Bac STMG (2024)');
    expect(t.match(/^- /gm)).toHaveLength(2);
  });
  it('sans expérience : l’IA est prévenue de ne pas en inventer', () => {
    expect(saisieEnTexte({ ...base(), experiences: [], sansExperience: true })).toMatch(/ne pas en inventer/);
  });
  it('récapitulatif : contenu compté, offre ou CV général', () => {
    const r = recapitulatif(base());
    expect(r).toContain('1 expérience, 1 diplôme, 1 langue, 2 centres d’intérêt');
    expect(r.at(-1)).toBe('CV général, sans offre précise');
    expect(recapitulatif({ ...base(), offre: { titre: 'Agence Nova', texte: 'x'.repeat(40) } }).at(-1)).toBe('Adapté à l’offre Agence Nova');
  });
});

describe('consigne et CV final', () => {
  it('la consigne interdit d’inventer et ne demande l’analyse que avec une annonce', () => {
    expect(consigneCreation({ avecAnnonce: false })).toMatch(/N'INVENTE RIEN/);
    expect(consigneCreation({ avecAnnonce: false })).not.toMatch(/matchAnalysis/);
    expect(consigneCreation({ avecAnnonce: true })).toMatch(/matchAnalysis/);
  });
  it('identité de la fiche imposée, poste en majuscules, formation de l’école en tête', () => {
    const d = completerCvData({ prenom: 'Lea', email: 'autre@x.fr', formations: [{ titre: 'Bac STMG' }] }, base());
    expect(d.prenom).toBe('Léa');
    expect(d.email).toBe('lea@x.fr');
    expect(d.poste).toBe('ASSISTANTE MARKETING DIGITAL');
    expect(d.formations[0]).toMatchObject({ titre: 'Bachelor Marketing digital', isAltio: true });
    expect(d.formations).toHaveLength(2);
  });
});

describe('guideCompletude', () => {
  it('même pourcentage que l’espace étudiant, 3 actions avec gain et rubrique', () => {
    const g = guideCompletude({ prenom: 'Léa', nom: 'Martin', email: 'lea@x.fr', poste: 'X' }, false);
    expect(g.pct).toBe(19);
    expect(g.actions).toHaveLength(3);
    expect(g.actions[0]).toMatchObject({ id: 'exp1', gain: 9, rubrique: 'experiences' });
  });
  it('la photo compte pour 4 points de pourcentage', () => {
    const avec = guideCompletude({ prenom: 'A', nom: 'B', email: 'a@b.fr', poste: 'X' }, true);
    expect(avec.pct).toBe(23);
  });
});

describe('suggestionsPostes', () => {
  const FORMATIONS = [
    { v: 'bachelor-marketing', l: 'Bachelor – Chargé Marketing et Communication' },
    { v: 'tp-assistante-rh', l: 'Bac+2 : TP – Assistante RH' },
  ];
  const POSTES = { 'bachelor-marketing': ['Assistant marketing', 'Chargé de communication', 'Community manager', 'Chef de projet digital', 'Autre'] };
  it('formation de l’école rapprochée du catalogue par les mots communs', () => {
    expect(suggestionsPostes('Bachelor Marketing & Communication digitale', FORMATIONS, POSTES)).toEqual(['Assistant marketing', 'Chargé de communication', 'Community manager', 'Chef de projet digital']);
  });
  it('rien de commun, ou formation inconnue : aucune idée', () => {
    expect(suggestionsPostes('BTS Comptabilité', FORMATIONS, POSTES)).toEqual([]);
    expect(suggestionsPostes('', FORMATIONS, POSTES)).toEqual([]);
  });
});

describe('lireJsonCv', () => {
  it('JSON nu, entouré de ```json, ou avec du texte autour', () => {
    expect(lireJsonCv('{"prenom":"Léa"}').prenom).toBe('Léa');
    expect(lireJsonCv('```json\n{"prenom":"Léa"}\n```').prenom).toBe('Léa');
    expect(lireJsonCv('Voici : {"prenom":"Léa"} fin').prenom).toBe('Léa');
  });
  it('réponse illisible : message pour l’élève', () => {
    expect(() => lireJsonCv('pas de json')).toThrow(/Réessaie/);
  });
});
