# Déploiement : une base de code, deux versions

altio-cv est déployé **deux fois**, à partir du même dépôt :

| Version | Adresse | Base Supabase | Qui s'y connecte |
|---|---|---|---|
| **École** | `cv-ecole.altio-wave.com` | la base du **CRM** (projet `zxiroikfhrwsyzgqflzb`) | l'équipe (direction, admission, relation entreprise) et les élèves, avec **leur compte CRM / espace étudiant** |
| **Grand public** | `cv.altio-wave.com` | une base **séparée**, propre au grand public | particuliers et coachs, qui créent leur compte sur place |

Les deux bases ne partagent rien : aucun compte grand public n'entre dans la base des élèves.

Seules les **variables d'environnement** changent d'une version à l'autre.

## Version école

Dans Cloudflare → Workers & Pages → créer un second Worker (par ex. `altio-cv-ecole`) relié au même dépôt, avec :

| Réglage (Settings → Build) | Valeur |
|---|---|
| Build command | `npm install --legacy-peer-deps && npm run build -- --mode ecole` |
| Deploy command | `npx wrangler deploy --name altio-cv-ecole` |

**Aucune variable à saisir dans Cloudflare** : `--mode ecole` fait lire à Vite le fichier `.env.ecole` du dépôt, qui contient `VITE_APP_MODE=ecole`, l'adresse et la clé publique (anon) du projet CRM. Ces deux valeurs sont publiques (elles sont de toute façon dans le JavaScript servi au navigateur) ; la protection vient de la RLS. Si des variables `VITE_*` traînent dans le Worker, les supprimer : une variable de build Cloudflare l'emporte sur le fichier.

Puis rattacher le domaine `cv-ecole.altio-wave.com` à ce Worker.

Dans Supabase, projet **CRM** (`zxiroikfhrwsyzgqflzb`, pas le projet grand public) → Authentication → URL Configuration : ajouter `https://cv-ecole.altio-wave.com/**` aux **Redirect URLs**.

Ce que fait `VITE_APP_MODE=ecole` (cf. `src/lib/appMode.js`) :

- **inscription fermée** : l'écran de connexion n'a ni onglet « Inscription » ni « Continuer sans compte » ;
- **connexion obligatoire** (`src/components/EcoleGate.jsx`) : un visiteur non connecté est renvoyé vers la connexion ;
- **accès** : élèves, et staff dont le rôle CRM (`profiles.role`) est `admin` / `super_admin` / `owner` (direction), `conseiller` (admission) ou `relation_entreprise` (CRE). Les autres rôles du CRM (pédagogie, intervenants, comptabilité, marketing) voient un écran « Accès réservé » ;
- **pas de tarifs** : `/pricing` renvoie à l'accueil, et la fenêtre de limite atteinte invite à demander à l'école plutôt qu'à s'abonner.

Les élèves gardent leur plafond de CV (3 par défaut, réglable sur leur fiche CRM, champ `max_cv`). La fonction IA `claude-proxy` du CRM applique déjà ce plafond côté serveur.

## Version grand public

Le Worker existant (`altio-cv`) avec :

| Variable | Valeur |
|---|---|
| `VITE_APP_MODE` | *(absente)* ou `public` |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | le **nouveau** projet Supabase grand public |
| `VITE_STRIPE_PRICE_PERSONAL` / `VITE_STRIPE_PRICE_COWORK` | identifiants de prix Stripe |

Préparer le nouveau projet Supabase :

1. Créer le projet (offre gratuite possible au départ ; attention, un projet gratuit inactif une semaine est mis en pause).
2. Appliquer `supabase_migration.sql`, puis les fichiers de `supabase/migrations/` **dans l'ordre des noms**.
3. Déployer les fonctions `create-checkout` et `stripe-webhook`, avec leurs secrets Stripe.
4. Authentication → URL Configuration : `https://cv.altio-wave.com` en Site URL.

### ⚠️ À faire avant d'ouvrir la version grand public : l'IA

`supabase/functions/claude-proxy` est aujourd'hui une **copie exacte** de celle du CRM. Elle n'ouvre l'IA qu'aux comptes que `get_user_context()` reconnaît comme **staff** ou **élève** du CRM, et répond `403 forbidden_no_access` à tous les autres. Un client grand public (offres Personnel, Cowork) n'a donc **aucune fonction IA**, en dehors du mode démo.

Pour la version grand public, il faut une variante de `claude-proxy` qui autorise un compte selon son **abonnement** (`subscriptions`, `check_quota`, énergie) plutôt que selon son rattachement au CRM, avec sa propre clé API Anthropic en secret. Tant que ce n'est pas fait, ne pas diriger de clients payants vers `cv.altio-wave.com`.
