/**
 * NouveauCvEcole — `/generate` en version école : l'élève a l'assistant en
 * trois étapes (GenerateEcole), l'équipe garde le formulaire complet
 * (Generate : profil IA, secteur, candidat, en masse).
 */
import React, { lazy, Suspense } from 'react';
import { useUserContext } from '@/hooks/useUserContext';

const Generate = lazy(() => import('./Generate.jsx'));
const GenerateEcole = lazy(() => import('./GenerateEcole.jsx'));

export default function NouveauCvEcole() {
  const { isStudent, loading } = useUserContext();
  if (loading) return null;
  return <Suspense fallback={null}>{isStudent ? <GenerateEcole /> : <Generate />}</Suspense>;
}
