/**
 * completudeEcole — complétude d'un CV de l'historique en version école, avec
 * les règles de l'espace étudiant du CRM (cf. `calcBananaScore`, option
 * `ecole`) : l'élève voit le même pourcentage dans le générateur et dans son
 * espace, et c'est ce chiffre qui débloque les offres de l'école.
 */
import { calcBananaScore } from './bananaScore';

/** Seuil d'accès aux offres de l'école (même valeur que le CRM, `SEUIL_CV_OFFRES_PCT`). */
export const SEUIL_OFFRES_PCT = 50;

/**
 * `{ pct, conseils }` pour une entrée de l'historique (`data` + `photoUrl`).
 * La photo compte si elle est à côté du contenu (`photoUrl`, format du
 * générateur) ou dedans (`photoPath`, format CRM).
 */
export function completudeCv(entry) {
  const d = entry?.data;
  if (!d || typeof d !== 'object') return { pct: 0, conseils: [] };
  const { pct, tips } = calcBananaScore(d, { photo: Boolean(entry.photoUrl || d.photoPath) }, { ecole: true });
  return { pct, conseils: tips.slice(0, 2).map((t) => t.tip) };
}
