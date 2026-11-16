/**
 * Étape 2 de l'assistant « Nouveau CV » : vérifier ce qui vient de la fiche
 * élève (identité, contact, formation), choisir le poste visé, et — en
 * partant de zéro — raconter son parcours (BlocParcours).
 */
import React from 'react';
import BlocParcours from './BlocParcours';
import { C, Carte, FONT, Pastille, champ } from './ui';

function Champ({ id, label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label htmlFor={id} style={{ display: 'block', fontSize: 13, fontWeight: 800, color: C.ink, marginBottom: 6 }}>{label}</label>
      <input id={id} type={type} style={champ} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export default function EtapeInfos({ s, maj, suggestions, depuisFiche, isMobile }) {
  const id = s.identite;
  const majId = (patch) => maj({ identite: { ...id, ...patch } });
  const col2 = isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))';

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row' }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Carte titre="Toi" badge={depuisFiche ? <Pastille ton="vert">Depuis ton espace étudiant</Pastille> : null}>
          <div style={{ display: 'grid', gridTemplateColumns: col2, gap: 12 }}>
            <Champ id="prenom" label="Prénom" value={id.prenom} onChange={(v) => majId({ prenom: v })} />
            <Champ id="nom" label="Nom" value={id.nom} onChange={(v) => majId({ nom: v })} />
            <Champ id="email" label="Email" type="email" value={id.email} onChange={(v) => majId({ email: v })} />
            <Champ id="tel" label="Téléphone" type="tel" value={id.telephone} onChange={(v) => majId({ telephone: v })} />
            <Champ id="ville" label="Ville" value={id.ville} onChange={(v) => majId({ ville: v })} />
            <Champ id="linkedin" label="LinkedIn (facultatif)" value={id.linkedin} placeholder="linkedin.com/in/…" onChange={(v) => majId({ linkedin: v })} />
          </div>
          <div style={{ marginTop: 12 }}>
            <Champ id="formation" label="Ta formation (placée en tête de tes formations)" value={id.formation} placeholder="Intitulé de ta formation en alternance" onChange={(v) => majId({ formation: v })} />
          </div>
        </Carte>

        <Carte titre="Le poste que tu vises" aide="Il devient le titre de ton CV. Choisis une idée ou écris le tien.">
          <input aria-label="Poste visé" style={champ} value={s.poste} placeholder="Ex. Assistante marketing digital" onChange={(e) => maj({ poste: e.target.value })} />
          {suggestions.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {suggestions.map((p) => {
                const on = s.poste === p;
                return (
                  <button key={p} type="button" aria-pressed={on} onClick={() => maj({ poste: p })}
                    style={{ minHeight: 36, padding: '0 12px', borderRadius: 99, fontSize: 13, fontWeight: 700, fontFamily: FONT, cursor: 'pointer',
                      border: `1px solid ${on ? C.blue : C.rule}`, background: on ? C.blueSoft : C.card, color: on ? C.blue : C.ink2 }}>
                    {p}
                  </button>
                );
              })}
            </div>
          )}
        </Carte>

        {s.depart === 'zero' ? (
          <BlocParcours s={s} maj={maj} isMobile={isMobile} />
        ) : (
          <Carte titre="Ton parcours" aide={`On reprend les expériences, diplômes, compétences et langues de ${s.fichier?.name || 'ton CV importé'}. Tu pourras tout compléter dans l'éditeur.`} />
        )}
      </div>

      <aside style={{ width: isMobile ? '100%' : 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {s.depart === 'zero' && (
          <Carte style={{ padding: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>Tu pars de zéro ? Pas de souci.</div>
            <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 13, lineHeight: 1.6, color: C.ink2 }}>
              <li>Un job d'été montre ta fiabilité autant qu'un stage.</li>
              <li>Deux ou trois missions par expérience suffisent.</li>
              <li>Tu pourras tout retoucher dans l'éditeur.</li>
            </ul>
          </Carte>
        )}
        <Carte style={{ padding: 18, background: C.blueSoft }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>L'IA reformule, elle n'invente rien</div>
          <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.55, color: C.ink2 }}>Elle met en forme ce que tu écris, avec des verbes d'action. Aucune expérience ni compétence n'est ajoutée à ta place.</p>
        </Carte>
      </aside>
    </div>
  );
}
