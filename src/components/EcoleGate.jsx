/**
 * EcoleGate — barrière de la version école (VITE_APP_MODE=ecole).
 *
 * Cette version tourne sur la base du CRM : on s'y connecte avec son compte
 * CRM (équipe) ou de l'espace étudiant (élève), et personne d'autre n'y
 * entre. L'inscription y est fermée (cf. Auth.jsx) ; cette barrière couvre le
 * reste :
 *   - non connecté → écran de connexion (seules les pages légales restent
 *     lisibles) ;
 *   - connecté sans droit (autre rôle du CRM, compte inconnu) → écran
 *     « accès réservé » avec déconnexion ;
 *   - élève, direction, admission, relation entreprise → l'application.
 * Règle de décision : lib/appMode.js::accesEcole (testée).
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.jsx';
import { useUserContext } from '@/hooks/useUserContext';
import { accesEcole } from '@/lib/appMode';

const PAGES_LIBRES = ['/auth', '/confidentialite', '/mentions-legales', '/cgu'];
const FONT = "'Manrope', sans-serif";

export default function EcoleGate({ children, fallback }) {
  const { user, loading: authLoading, signOut } = useAuth();
  const ctx = useUserContext();
  const { pathname } = useLocation();

  if (PAGES_LIBRES.includes(pathname)) return children;

  const acces = accesEcole({ loading: authLoading || ctx.loading, loggedIn: !!user, kind: ctx.kind, role: ctx.role });
  if (acces === 'chargement') return fallback;
  if (acces === 'anonyme') return <Navigate to="/auth" replace />;
  if (acces === 'ok') return children;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: FONT, background: '#F7F8FA' }}>
      <div style={{ maxWidth: 420, textAlign: 'center', background: '#fff', border: '1px solid #ECEDF1', borderRadius: 18, padding: '32px 28px' }}>
        <div style={{ fontSize: 34, marginBottom: 10 }}>🔒</div>
        <h1 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px', color: '#0B1020' }}>Accès réservé</h1>
        <p style={{ fontSize: 13.5, lineHeight: 1.55, color: '#3A4156', margin: '0 0 20px' }}>
          Ce générateur est réservé aux élèves de l’école et aux équipes direction, admission et relation
          entreprise. Si tu penses que c’est une erreur, contacte ton école.
        </p>
        <button
          type="button"
          onClick={() => signOut()}
          style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#1539B7', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
