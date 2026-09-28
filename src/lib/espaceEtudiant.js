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

/** Onglet « M'entraîner » de l'espace Carrière. */
export function urlEntrainement(env) {
  return `${urlEspaceEtudiant(env)}/candidat?tab=entrainement`;
}

/** Route du simulateur d'entretien du générateur. */
export const ROUTE_SIMULATEUR = '/entretien';

/** Modules de l'accueil : sans le simulateur en version école. */
export function modulesAccueil(modules, isEcole = IS_ECOLE) {
  return isEcole ? modules.filter((m) => m.route !== ROUTE_SIMULATEUR) : modules;
}
