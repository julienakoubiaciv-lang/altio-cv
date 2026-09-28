/**
 * AccueilEcole — accueil de la version école (VITE_APP_MODE=ecole).
 *
 * En version école, le générateur est l'ATELIER de l'espace étudiant du CRM :
 * on y vient pour ses CV et ses outils de candidature ; le suivi, la jauge
 * « Prêt pour l'alternance », les candidatures et l'entraînement vivent dans
 * l'espace étudiant (onglets « Ma carrière »). D'où :
 *   - « Mes CV » en tête, avec la complétude calculée comme dans l'espace
 *     (lib/completudeEcole.js) et le repère du seuil des offres ;
 *   - les outils de candidature (adapter à une offre, lettre, oral, test) ;
 *   - pas de niveau, d'XP ni de score d'employabilité : une seule jauge,
 *     celle de l'espace.
 * La version grand public garde son accueil (Home.jsx).
 */
import React from 'react';
import EnergyBar from '@/components/EnergyBar';
import { SEUIL_OFFRES_PCT, completudeCv } from '@/lib/completudeEcole';
import { urlCarriere } from '@/lib/espaceEtudiant';

const C = {
  blue: 'var(--altio-blue)',
  blueSoft: 'var(--altio-blue-soft)',
  ink: 'var(--altio-ink)',
  ink2: 'var(--altio-ink2)',
  mute: 'var(--altio-mute)',
  rule: 'var(--altio-line)',
  card: 'var(--altio-card)',
  track: 'var(--altio-card2)',
  ok: 'var(--altio-green)',
  warn: '#B45309',
};
const FONT = "'Manrope', system-ui, sans-serif";
const CARTE = { background: C.card, border: `1px solid ${C.rule}`, borderRadius: 16, boxShadow: '0 4px 18px rgba(11,22,56,.05)' };

/** Nombre de CV montrés sur l'accueil ; le reste est dans « Mes CV ». */
const CV_ACCUEIL = 3;

const OUTILS = [
  { route: '/analyse', emoji: '🔍', titre: 'Adapter mon CV à une offre', desc: 'Colle l’annonce : mots-clés manquants et score de correspondance.' },
  { route: '/lettre', emoji: '✉️', titre: 'Lettre de motivation', desc: 'Lettre, mail de relance ou de remerciement, à partir de ton CV.' },
  { route: '/entretien-oral', emoji: '🗣️', titre: 'Entretien à l’oral', desc: 'Réponds à voix haute, le coach IA te fait un retour.' },
  { route: '/test-recrutement', emoji: '🧩', titre: 'Test de recrutement', desc: 'Aptitudes et mises en situation, adaptés à l’annonce.' },
];

function CarteCv({ cv, onModify, isMobile }) {
  const { pct, conseils } = completudeCv(cv);
  const atteint = pct >= SEUIL_OFFRES_PCT;
  return (
    <div style={{ ...CARTE, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {cv.favorite ? '⭐ ' : ''}{cv.name || 'CV sans titre'}
        </div>
        {cv.date && <div style={{ fontSize: 12, color: C.mute, marginTop: 2 }}>Modifié le {String(cv.date).split(' ')[0]}</div>}
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}>
          <span style={{ color: C.mute }}>Complétude</span>
          <span style={{ color: atteint ? C.ok : C.warn }}>{pct} %{atteint ? '' : ` · ${SEUIL_OFFRES_PCT} % pour les offres`}</span>
        </div>
        <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Complétude du CV ${cv.name || ''}`}
          style={{ position: 'relative', height: 8, background: C.track, borderRadius: 99, marginTop: 6 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: atteint ? C.ok : '#F59E0B', borderRadius: 99 }} />
          <div style={{ position: 'absolute', top: -3, left: `${SEUIL_OFFRES_PCT}%`, width: 2, height: 14, background: C.ink, opacity: 0.6, borderRadius: 2 }} />
        </div>
        {conseils.length > 0 && (
          <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 12, lineHeight: 1.55, color: C.ink2 }}>
            {conseils.map((c) => <li key={c}>{c}</li>)}
          </ul>
        )}
      </div>
      <button onClick={() => onModify(cv)}
        style={{ marginTop: 'auto', minHeight: isMobile ? 44 : 40, border: 'none', borderRadius: 10, background: C.blue, color: '#fff', fontSize: 13.5, fontWeight: 800, cursor: 'pointer', fontFamily: FONT }}>
        Modifier
      </button>
    </div>
  );
}

export default function AccueilEcole({ cvList, firstName, isStudent, isMobile, navigate, onModify, onVoirTout }) {
  const cvs = cvList.slice(0, CV_ACCUEIL);
  return (
    <div style={{ fontFamily: FONT }}>
      <div style={{ marginBottom: isMobile ? 16 : 22 }}>
        <h1 style={{ fontSize: isMobile ? 28 : 40, fontWeight: 800, color: C.ink, letterSpacing: '-1px', lineHeight: 1.05, margin: 0 }}>
          Bonjour{firstName ? ` ${firstName}` : ''} 👋
        </h1>
        <p style={{ fontSize: isMobile ? 13.5 : 15.5, color: C.ink2, marginTop: 8, lineHeight: 1.5, maxWidth: 560 }}>
          Tes CV et tes outils de candidature.
          {isStudent && <> Ton suivi et tes candidatures sont dans <a href={urlCarriere()} style={{ color: C.blue, fontWeight: 700 }}>ton espace étudiant</a>.</>}
        </p>
      </div>

      <div style={{ marginBottom: 22 }}><EnergyBar variant="card" /></div>

      <section style={{ marginBottom: 26 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: C.ink, margin: 0 }}>Mes CV</h2>
          {cvList.length > CV_ACCUEIL && (
            <button onClick={onVoirTout} style={{ background: 'none', border: 'none', color: C.blue, fontSize: 13.5, fontWeight: 800, cursor: 'pointer', fontFamily: FONT }}>
              Voir les {cvList.length} CV →
            </button>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
          {cvs.map((cv) => <CarteCv key={cv.id} cv={cv} onModify={onModify} isMobile={isMobile} />)}
          <button onClick={() => navigate('/generate')}
            style={{ minHeight: 170, border: `2px dashed ${C.rule}`, borderRadius: 16, background: 'transparent', color: C.blue, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', fontFamily: FONT, padding: 18 }}>
            <span style={{ width: 44, height: 44, borderRadius: 99, background: C.blueSoft, display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 800 }}>+</span>
            <span style={{ fontSize: 15, fontWeight: 800 }}>{cvs.length ? 'Créer un autre CV' : 'Créer mon premier CV'}</span>
            <span style={{ fontSize: 12, color: C.mute, maxWidth: 220, lineHeight: 1.5 }}>
              À partir de {SEUIL_OFFRES_PCT} % de complétude, les offres de ton école se débloquent.
            </span>
          </button>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 19, fontWeight: 800, color: C.ink, margin: '0 0 12px' }}>Outils pour candidater</h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
          {OUTILS.map((o) => (
            <button key={o.route} onClick={() => navigate(o.route)}
              style={{ ...CARTE, textAlign: 'left', padding: 16, cursor: 'pointer', fontFamily: FONT, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 22 }}>{o.emoji}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: C.ink, lineHeight: 1.25 }}>{o.titre}</span>
              <span style={{ fontSize: 12, color: C.mute, lineHeight: 1.45 }}>{o.desc}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
