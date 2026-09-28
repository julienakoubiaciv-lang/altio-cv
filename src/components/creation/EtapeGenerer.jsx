/**
 * Étape 3 de l'assistant « Nouveau CV » : adapter à une offre (une de ses
 * candidatures suivies, une annonce collée, ou aucune), récapitulatif, et
 * génération.
 */
import React from 'react';
import { annonceUtilisable, motsClesAnnonce, recapitulatif } from '@/lib/creationCv';
import { Bouton, C, Carte, FONT, Pastille, champ } from './ui';

function Option({ checked, onChange, children }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, cursor: 'pointer', fontSize: 14, color: C.ink,
      border: `${checked ? 2 : 1}px solid ${checked ? C.blue : C.rule}`, background: checked ? C.blueSoft : C.card }}>
      <input type="radio" name="offre" checked={checked} onChange={onChange} style={{ width: 18, height: 18, accentColor: 'var(--altio-blue)', flexShrink: 0 }} />
      <span>{children}</span>
    </label>
  );
}

export default function EtapeGenerer({ s, maj, offres, onGenerer, onRetour, enCours, erreur, quota, isMobile }) {
  const choix = s.offre?.id ?? (s.offre ? 'collee' : 'aucune');
  const cles = s.offre && annonceUtilisable(s.offre.texte) ? motsClesAnnonce(s.offre.texte) : [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: 20, alignItems: 'start' }}>
      <Carte titre="Une offre en tête ?" badge={<Pastille ton="gris">Facultatif</Pastille>} aide="Ton CV reprend alors le vocabulaire de l'annonce, sans rien inventer.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {offres.map((o) => (
            <Option key={o.id} checked={choix === o.id} onChange={() => maj({ offre: o })}>
              <strong>{o.titre}</strong><br /><span style={{ fontSize: 12, color: C.mute }}>Une de tes candidatures</span>
            </Option>
          ))}
          <Option checked={choix === 'collee'} onChange={() => maj({ offre: { id: null, titre: '', texte: s.offre && !s.offre.id ? s.offre.texte : '' } })}>Coller une annonce</Option>
          {choix === 'collee' && (
            <textarea rows={6} aria-label="Texte de l'annonce" placeholder="Colle ici le texte de l'offre…" value={s.offre?.texte || ''}
              onChange={(e) => maj({ offre: { id: null, titre: '', texte: e.target.value } })} style={{ ...champ, resize: 'vertical' }} />
          )}
          <Option checked={choix === 'aucune'} onChange={() => maj({ offre: null })}>Pas d'offre précise : un CV général</Option>
        </div>
        {cles.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.ink2, marginBottom: 6 }}>Mots-clés repérés dans l'annonce</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{cles.map((k) => <Pastille key={k}>{k}</Pastille>)}</div>
          </div>
        )}
      </Carte>

      <Carte titre="Prêt à générer">
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: C.ink }}>
          {recapitulatif(s).map((l) => (
            <li key={l} style={{ display: 'flex', gap: 10 }}><span aria-hidden="true" style={{ color: C.ok, fontWeight: 800 }}>✓</span><span>{l}</span></li>
          ))}
        </ul>
        <Bouton onClick={onGenerer} disabled={enCours} style={{ width: '100%', minHeight: 56, fontSize: 16, marginTop: 18 }}>
          {enCours ? 'Génération en cours… (environ 20 secondes)' : '✨ Générer mon CV'}
        </Bouton>
        {erreur && <p role="alert" style={{ margin: '10px 0 0', fontSize: 13, color: '#B91C1C', lineHeight: 1.5 }}>{erreur}</p>}
        <p style={{ margin: '10px 0 0', fontSize: 12, color: C.mute, textAlign: 'center' }}>
          Utilise 1 génération IA{quota ? ` · occupe 1 de tes ${quota.max} emplacements de CV (${quota.restants} libre${quota.restants > 1 ? 's' : ''})` : ''}
        </p>
        <button type="button" onClick={onRetour} disabled={enCours}
          style={{ marginTop: 14, background: 'none', border: 'none', color: C.blue, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: FONT, padding: 0 }}>
          ← Modifier mes infos
        </button>
      </Carte>
    </div>
  );
}
