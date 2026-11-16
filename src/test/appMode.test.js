import { describe, it, expect } from 'vitest';
import { accesEcole, staffAccesComplet } from '@/lib/appMode';

describe('staffAccesComplet', () => {
  it('ouvre la direction, l’admission et le CRE', () => {
    for (const r of ['admin', 'super_admin', 'owner', 'conseiller', 'relation_entreprise']) {
      expect(staffAccesComplet(r)).toBe(true);
    }
  });
  it('ferme les autres rôles du CRM', () => {
    for (const r of ['responsable_pedago', 'intervenant', 'marketing', 'comptable', 'gestion_contrats', null, undefined]) {
      expect(staffAccesComplet(r)).toBe(false);
    }
  });
});

describe('accesEcole', () => {
  const base = { loading: false, loggedIn: true, kind: 'guest', role: null };
  it('attend la réponse avant de décider', () => {
    expect(accesEcole({ ...base, loading: true })).toBe('chargement');
  });
  it('envoie un visiteur non connecté vers la connexion', () => {
    expect(accesEcole({ ...base, loggedIn: false })).toBe('anonyme');
  });
  it('laisse entrer un élève et un rôle autorisé', () => {
    expect(accesEcole({ ...base, kind: 'student' })).toBe('ok');
    expect(accesEcole({ ...base, kind: 'staff', role: 'relation_entreprise' })).toBe('ok');
  });
  it('refuse un autre rôle staff et un compte inconnu du CRM', () => {
    expect(accesEcole({ ...base, kind: 'staff', role: 'intervenant' })).toBe('refuse');
    expect(accesEcole({ ...base, kind: 'guest' })).toBe('refuse');
  });
});
