/**
 * GuideCompletude — bandeau de l'éditeur en version école : la complétude
 * du CV (mêmes règles que l'espace étudiant), le repère des 50 % qui
 * débloquent les offres de l'école, et les 3 actions qui la font le plus
 * monter ; chacune ouvre la rubrique de l'éditeur où la faire.
 * Juste après la génération (`nouveauCv`), il dit aussi que le CV est prêt
 * et déjà visible dans l'espace étudiant.
 */
import React from 'react';
import { SEUIL_OFFRES_PCT } from '@/lib/completudeEcole';

const FONT = "'Manrope', system-ui, sans-serif";

export default function GuideCompletude({ guide, nouveauCv, onAller }) {
  const { pct, actions } = guide;
  const atteint = pct >= SEUIL_OFFRES_PCT;
  const couleur = atteint ? 'var(--altio-green)' : '#B45309';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', padding: '10px 20px', background: 'var(--altio-card)', borderBottom: '1px solid var(--altio-line)', fontFamily: FONT }}>
      {nouveauCv && (
        <div style={{ padding: '6px 12px', borderRadius: 10, background: 'var(--altio-green-soft)', color: 'var(--altio-green)', fontSize: 13, fontWeight: 800 }}>
          Ton CV est prêt 🎉 Il est déjà dans ton espace étudiant.
        </div>
      )}
      <div style={{ minWidth: 220 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--altio-ink)' }}>Complétude</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: couleur }}>{pct} %</span>
        </div>
        <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Complétude du CV"
          style={{ position: 'relative', height: 8, borderRadius: 99, background: 'var(--altio-card2)', marginTop: 4 }}>
          <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: atteint ? 'var(--altio-green)' : '#F59E0B', transition: 'width .4s ease' }} />
          <div style={{ position: 'absolute', top: -3, left: `${SEUIL_OFFRES_PCT}%`, width: 2, height: 14, borderRadius: 2, background: 'var(--altio-ink)', opacity: 0.6 }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--altio-ink2)', marginTop: 4 }}>
          {atteint ? 'Les offres de ton école sont débloquées.' : `Encore ${SEUIL_OFFRES_PCT - pct} % pour débloquer les offres de ton école.`}
        </div>
      </div>
      {actions.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: 1 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--altio-mute)' }}>Ce qui rapporte le plus</span>
          {actions.map((a) => (
            <button key={a.id} type="button" onClick={() => onAller(a.rubrique)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 40, padding: '0 12px', borderRadius: 10, border: '1px solid var(--altio-line)', background: 'var(--altio-card)', color: 'var(--altio-ink)', fontSize: 13, fontWeight: 700, fontFamily: FONT, cursor: 'pointer' }}>
              {a.texte}
              <span style={{ padding: '2px 8px', borderRadius: 99, background: 'var(--altio-blue-soft)', color: 'var(--altio-blue)', fontSize: 12, fontWeight: 800 }}>+{a.gain} %</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
