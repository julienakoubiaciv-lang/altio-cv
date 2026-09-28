/**
 * EntretienEcole — `/entretien` en version école.
 *
 * Le simulateur d'entretien de l'élève est dans son espace étudiant (onglet
 * « M'entraîner »), où sa progression est suivie par l'école (cf.
 * lib/espaceEtudiant.js). Un élève y est envoyé directement ; un membre de
 * l'équipe voit où le trouver.
 */
import React, { useEffect } from 'react';
import { useUserContext } from '@/hooks/useUserContext';
import { urlEntrainement } from '@/lib/espaceEtudiant';

const FONT = "'Manrope', sans-serif";

export default function EntretienEcole() {
  const { isStudent, loading } = useUserContext();
  const url = urlEntrainement();

  useEffect(() => {
    if (!loading && isStudent) window.location.replace(url);
  }, [loading, isStudent, url]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: FONT, background: '#F7F8FA' }}>
      <div style={{ maxWidth: 440, textAlign: 'center', background: '#fff', border: '1px solid #ECEDF1', borderRadius: 18, padding: '32px 28px' }}>
        <h1 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px', color: '#0B1020' }}>Le simulateur d’entretien est dans l’espace étudiant</h1>
        <p style={{ fontSize: 13.5, lineHeight: 1.55, color: '#3A4156', margin: '0 0 20px' }}>
          Les élèves s’entraînent dans leur espace, onglet « M’entraîner » : leur progression y est enregistrée et
          suivie par l’école.
        </p>
        <a
          href={url}
          style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 10, background: '#1539B7', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
        >
          Ouvrir « M’entraîner »
        </a>
      </div>
    </div>
  );
}
