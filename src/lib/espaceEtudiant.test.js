import { describe, expect, it } from 'vitest';
import { URL_ESPACE_ETUDIANT_DEFAUT, modulesAccueil, urlEntrainement, urlEspaceEtudiant } from './espaceEtudiant';

describe('espaceEtudiant', () => {
  it('adresse de l’espace : variable d’environnement sans « / » final, sinon le défaut', () => {
    expect(urlEspaceEtudiant('https://espace.test/')).toBe('https://espace.test');
    expect(urlEspaceEtudiant('  ')).toBe(URL_ESPACE_ETUDIANT_DEFAUT);
    expect(urlEspaceEtudiant(undefined)).toBe(URL_ESPACE_ETUDIANT_DEFAUT);
  });

  it('M’entraîner : onglet de l’espace Carrière', () => {
    expect(urlEntrainement('https://espace.test')).toBe('https://espace.test/candidat?tab=entrainement');
  });

  it('accueil : sans le simulateur en version école, inchangé en grand public', () => {
    const modules = [{ route: '/entretien' }, { route: '/entretien-oral' }, { route: '/lettre' }];
    expect(modulesAccueil(modules, true).map((m) => m.route)).toEqual(['/entretien-oral', '/lettre']);
    expect(modulesAccueil(modules, false)).toBe(modules);
  });
});
