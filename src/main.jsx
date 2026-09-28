import './lib/migrateStorage.js'; // migration talia_* → altio_* (avant tout le reste)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './styles/altio-theme.css';
import { initMonitoring } from './lib/monitoring';
import { consumeOrgInviteFromURL } from './lib/orgAccess';
import { IS_ECOLE } from './lib/appMode';

// Version école : palette alignée sur l'espace étudiant du CRM (altio-theme.css).
if (IS_ECOLE) document.documentElement.dataset.appMode = 'ecole';

// Initialise Sentry + PostHog (no-op si les env vars sont absentes)
initMonitoring();

// Capte un éventuel lien d'invitation école (?org_invite=…) dès le chargement ;
// il sera consommé après connexion (useOrg).
consumeOrgInviteFromURL();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
