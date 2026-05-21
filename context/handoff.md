# Instructions de reprise - Antigravity Maison

## État au 21 mai 2026 - 16h40

### ✅ COMPLET
- Backend Laravel 11.x API
- Auth Sanctum + RBAC
- 28 migrations + 26 modèles
- API CRM/Ventes/Projets/Dashboards
- 13 maquettes Stitch (desktop + mobile)

### 🎯 PROCHAINE ÉTAPE : Frontend React/Vite

#### Tâche 7 : Setup frontend

1. Initialiser Vite + React dans `/code/frontend` :
   ```bash
   cd code
   npm create vite@latest frontend -- --template react
   cd frontend
   npm install
   ```

2. Installer les dépendances essentielles :
   ```bash
   npm install react-router-dom axios
   npm install @tanstack/react-query
   npm install tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

3. Configurer Tailwind selon le design system :
   - Primary: `#1D4ED8`
   - Background: `#F8FAFC`
   - Radius: 8-12px
   - Font: Inter

4. Créer la structure :
   ```
   /src
     /components
       /common
       /dashboards
       /crm
       /sales
       /projects
     /layouts
     /pages
     /services
       api.js
     /hooks
     /utils
     App.jsx
     main.jsx
   ```

5. Configurer Axios pour l'API Laravel :
   - Base URL: `http://localhost:8000/api`
   - Auth header avec Sanctum token
   - Interceptors pour erreurs

6. Implémenter l'authentification :
   - Page login
   - Context auth
   - Protected routes
   - Stockage token

7. Tester la connexion API :
   - Login
   - GET `/api/dashboard/director`
   - Afficher les données

---

## 🎨 Priorité d'implémentation des écrans

1. Login + Auth
2. Layout principal (sidebar/topbar)
3. Dashboard Directeur
4. Dashboard Commercial
5. Liste Clients
6. Fiche Client
7. Autres dashboards
8. Devis
9. Projets
10. Factures

---

## 📂 Ressources disponibles

- **Maquettes Stitch** : `projects/30868049086750529`
- **IDs Stitch pour référence visuelle** : Référencés précisément dans `/context/decisions.md` (Section 8)
- **API endpoints documentés** : Référencés dans `/context/core-flows.md` et `/context/antigravity-config.md`
- **Design system** : `/docs/design-system.md` (ou configuration YAML dans `/context/decisions.md`)

---

## 🏠 Comment reprendre à la maison

1. Lis `/context/AGENTS.md`
2. Lis `/context/handoff.md` (ce fichier)
3. Lis `/context/state.md`
4. Lance le backend : `cd code/backend && php artisan serve`
5. Démarre la Tâche 7 dans `/code/frontend` !
