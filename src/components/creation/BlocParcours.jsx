/**
 * Étape 2, quand l'élève part de zéro : expériences, diplômes, langues et
 * centres d'intérêt. Tout ce qu'il écrit est repris tel quel ; l'IA ne fait
 * que le mettre en forme.
 */
import React, { useState } from 'react';
import { diplomeVide, experienceVide } from '@/lib/creationCv';
import { Bouton, C, Carte, FONT, champ } from './ui';

const LANGUES = ['Anglais', 'Espagnol', 'Allemand', 'Italien', 'Arabe', 'Portugais'];
const INTERETS = ['Sport', 'Musique', 'Photographie', 'Voyages', 'Lecture', 'Bénévolat', 'Jeux vidéo', 'Cuisine'];

function Libelle({ htmlFor, children }) {
  return <label htmlFor={htmlFor} style={{ display: 'block', fontSize: 13, fontWeight: 800, color: C.ink, marginBottom: 6 }}>{children}</label>;
}

function Puces({ options, choisis, onChange, ajoutLabel }) {
  const [libre, setLibre] = useState('');
  const basculer = (v) => onChange(choisis.includes(v) ? choisis.filter((x) => x !== v) : [...choisis, v]);
  const ajouter = () => { const v = libre.trim(); if (v && !choisis.includes(v)) onChange([...choisis, v]); setLibre(''); };
  const toutes = [...new Set([...choisis, ...options])];
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {toutes.map((v) => {
          const on = choisis.includes(v);
          return (
            <button key={v} type="button" aria-pressed={on} onClick={() => basculer(v)}
              style={{ minHeight: 36, padding: '0 12px', borderRadius: 99, fontSize: 13, fontWeight: 700, fontFamily: FONT, cursor: 'pointer',
                border: `1px ${on ? 'solid' : 'dashed'} ${on ? C.blue : C.rule}`, background: on ? C.blue : 'transparent', color: on ? '#fff' : C.ink2 }}>
              {on ? v : `+ ${v}`}
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <input value={libre} onChange={(e) => setLibre(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ajouter(); } }}
          placeholder={ajoutLabel} aria-label={ajoutLabel} style={{ ...champ, minHeight: 40 }} />
        <Bouton secondaire onClick={ajouter} style={{ minHeight: 40, padding: '0 14px', fontSize: 13 }}>Ajouter</Bouton>
      </div>
    </div>
  );
}

export default function BlocParcours({ s, maj, isMobile }) {
  const majListe = (cle, i, patch) => maj({ [cle]: s[cle].map((x, j) => (j === i ? { ...x, ...patch } : x)) });
  const retirer = (cle, i) => maj({ [cle]: s[cle].filter((_, j) => j !== i) });
  const col = isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))';

  return (
    <>
      <Carte titre="Tes expériences" aide="Stages, jobs d'été, missions d'intérim, bénévolat, projets d'école : tout compte. Écris simplement, l'IA reformule.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {s.experiences.map((e, i) => (
            <div key={i} style={{ border: `1px solid ${C.rule}`, borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: col, gap: 10 }}>
                <div><Libelle htmlFor={`xp-poste-${i}`}>Ce que tu faisais</Libelle><input id={`xp-poste-${i}`} style={champ} value={e.poste} placeholder="Vendeuse, animateur, stagiaire…" onChange={(ev) => majListe('experiences', i, { poste: ev.target.value })} /></div>
                <div><Libelle htmlFor={`xp-lieu-${i}`}>Où</Libelle><input id={`xp-lieu-${i}`} style={champ} value={e.lieu} placeholder="Entreprise, ville" onChange={(ev) => majListe('experiences', i, { lieu: ev.target.value })} /></div>
                <div><Libelle htmlFor={`xp-date-${i}`}>Quand</Libelle><input id={`xp-date-${i}`} style={champ} value={e.periode} placeholder="Juillet – août 2025" onChange={(ev) => majListe('experiences', i, { periode: ev.target.value })} /></div>
              </div>
              <div>
                <Libelle htmlFor={`xp-missions-${i}`}>En quelques mots, tes missions</Libelle>
                <textarea id={`xp-missions-${i}`} rows={2} style={{ ...champ, resize: 'vertical' }} value={e.missions} placeholder="conseil clients, mise en rayon, caisse…" onChange={(ev) => majListe('experiences', i, { missions: ev.target.value })} />
              </div>
              {s.experiences.length > 1 && (
                <button type="button" onClick={() => retirer('experiences', i)} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', color: '#B91C1C', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>Retirer</button>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
          <Bouton secondaire onClick={() => maj({ experiences: [...s.experiences, experienceVide()], sansExperience: false })} style={{ minHeight: 44, fontSize: 14 }}>+ Ajouter une expérience</Bouton>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.ink2, cursor: 'pointer' }}>
            <input type="checkbox" checked={s.sansExperience} onChange={(e) => maj({ sansExperience: e.target.checked })} style={{ width: 18, height: 18, accentColor: 'var(--altio-blue)' }} />
            Je n'ai encore aucune expérience
          </label>
        </div>
      </Carte>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
        <Carte titre="Tes diplômes" aide="Avant ta formation actuelle (bac, BTS…).">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {s.diplomes.map((d, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
                <input aria-label="Diplôme" style={champ} value={d.titre} placeholder="Bac STMG" onChange={(ev) => majListe('diplomes', i, { titre: ev.target.value })} />
                <input aria-label="Année" style={champ} value={d.annee} placeholder="2024" onChange={(ev) => majListe('diplomes', i, { annee: ev.target.value })} />
              </div>
            ))}
          </div>
          <Bouton secondaire onClick={() => maj({ diplomes: [...s.diplomes, diplomeVide()] })} style={{ minHeight: 44, fontSize: 14, marginTop: 10 }}>+ Ajouter un diplôme</Bouton>
        </Carte>
        <Carte titre="Langues et centres d'intérêt" aide="Clique pour ajouter, ou écris le tien. Précise ton niveau (ex. « Anglais B2 »).">
          <Puces options={LANGUES} choisis={s.langues} onChange={(v) => maj({ langues: v })} ajoutLabel="Autre langue" />
          <div style={{ height: 14 }} />
          <Puces options={INTERETS} choisis={s.interets} onChange={(v) => maj({ interets: v })} ajoutLabel="Autre centre d'intérêt" />
        </Carte>
      </div>
    </>
  );
}
