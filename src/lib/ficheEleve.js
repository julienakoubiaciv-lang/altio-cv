/**
 * ficheEleve — ce que l'assistant « Nouveau CV » (version école) lit dans la
 * base du CRM, sous la session de l'élève (RLS : il ne voit que sa fiche et
 * ses candidatures) :
 *   - identité et contact (`candidates`) — jamais la date de naissance ;
 *   - la formation suivie : celle de sa promotion (`cohort_members` →
 *     `cohorts` → `formations`, même lecture que l'espace étudiant), sinon
 *     la formation visée sur sa fiche ;
 *   - ses candidatures suivies avec le texte de l'offre
 *     (`candidate_opportunites.texte_offre`), pour adapter le CV à l'une
 *     d'elles.
 * Toute erreur de lecture laisse le champ vide : l'élève le remplit lui-même.
 */
import { supabase, supabaseReady } from './supabase';

async function formationDeLEleve(candidateId, targetFormationId) {
  const promo = await supabase
    .from('cohort_members')
    .select('cohorts(formations(title))')
    .eq('candidate_id', candidateId)
    .limit(1);
  const viaPromo = promo.data?.[0]?.cohorts?.formations?.title;
  if (viaPromo) return viaPromo;
  if (!targetFormationId) return '';
  const visee = await supabase.from('formations').select('title').eq('id', targetFormationId).maybeSingle();
  return visee.data?.title || '';
}

/** `{ fiche, formation, offres }` pour l'élève connecté, ou `null` hors version école / sans fiche. */
export async function chargerFicheEleve(userId) {
  if (!supabaseReady || !supabase || !userId) return null;
  const { data: fiche } = await supabase
    .from('candidates')
    .select('id, first_name, last_name, email, phone, city, linkedin_url, target_formation_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (!fiche) return null;

  const [formation, opps] = await Promise.all([
    formationDeLEleve(fiche.id, fiche.target_formation_id).catch(() => ''),
    supabase
      .from('candidate_opportunites')
      .select('id, poste, entreprise_nom, texte_offre, statut')
      .eq('candidate_id', fiche.id)
      .not('texte_offre', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const offres = (opps.data || [])
    .filter((o) => (o.texte_offre || '').trim().length > 30 && o.statut !== 'refuse')
    .map((o) => ({
      id: o.id,
      titre: [o.poste, o.entreprise_nom].filter(Boolean).join(' · ') || 'Offre sans titre',
      texte: o.texte_offre,
    }));

  return { fiche, formation, offres };
}
