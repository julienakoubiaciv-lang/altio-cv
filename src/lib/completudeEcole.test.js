import { describe, expect, it } from 'vitest';
import { SEUIL_OFFRES_PCT, completudeCv } from './completudeEcole';

describe('completudeCv — même calcul que l’espace étudiant du CRM', () => {
  it('sans contenu : 0 %, aucun conseil', () => {
    expect(completudeCv(null)).toEqual({ pct: 0, conseils: [] });
    expect(completudeCv({ data: null })).toEqual({ pct: 0, conseils: [] });
  });

  it('identité seule : 18 points sur 94, soit 19 % (valeur vérifiée côté CRM)', () => {
    const r = completudeCv({ data: { prenom: 'Léa', nom: 'Martin', email: 'lea@x.fr', poste: 'Assistante marketing' } });
    expect(r.pct).toBe(19);
    expect(r.conseils).toHaveLength(2);
    expect(r.conseils[0]).toMatch(/expérience/);
  });

  it('LinkedIn ne compte pas ; la photo vaut 4 points, par photoUrl ou photoPath', () => {
    const base = { prenom: 'A', nom: 'B', email: 'a@b.fr', poste: 'X' };
    expect(completudeCv({ data: { ...base, linkedin: 'https://linkedin.com/in/a' } }).pct).toBe(19);
    // 22 / 94 = 23 %
    expect(completudeCv({ data: base, photoUrl: 'https://x/p.jpg' }).pct).toBe(23);
    expect(completudeCv({ data: { ...base, photoPath: 'p.jpg' } }).pct).toBe(23);
  });

  it('seuil des offres identique au CRM', () => {
    expect(SEUIL_OFFRES_PCT).toBe(50);
  });
});
