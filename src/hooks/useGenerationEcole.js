/**
 * useGenerationEcole — génère le CV de l'assistant « Nouveau CV » (version
 * école) : consigne et saisie (lib/creationCv.js), appel à claude-proxy
 * (qui applique côté serveur le plafond de CV de l'élève), enregistrement
 * dans l'historique (cv_history, donc visible dans l'espace étudiant), puis
 * ouverture de l'éditeur sur CE CV avec le guide de complétude.
 */
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PALETTES, saveEditorState } from '@/lib/cvData';
import { renderCVFromData } from '@/lib/cvTemplates';
import { getSector, SECTOR_GENERAL } from '@/lib/cvSectors';
import { saveHistory } from '@/lib/historySync';
import { callClaude, QuotaError } from '@/lib/claudeClient';
import { track } from '@/lib/monitoring';
import { annonceUtilisable, completerCvData, consigneCreation, lireJsonCv, saisieEnTexte } from '@/lib/creationCv';

/** Contenu du message : le CV importé (PDF ou image) s'il y en a un, puis la saisie et l'annonce. */
function contenuMessage(s, avecAnnonce) {
  const texte = [
    s.fichier ? 'Voici le CV actuel de l’élève (pièce jointe), puis ce qu’il a vérifié ou ajouté :' : 'Voici ce que l’élève a saisi :',
    saisieEnTexte(s),
    avecAnnonce ? `\n--- ANNONCE VISÉE ---\n${s.offre.texte.slice(0, 3000)}` : '',
  ].join('\n');
  if (!s.fichier) return texte;
  const piece = s.fichier.type === 'image'
    ? { type: 'image', source: { type: 'base64', media_type: s.fichier.mediaType, data: s.fichier.base64 } }
    : { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: s.fichier.base64 } };
  return [piece, { type: 'text', text: texte }];
}

export function useGenerationEcole() {
  const navigate = useNavigate();
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  const generer = useCallback(async (s) => {
    if (enCours) return;
    setEnCours(true);
    setErreur('');
    const avecAnnonce = Boolean(s.offre && annonceUtilisable(s.offre.texte));
    try {
      const reponse = await callClaude({
        action: 'generate_cv',
        model: 'claude-sonnet-4-5',
        max_tokens: 4000,
        system: consigneCreation({ avecAnnonce }),
        messages: [{ role: 'user', content: contenuMessage(s, avecAnnonce) }],
        metadata: { source: 'assistant_ecole', depart: s.depart, hasAnnonce: avecAnnonce },
      });
      const brut = lireJsonCv((reponse.content || []).map((b) => b.text || '').join(''));
      const cvData = { ...completerCvData(brut, s), sector: SECTOR_GENERAL };
      const secteur = getSector(SECTOR_GENERAL);
      const html = renderCVFromData(cvData, PALETTES[0], secteur.sectionOrder, secteur.templateHint, secteur.sidebarOrder);
      const nom = [cvData.prenom, cvData.nom].filter(Boolean).join(' ') || 'Mon CV';
      const id = await saveHistory(nom, html, cvData, s.identite?.formation || '');
      saveEditorState({ generatedHTML: html, cvData, palette: PALETTES[0], croppedPhoto: '', logoDataURL: '', name: nom, templateId: secteur.templateHint });
      track('cv_generated', { source: 'assistant_ecole', depart: s.depart, hasAnnonce: avecAnnonce });
      navigate(`/editor/${id}`, { state: { nouveauCv: true } });
    } catch (e) {
      setErreur(
        e instanceof QuotaError
          ? 'Tu as atteint ton nombre de CV ou tes générations du jour. Modifie un CV existant, ou demande à ton école.'
          : e?.message || 'La génération n’a pas abouti. Réessaie dans un instant.'
      );
      setEnCours(false);
    }
  }, [enCours, navigate]);

  return { generer, enCours, erreur };
}
