import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Environnement de l'assistant : élève connecté, fiche lue dans le CRM, pas d'appel IA.
vi.mock('@/hooks/useAuth.jsx', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }));
vi.mock('@/hooks/useUserContext', () => ({ useUserContext: () => ({ isStudent: true, maxCv: 3, cvCount: 1 }) }));
vi.mock('@/hooks/useWindowWidth', () => ({ useIsMobile: () => false }));
const generer = vi.fn();
vi.mock('@/hooks/useGenerationEcole', () => ({ useGenerationEcole: () => ({ generer, enCours: false, erreur: '' }) }));
vi.mock('@/components/EnergyBar', () => ({ default: () => null }));
vi.mock('@/lib/ficheEleve', () => ({
  chargerFicheEleve: () => Promise.resolve({
    fiche: { first_name: 'Léa', last_name: 'Martin', email: 'lea@x.fr', phone: '0600000000', city: 'Lyon', linkedin_url: null },
    formation: 'Bachelor – Chargé Marketing et Communication',
    offres: [{ id: 'o1', titre: 'Assistante marketing · Agence Nova', texte: 'Nous recherchons une alternante marketing : réseaux sociaux, Canva, reporting.' }],
  }),
}));

import GenerateEcole from './GenerateEcole';

describe('GenerateEcole — assistant « Nouveau CV » de l’élève', () => {
  beforeEach(() => { generer.mockClear(); window.scrollTo = vi.fn(); });

  it('parcours complet en partant de zéro : blocages, pré-remplissage, génération', async () => {
    render(<GenerateEcole />);
    expect(screen.getByText('CV restants :')).toBeTruthy();

    // Étape 1 : il faut choisir un point de départ.
    fireEvent.click(screen.getByText('Continuer'));
    expect(screen.getByRole('alert').textContent).toMatch(/point de départ/);
    fireEvent.click(screen.getByText('Je pars de zéro'));
    fireEvent.click(screen.getByText('Continuer'));

    // Étape 2 : identité et formation reprises de la fiche, idées de postes tirées de la formation.
    await waitFor(() => expect(screen.getByLabelText('Prénom').value).toBe('Léa'));
    expect(screen.getByLabelText(/Ta formation/).value).toMatch(/Marketing/);
    fireEvent.click(screen.getByText('Continuer'));
    expect(screen.getByRole('alert').textContent).toMatch(/poste/);
    fireEvent.change(screen.getByLabelText('Poste visé'), { target: { value: 'Assistante marketing' } });
    fireEvent.click(screen.getByText('Continuer'));
    expect(screen.getByRole('alert').textContent).toMatch(/aucune expérience/);
    fireEvent.change(screen.getByLabelText('Ce que tu faisais'), { target: { value: 'Vendeuse' } });
    fireEvent.click(screen.getByText('Continuer'));

    // Étape 3 : l'offre suivie par l'élève est proposée ; génération avec la saisie.
    fireEvent.click(screen.getByText('Assistante marketing · Agence Nova'));
    expect(screen.getByText(/Mots-clés repérés/)).toBeTruthy();
    fireEvent.click(screen.getByText('✨ Générer mon CV'));
    expect(generer).toHaveBeenCalledTimes(1);
    const s = generer.mock.calls[0][0];
    expect(s.identite.prenom).toBe('Léa');
    expect(s.poste).toBe('Assistante marketing');
    expect(s.experiences[0].poste).toBe('Vendeuse');
    expect(s.offre.id).toBe('o1');
  });
});
