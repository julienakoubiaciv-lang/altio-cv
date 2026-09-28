/**
 * Primitives visuelles de l'assistant « Nouveau CV » (version école) :
 * palette (variables --altio-*, alignées sur l'espace étudiant en version
 * école), en-tête avec retour à l'espace et barre d'étapes, carte, boutons.
 */
import React from 'react';
import EnergyBar from '@/components/EnergyBar';
import { urlCarriere } from '@/lib/espaceEtudiant';

export const C = {
  blue: 'var(--altio-blue)',
  blueHover: 'var(--altio-blue-hover)',
  blueSoft: 'var(--altio-blue-soft)',
  ink: 'var(--altio-ink)',
  ink2: 'var(--altio-ink2)',
  mute: 'var(--altio-mute)',
  rule: 'var(--altio-line)',
  bg: 'var(--altio-bg)',
  card: 'var(--altio-card)',
  card2: 'var(--altio-card2)',
  ok: 'var(--altio-green)',
  okSoft: 'var(--altio-green-soft)',
};
export const FONT = "'Manrope', system-ui, sans-serif";

export const champ = {
  width: '100%', boxSizing: 'border-box', minHeight: 44, padding: '10px 12px', borderRadius: 10,
  border: `1px solid ${C.rule}`, background: C.card, color: C.ink, fontSize: 14, fontFamily: FONT,
};

export function Carte({ titre, aide, badge, children, style }) {
  return (
    <section style={{ background: C.card, border: `1px solid ${C.rule}`, borderRadius: 16, padding: 22, ...style }}>
      {(titre || badge) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          {titre && <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.ink }}>{titre}</h2>}
          {badge}
        </div>
      )}
      {aide && <p style={{ margin: '4px 0 14px', fontSize: 13, color: C.mute, lineHeight: 1.5 }}>{aide}</p>}
      {!aide && titre && <div style={{ height: 12 }} />}
      {children}
    </section>
  );
}

export function Pastille({ children, ton = 'bleu' }) {
  const tons = {
    bleu: { background: C.blueSoft, color: C.blue },
    vert: { background: C.okSoft, color: C.ok },
    gris: { background: C.card2, color: C.mute },
  };
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700, ...tons[ton] }}>{children}</span>;
}

export function Bouton({ children, onClick, disabled, secondaire, type = 'button', style }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48, padding: '0 24px',
        borderRadius: 12, fontSize: 15, fontWeight: 800, fontFamily: FONT, cursor: disabled ? 'not-allowed' : 'pointer',
        border: secondaire ? `1px solid ${C.rule}` : 'none', background: secondaire ? C.card : C.blue,
        color: secondaire ? C.blue : '#fff', opacity: disabled ? 0.55 : 1, ...style,
      }}>
      {children}
    </button>
  );
}

const ETAPES = ['Ton point de départ', 'Tes infos', 'Générer'];

export function EnteteAssistant({ etape, isMobile }) {
  return (
    <>
      <header style={{ height: 64, boxSizing: 'border-box', padding: isMobile ? '0 14px' : '0 40px', display: 'flex', alignItems: 'center', gap: 12, background: C.card, borderBottom: `1px solid ${C.rule}` }}>
        <span style={{ fontSize: 17, fontWeight: 800, color: C.ink }}>Altio <span style={{ color: C.blue }}>CV</span></span>
        <a href={urlCarriere()} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 40, padding: '0 12px', borderRadius: 10, border: `1px solid ${C.rule}`, background: C.card, color: C.blue, fontSize: 13, fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap' }}>
          ← {isMobile ? 'Mon espace' : 'Mon espace étudiant'}
        </a>
        <div style={{ flex: 1 }} />
        <EnergyBar variant="pill" />
      </header>
      <ol aria-label="Étapes" style={{ listStyle: 'none', margin: '28px auto 0', padding: isMobile ? '0 14px' : 0, maxWidth: 1040, display: 'flex', gap: 10 }}>
        {ETAPES.map((label, i) => {
          const n = i + 1;
          const couleur = n < etape ? C.ok : n === etape ? C.blue : C.mute;
          return (
            <li key={label} aria-current={n === etape ? 'step' : undefined} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, fontWeight: 800, color: couleur }}>
              <div style={{ height: 5, borderRadius: 3, background: n <= etape ? couleur : C.rule }} />
              {n} · {label}
            </li>
          );
        })}
      </ol>
    </>
  );
}
