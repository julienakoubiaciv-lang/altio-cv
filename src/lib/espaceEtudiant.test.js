import { describe, expect, it } from 'vitest';
import { URL_ESPACE_ETUDIANT_DEFAUT, modulesAccueil, urlCarriere, urlEntrainement, urlEspaceEtudiant } from './espaceEtudiant';

describe('espaceEtudiant', () => {
  it('adresse de l’espace : variable d’environnement sans « / » final, sinon le défaut', () => {
    expect(urlEspaceEtudiant('https://espace.test/')).toBe('https://espace.test');
    expect(urlEspaceEtudiant('  ')).toBe(URL_ESPACE_ETUDIANT_DEFAUT);
    expect(urlEspaceEtudiant(undefined)).toBe(URL_ESPACE_ETUDIANT_DEFAUT);
  });

  it('M’entraîner : onglet de l’espace Carrière', () => {
    expect(urlEntrainement('https://espace.test')).toBe('https://espace.test/candidat?tab=entrainement');
    expect(urlCarriere('https://espace.test/')).toBe('https://espace.test/candidat?tab=carriere');
  });

  it('préparation : sans simulateur ni progression gamifiée en version école, inchangée en grand public', () => {
    const modules = [{ route: '/parcours' }, { route: '/entretien' }, { route: '/diagnostic' }, { route: '/entretien-oral' }, { route: '/lettre' }];
    expect(modulesAccueil(modules, true).map((m) => m.route)).toEqual(['/entretien-oral', '/lettre']);
    expect(modulesAccueil(modules, false)).toBe(modules);
  });
});
