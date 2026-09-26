/**
 * appMode — une seule base de code, deux déploiements.
 *
 *   - `public` (défaut) : cv.altio-wave.com — grand public, inscription libre,
 *     abonnements Stripe, base Supabase GRAND PUBLIC ;
 *   - `ecole` : version réservée à l'école — connexion avec le compte du CRM
 *     (équipe ou élève), inscription fermée, pas de tarifs, base Supabase du
 *     CRM. Les deux bases ne se mélangent jamais : aucun compte grand public
 *     n'entre dans la base des élèves.
 *
 * Réglé au build par `VITE_APP_MODE=ecole` (cf. docs/DEPLOIEMENT-DEUX-BASES.md).
 */

export const APP_MODE = import.meta.env.VITE_APP_MODE === 'ecole' ? 'ecole' : 'public';
export const IS_ECOLE = APP_MODE === 'ecole';

/**
 * Rôles staff du CRM (colonne `profiles.role`, valeurs de l'enum `user_role`)
 * qui ont l'accès COMPLET au générateur : direction (`admin`, `super_admin`,
 * `owner`), chargés et managers d'admission (`conseiller`), chargés et
 * managers relation entreprise (`relation_entreprise`). La pédagogie, les
 * intervenants, la comptabilité et le marketing n'y ont pas accès.
 */
export const ROLES_ACCES_COMPLET = ['owner', 'super_admin', 'admin', 'conseiller', 'relation_entreprise'];

export function staffAccesComplet(role) {
  return ROLES_ACCES_COMPLET.includes(role);
}

/**
 * Accès à la version école, à partir du contexte `get_user_context()` :
 *   - 'chargement' : on ne sait pas encore ;
 *   - 'anonyme'    : pas connecté → écran de connexion ;
 *   - 'ok'         : élève, ou membre de l'équipe avec un rôle autorisé ;
 *   - 'refuse'     : connecté mais sans droit (autre rôle staff, compte
 *                    inconnu du CRM).
 */
export function accesEcole({ loading, loggedIn, kind, role }) {
  if (loading) return 'chargement';
  if (!loggedIn) return 'anonyme';
  if (kind === 'student') return 'ok';
  if (kind === 'staff' && staffAccesComplet(role)) return 'ok';
  return 'refuse';
}
