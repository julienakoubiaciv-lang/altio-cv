/**
 * Étape 1 de l'assistant « Nouveau CV » : partir d'un CV existant (import
 * PDF ou photo) ou de zéro (questions guidées à l'étape suivante).
 */
import React, { useRef, useState } from 'react';
import { C, FONT, Pastille } from './ui';

const TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

function lireFichier(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = () => reject(new Error('Lecture impossible'));
    r.readAsDataURL(file);
  });
}

function Choix({ actif, onChoisir, emoji, titre, texte, children }) {
  return (
    <label style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12, padding: 24, borderRadius: 16, background: C.card, cursor: 'pointer',
      border: `2px solid ${actif ? C.blue : C.rule}`, boxShadow: actif ? `0 0 0 4px ${C.blueSoft}` : 'none' }}>
      <input type="radio" name="depart" checked={actif} onChange={onChoisir}
        style={{ position: 'absolute', top: 22, right: 22, width: 20, height: 20, accentColor: 'var(--altio-blue)' }} />
      <span style={{ fontSize: 28 }}>{emoji}</span>
      <span style={{ fontSize: 19, fontWeight: 800, color: C.ink }}>{titre}</span>
      <span style={{ fontSize: 14, color: C.ink2, lineHeight: 1.5 }}>{texte}</span>
      {children}
    </label>
  );
}

export default function EtapeDepart({ s, maj, quota, isMobile }) {
  const input = useRef(null);
  const [erreur, setErreur] = useState('');

  const importer = async (file) => {
    setErreur('');
    if (!file) return;
    if (!TYPES.includes(file.type)) { setErreur('Format non pris en charge : utilise un PDF, un JPG ou un PNG.'); return; }
    try {
      const base64 = await lireFichier(file);
      maj({ depart: 'import', fichier: { name: file.name, type: file.type.startsWith('image/') ? 'image' : 'pdf', mediaType: file.type, base64 } });
    } catch {
      setErreur('Impossible de lire ce fichier. Réessaie avec un autre.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: isMobile ? 30 : 40, fontWeight: 800, letterSpacing: '-1px', color: C.ink }}>Nouveau CV</h1>
        <p style={{ margin: '8px 0 0', fontSize: 16, color: C.ink2, lineHeight: 1.5 }}>Trois étapes, environ cinq minutes. Tu pourras tout modifier ensuite.</p>
      </div>

      <div role="radiogroup" aria-label="Point de départ" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: 18 }}>
        <Choix actif={s.depart === 'import'} onChoisir={() => maj({ depart: 'import' })} emoji="📄" titre="J'ai déjà un CV"
          texte="Importe-le en PDF ou en photo : on reprend tout ce qu'il contient, puis tu complètes.">
          <button type="button"
            onClick={(e) => { e.preventDefault(); maj({ depart: 'import' }); input.current?.click(); }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); importer(e.dataTransfer.files?.[0]); }}
            style={{ marginTop: 6, minHeight: 84, borderRadius: 12, border: `2px dashed ${s.fichier ? C.ok : C.rule}`, background: s.fichier ? C.okSoft : 'transparent',
              color: s.fichier ? C.ok : C.mute, fontSize: 13, fontWeight: 700, fontFamily: FONT, cursor: 'pointer', padding: 12 }}>
            {s.fichier ? `✓ ${s.fichier.name} · cliquer pour changer` : 'Glisse ton CV ici ou clique · PDF, JPG, PNG'}
          </button>
          <input ref={input} type="file" accept={TYPES.join(',')} style={{ display: 'none' }}
            onChange={(e) => { importer(e.target.files?.[0]); e.target.value = ''; }} />
          {erreur && <span role="alert" style={{ fontSize: 13, color: '#B91C1C' }}>{erreur}</span>}
        </Choix>
        <Choix actif={s.depart === 'zero'} onChoisir={() => maj({ depart: 'zero', fichier: null })} emoji="✨" titre="Je pars de zéro"
          texte="On te pose quelques questions simples. Pas d'expérience ? Stages, jobs d'été, bénévolat et projets d'école comptent aussi.">
          <span style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['Expériences', 'Diplômes', 'Langues', 'Centres d’intérêt'].map((t) => <Pastille key={t}>{t}</Pastille>)}
          </span>
        </Choix>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderRadius: 14, background: C.card, border: `1px solid ${C.rule}`, flexWrap: 'wrap' }}>
        <span aria-hidden="true" style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 99, background: C.okSoft, color: C.ok, display: 'grid', placeItems: 'center', fontWeight: 800 }}>✓</span>
        <div style={{ flex: 1, minWidth: 220, fontSize: 14, lineHeight: 1.5, color: C.ink }}>
          <strong>Déjà rempli depuis ton espace étudiant :</strong> ton identité, tes coordonnées et ta formation. Tu les vérifies à l'étape suivante.
        </div>
        {quota && (
          <span style={{ fontSize: 13, color: C.mute, whiteSpace: 'nowrap' }}>CV restants : <strong style={{ color: C.ink }}>{quota.restants} sur {quota.max}</strong></span>
        )}
      </div>
    </div>
  );
}
