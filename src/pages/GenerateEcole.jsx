/**
 * GenerateEcole — « Nouveau CV » pour un élève, en version école.
 *
 * Remplace, pour l'élève seulement, le formulaire de /generate pensé pour un
 * conseiller (profil IA, secteur, genre, en masse, CV source obligatoire).
 * Trois étapes :
 *   1. point de départ : importer son CV, ou partir de zéro ;
 *   2. ses infos : identité, contact et formation déjà remplis depuis sa
 *      fiche (lib/ficheEleve.js), poste visé, et son parcours s'il part de
 *      zéro ;
 *   3. une offre visée (facultatif), récapitulatif, génération
 *      (hooks/useGenerationEcole.js), puis l'éditeur ouvert sur ce CV avec
 *      le guide de complétude.
 * Règles : lib/creationCv.js. L'équipe garde le formulaire de /generate.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { useUserContext } from '@/hooks/useUserContext';
import { useIsMobile } from '@/hooks/useWindowWidth';
import { useGenerationEcole } from '@/hooks/useGenerationEcole';
import { chargerFicheEleve } from '@/lib/ficheEleve';
import { FORMATIONS, POSTES } from '@/lib/cvData';
import { blocageEtape, diplomeVide, experienceVide, prefillDepuisFiche, suggestionsPostes } from '@/lib/creationCv';
import { Bouton, C, EnteteAssistant, FONT } from '@/components/creation/ui';
import EtapeDepart from '@/components/creation/EtapeDepart';
import EtapeInfos from '@/components/creation/EtapeInfos';
import EtapeGenerer from '@/components/creation/EtapeGenerer';

const ETAT_INITIAL = {
  depart: null,
  fichier: null,
  identite: prefillDepuisFiche(null, ''),
  poste: '',
  experiences: [experienceVide()],
  sansExperience: false,
  diplomes: [diplomeVide()],
  langues: [],
  interets: [],
  offre: null,
};

export default function GenerateEcole() {
  const { user } = useAuth();
  const { maxCv, cvCount } = useUserContext();
  const isMobile = useIsMobile();
  const { generer, enCours, erreur } = useGenerationEcole();
  const [etape, setEtape] = useState(1);
  const [s, setS] = useState(ETAT_INITIAL);
  const [offres, setOffres] = useState([]);
  const [depuisFiche, setDepuisFiche] = useState(false);
  const [bloque, setBloque] = useState('');

  const maj = (patch) => { setBloque(''); setS((prev) => ({ ...prev, ...patch })); };

  // Fiche élève : pré-remplit sans écraser ce que l'élève aurait déjà tapé.
  useEffect(() => {
    let actif = true;
    chargerFicheEleve(user?.id).then((r) => {
      if (!actif || !r) return;
      const pre = prefillDepuisFiche(r.fiche, r.formation);
      setS((prev) => ({ ...prev, identite: Object.fromEntries(Object.entries(pre).map(([k, v]) => [k, prev.identite[k] || v])) }));
      setOffres(r.offres);
      setDepuisFiche(true);
    }).catch(() => {});
    return () => { actif = false; };
  }, [user?.id]);

  const suggestions = useMemo(() => suggestionsPostes(s.identite.formation, FORMATIONS, POSTES), [s.identite.formation]);
  const quota = typeof maxCv === 'number' && typeof cvCount === 'number'
    ? { max: maxCv, restants: Math.max(0, maxCv - cvCount) }
    : null;

  const suivant = () => {
    const raison = blocageEtape(etape, s);
    if (raison) { setBloque(raison); return; }
    setBloque('');
    setEtape((e) => Math.min(3, e + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const precedent = () => { setBloque(''); setEtape((e) => Math.max(1, e - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, color: C.ink }}>
      <EnteteAssistant etape={etape} isMobile={isMobile} />
      <main style={{ maxWidth: etape === 1 ? 880 : 1040, margin: '0 auto', padding: isMobile ? '22px 14px 60px' : '28px 0 80px' }}>
        {quota && quota.restants === 0 ? (
          <div role="alert" style={{ padding: 20, borderRadius: 14, background: C.card, border: `1px solid ${C.rule}`, fontSize: 15, lineHeight: 1.55 }}>
            Tu as utilisé tes {quota.max} emplacements de CV. Modifie un CV existant depuis « Mes CV », ou demande à ton école d'en ouvrir un autre.
          </div>
        ) : (
          <>
            {etape === 1 && <EtapeDepart s={s} maj={maj} quota={quota} isMobile={isMobile} />}
            {etape === 2 && <EtapeInfos s={s} maj={maj} suggestions={suggestions} depuisFiche={depuisFiche} isMobile={isMobile} />}
            {etape === 3 && (
              <EtapeGenerer s={s} maj={maj} offres={offres} quota={quota} isMobile={isMobile}
                onGenerer={() => generer(s)} onRetour={precedent} enCours={enCours} erreur={erreur} />
            )}

            {etape < 3 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
                {etape > 1 ? <Bouton secondaire onClick={precedent}>← Retour</Bouton> : <span />}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {bloque && <span role="alert" style={{ fontSize: 13, color: '#B91C1C' }}>{bloque}</span>}
                  <Bouton onClick={suivant}>Continuer</Bouton>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
