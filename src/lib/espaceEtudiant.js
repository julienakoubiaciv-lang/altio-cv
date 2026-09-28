/**
 * espaceEtudiant — liens de la version école vers l'espace étudiant du CRM.
 *
 * Un seul simulateur d'entretien : en version école, l'élève s'entraîne dans
 * son espace étudiant (onglet « M'entraîner »), où sa progression est
 * enregistrée dans la base du CRM et suivie par l'école. Le simulateur du
 * générateur garde la sienne dans le navigateur (localStorage) : deux
 * simulateurs aux progressions séparées, l'une invisible de l'école. La
 * version grand public, elle, garde son simulateur.
 */
import { IS_ECOLE } from './appMode';

export const URL_ESPACE_ETUDIANT_DEFAUT = 'https://espace-etudiant.altio-wave.com';

/** Adresse de l'espace étudiant — surchargeable par `VITE_ESPACE_ETUDIANT_URL`. */
export function urlEspaceEtudiant(env = import.meta.env.VITE_ESPACE_ETUDIANT_URL) {
  const url = String(env ?? '').trim().replace(/\/+$/, '');
  return url || URL_ESPACE_ETUDIANT_DEFAUT;
}

/** Accueil de l'espace Carrière : retour depuis le générateur. */
export function urlCarriere(env) {
  return `${urlEspaceEtudiant(env)}/candidat?tab=carriere`;
}

/** Onglet « M'entraîner » de l'espace Carrière. */
export function urlEntrainement(env) {
  return `${urlEspaceEtudiant(env)}/candidat?tab=entrainement`;
}

/** Route du simulateur d'entretien du générateur. */
export const ROUTE_SIMULATEUR = '/entretien';

/**
 * Modules masqués en version école, parce que l'espace étudiant les porte
 * déjà : le simulateur (« M'entraîner »), et la progression gamifiée
 * (parcours XP, bilan d'employabilité) — une seule jauge pour l'élève,
 * « Prêt pour l'alternance » dans son espace.
 */
export const ROUTES_MASQUEES_ECOLE = [ROUTE_SIMULATEUR, '/parcours', '/diagnostic'];

/** Modules de la préparation : sans ceux que l'espace étudiant porte, en version école. */
export function modulesAccueil(modules, isEcole = IS_ECOLE) {
  return isEcole ? modules.filter((m) => !ROUTES_MASQUEES_ECOLE.includes(m.route)) : modules;
}
