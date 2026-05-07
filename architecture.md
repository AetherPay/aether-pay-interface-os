# AetherPay Interface OS — Architecture

> Tableau de bord d'administration interne (Super Admin) SPA — React 19 + TypeScript + Vite
> Dernière mise à jour : 2026-03-26

---

## Qu'est-ce que ce projet ?

`aether-pay-interface-os` est le **panneau d'administration AetherOS** — l'outil interne utilisé par les équipes AetherPay (Risk, Treasury, Compliance, Ops, Engineering...) pour surveiller et piloter toute la plateforme. C'est distinct du dashboard marchand (`aether-pay-business`) qui est lui utilisé par les clients.

---

## Stack technique

| | Technologie | Version |
|---|---|---|
| UI | React | 19.2.4 |
| Langage | TypeScript | 5.8.2 |
| Build | Vite | 6.2.0 |
| Styling | Tailwind CSS (CDN) | — |
| Icônes | Lucide React | 0.563.0 |
| Charts | Recharts | 3.7.0 |
| Flow/Topology | @xyflow/react | 12.10.1 |
| Sankey Chart | @nivo/sankey | 0.99.0 |
| IA | @google/genai | 1.39.0 |

**Pas de :** Redux, Zustand, React Router, Auth0 (prévu mais pas intégré).

---

## Structure du projet

```
aether-pay-interface-os/
├── index.html              # Entrée HTML
├── index.tsx               # Entrée React — monte App en StrictMode
├── index.css               # CSS global + overrides React Flow
├── App.tsx                 # Shell principal — auth guard, routing, layout
├── types.ts                # Tous les types TypeScript du domaine
├── vite.config.ts          # Config Vite (port 5174, alias @/, GEMINI_API_KEY)
├── tsconfig.json           # Config TypeScript
├── .env                    # Variables d'environnement (non committé)
│
├── components/
│   ├── Sidebar.tsx             # Navigation par département (collapsible)
│   ├── Header.tsx              # Topbar — recherche, notifs, thème, profil
│   ├── AuthLogin.tsx           # Login 3 étapes : credentials → MFA → succès
│   ├── StatCard.tsx            # Card KPI réutilisable
│   ├── TransactionTable.tsx    # Tableau de transactions triable
│   ├── LiveFeed.tsx            # Fil d'activité temps réel
│   ├── MakerCheckerQueue.tsx   # File d'approbation maker/checker
│   ├── ArchitectureChecklist.tsx # Checklist de conformité architecture
│   │
│   ├── dashboard/              # Module Command Center
│   │   ├── DashboardView.tsx       # Router interne du module
│   │   ├── GlobalOverview.tsx      # Vue exécutive — KPIs + charts
│   │   ├── LiveTransactionMap.tsx  # Carte géo des flux (wrapper)
│   │   ├── ZoneFlux.tsx            # Diagramme Sankey des corridors
│   │   ├── AlertsHub.tsx           # Centre d'alertes et incidents
│   │   ├── ExecutiveReports.tsx    # Génération de rapports
│   │   └── live-map/               # Sous-module React Flow
│   │       ├── LiveTransactionMap.tsx  # Composant principal
│   │       ├── types.ts                # Types du flow
│   │       ├── constants.ts            # Données des nœuds/edges
│   │       ├── utils.ts                # Helpers layout
│   │       ├── nodes/
│   │       │   ├── GatewayNode.tsx     # Nœud passerelle de paiement
│   │       │   └── HubNode.tsx         # Nœud hub central
│   │       ├── edges/
│   │       │   └── LatencyEdge.tsx     # Edge coloré selon latence
│   │       ├── hooks/
│   │       │   ├── useGatewayHealth.ts     # Statut santé des gateways
│   │       │   ├── useGatewaySimulation.ts # Simulation de trafic
│   │       │   └── useMapLayout.ts         # Persistance positions nodes
│   │       └── components/
│   │           ├── DetailPanel.tsx     # Panel détail au clic d'un node
│   │           ├── KpiBar.tsx          # Barre KPI au-dessus de la carte
│   │           └── Sparkline.tsx       # Mini-graphe RTT 24h
│   │
│   ├── risk/               # Module Risk & Fraud
│   │   ├── RiskView.tsx            # Router interne du module
│   │   ├── RiskRadar.tsx           # Heatmap de scores de risque
│   │   ├── FailureMonitor.tsx      # Monitoring des échecs
│   │   ├── RiskTransactionsList.tsx # Transactions à risque
│   │   ├── QuarantineCenter.tsx    # Transactions en quarantaine
│   │   ├── RuleEngine.tsx          # Config et test des règles
│   │   └── BlacklistManager.tsx    # Base intelligence + blacklists
│   │
│   ├── engineering/        # Module Engineering
│   │   ├── DevApiView.tsx          # Router interne du module
│   │   ├── ServiceGrid.tsx         # Grille santé des micro-services
│   │   ├── APIStats.tsx            # Stats et analytics API
│   │   ├── WebhookMonitor.tsx      # Monitoring webhooks
│   │   └── DeploymentLog.tsx       # Logs de déploiement
│   │
│   ├── FinanceView.tsx         # Module Treasury & Finance
│   ├── TreasuryView.tsx        # (sous-vue treasury)
│   ├── ComplianceView.tsx      # Module Compliance KYB/KYC/AML
│   ├── KYCView.tsx             # (sous-vue KYC)
│   ├── SupportView.tsx         # Module OPS & Support
│   ├── OpsCoreView.tsx         # (sous-vue OPS)
│   ├── AetherShipView.tsx      # Module Logistics (AetherShip)
│   ├── NetworkView.tsx         # Module Agent Network
│   ├── SystemAdminView.tsx     # Module Sécurité & Admin système
│   ├── UserManagement.tsx      # Gestion des utilisateurs/rôles
│   ├── ReportingView.tsx       # Reporting global
│   ├── SettingsView.tsx        # Paramètres système
│   └── ProfileView.tsx         # Profil utilisateur
│
├── constants/
│   ├── mapData.ts          # Données géographiques pour la Live Map
│   └── paymentMethods.tsx  # Liste des méthodes de paiement
│
├── hooks/
│   └── useApi.ts           # Hooks data fetching (useApi, usePolling, useMutation)
│
└── services/
    ├── api.ts              # Client REST + gestion token
    └── mockData.ts         # Données synthétiques réalistes (fallback)
```

---

## Authentification

Système simulé en mode démo (pas d'Auth0 intégré malgré les vars d'env prévues).

```
App.tsx
  │
  ├── localStorage('aetherpay:auth') === 'true' ?
  │       └── Non → <AuthLogin>
  │                     │
  │                     ├── Étape 1 : email + password (800ms simulation)
  │                     ├── Étape 2 : OTP 6 chiffres (n'importe quel code accepté)
  │                     └── Étape 3 : Succès → localStorage.setItem('aetherpay:auth', 'true')
  │
  └── Oui → App complète (dashboard)
```

**Credentials démo :** `admin@aetherpay.io` / `password`

Le token est stocké dans `localStorage('aetheros_token')` et injecté dans les appels API via `Authorization: Bearer <token>` + en-tête `X-Admin-Key`.

---

## Routage (sans React Router)

Même pattern que le projet business : `useState<ViewState>` dans `App.tsx`.

```typescript
// types.ts — union de toutes les vues possibles
type ViewState =
  | 'COMMAND_GLOBAL_OVERVIEW' | 'COMMAND_LIVE_MAP' | 'COMMAND_ZONE_FLUX'
  | 'COMMAND_ALERTS' | 'COMMAND_EXECUTIVE_REPORTS'
  | 'RISK_DASHBOARD' | 'RISK_FAILURES' | 'RISK_TRANSACTIONS'
  | 'RISK_QUARANTINE' | 'RISK_RULE_ENGINE' | 'RISK_BLACKLISTS'
  | 'TREASURY_OVERVIEW' | 'TREASURY_POOLS' | 'TREASURY_FX'
  | 'TREASURY_SETTLEMENT' | 'TREASURY_RECONCILIATION' | 'TREASURY_FORECAST'
  | 'COMPLIANCE_KYC_REVIEW' | 'COMPLIANCE_MERCHANT_STATUS'
  | 'COMPLIANCE_PEP_SANCTIONS' | 'COMPLIANCE_AML_MONITORING'
  | 'OPS_MERCHANT_DIRECTORY' | 'OPS_IMPERSONATION' | 'OPS_TICKET_HUB'
  | 'SHIP_DASHBOARD' | 'SHIP_HEATMAP' | 'SHIP_PARTNERS' | 'SHIP_INCIDENTS'
  | 'ENG_SERVICES_HEALTH' | 'ENG_API_ANALYTICS' | 'ENG_WEBHOOK_MONITOR'
  | 'SEC_USERS_ROLES' | 'SEC_AUTH_MFA' | 'SEC_MATRIX'
  | 'AGENT_NETWORK_OVERVIEW' | 'PROTOCOL_MAKER_CHECKER'
  | 'SETTINGS' | 'PROFILE' | 'CHECKLIST'
  // + 10 autres variantes...

// App.tsx — routing par préfixe
if (currentView.startsWith('COMMAND_')) return <DashboardView />
if (currentView.startsWith('RISK_'))    return <RiskView />
if (currentView.startsWith('TREASURY_')) return <TreasuryView />
// ...
```

`currentView` est passé à `DashboardView`, `RiskView`, etc. pour qu'ils affichent la bonne sous-vue.

---

## Modules & départements (8 modules)

| Module | Préfixe ViewState | Composant | Sous-vues |
|--------|------------------|-----------|-----------|
| Command Center | `COMMAND_` | `DashboardView` | GlobalOverview, LiveMap, ZoneFlux, AlertsHub, ExecutiveReports |
| Risk & Fraud | `RISK_` | `RiskView` | Radar, FailureMonitor, Transactions, Quarantine, RuleEngine, Blacklists |
| Treasury | `TREASURY_` | `TreasuryView` / `FinanceView` | Pools, FX, Settlement, Reconciliation, Forecast, Payouts |
| Compliance | `COMPLIANCE_` | `ComplianceView` | KYC Review, Merchant Status, PEP/Sanctions, AML, Audit, Reports |
| OPS & Support | `OPS_` | `SupportView` | Merchant Directory, Impersonation, Ticket Hub, AetherLink |
| Logistics | `SHIP_` | `AetherShipView` | Dashboard, Heatmap, Partners, Incidents |
| Engineering | `ENG_` | `DevApiView` | Services Health, API Analytics, Webhooks, Deployments |
| Sécurité | `SEC_` | `SystemAdminView` | Users/Roles, MFA, Matrix |

---

## Couche API & Services

```
Composant → useApi(fetcher) → services/api.ts → apiFetch() → fetch(Bearer + X-Admin-Key)
```

### `services/api.ts`

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// Groupes d'endpoints
dashboardApi  → getKPIs(), getFlux(), getRiskDashboard()
merchantsApi  → list(), get(), update(), suspend(), activate()
transactionsApi, complianceApi, ...
```

### `hooks/useApi.ts` — 3 hooks

```typescript
// Lecture ponctuelle
useApi<T>(fetcher, mockData?, deps?) → { data, loading, error, refetch }

// Lecture temps réel (polling)
usePolling<T>(fetcher, intervalMs = 5000, mockData?) → { data, loading, error, stop, start }

// Écriture
useMutation<T, P>(mutator) → { mutate(params), loading, error, data }
```

Si `VITE_USE_MOCK=true` → `services/mockData.ts` est utilisé à la place des appels API.

### `services/mockData.ts`

Données synthétiques réalistes pour tout le dashboard :
`generateTransactions()`, `mockFxRates`, `mockMerchants`, `mockAMLEvents`, `warRoomKPIs`, `mockSettlementQueue`, `mockForecastData`...

---

## Gestion d'état

| État | Où | Mécanisme |
|------|----|-----------|
| Authentifié | `App.tsx` + localStorage | `useState` + `localStorage('aetherpay:auth')` |
| Vue active | `App.tsx` | `useState<ViewState>` |
| Mode impersonation | `App.tsx` | `useState<boolean>` (bandeau rouge) |
| Thème dark/light | `Header.tsx` + localStorage | `useState` + `localStorage('aether_dark_mode')` |
| Sidebar ouverte | `App.tsx` | `useState<boolean>` |
| Données API | Chaque composant | `useApi` / `usePolling` |
| Positions nodes Live Map | `live-map/hooks/useMapLayout.ts` | localStorage |

---

## Visualisations spéciales

### Live Transaction Map (`dashboard/live-map/`)
Carte topologique des flux de paiement en temps réel construite avec **React Flow** (`@xyflow/react`).
- Nœuds `GatewayNode` (passerelles régionales) + `HubNode` (hub central AetherPay)
- Edges `LatencyEdge` colorés selon la latence (vert < 100ms, orange < 300ms, rouge > 300ms)
- Simulation de trafic via `useGatewaySimulation`
- Panel de détail au clic d'un nœud
- Sparkline RTT 24h par gateway
- Positions des nœuds persistées en localStorage

### Zone Flux (`dashboard/ZoneFlux.tsx`)
Diagramme **Sankey** (via `@nivo/sankey`) montrant la distribution des volumes financiers entre corridors géographiques.

### Cortex AI (`Insights` dans GlobalOverview)
Insights générés par **Google Gemini** (`@google/genai`) — détection d'anomalies, recommandations.

---

## Types principaux (`types.ts`)

```typescript
// Entités métier
interface Transaction  { id, amount, currency, status, customerName, provider, riskScore, type, urgency }
interface Merchant     { id, name, industry, tier: 'VIP'|'REGULAR', status, healthScore, gtv24h, country }
interface KYCApplication { id, status, type: 'BUSINESS'|'INDIVIDUAL', riskLevel, documentsCount }
interface Service      { id, name, version, status: 'HEALTHY'|'DEGRADED'|'DOWN', cpu, memory, uptime }
interface FXRate       { pair, midRate, spreadPct, trend, lastUpdate }
interface AMLEvent     { timestamp, merchantName, riskScore, triggerReason, status }
interface AuditLog     { timestamp, actor, action, target, ip, status: 'SUCCESS'|'FAILURE' }
interface User         { id, name, email, role: Role, status, mfaEnabled, lastLogin }
interface Agent        { id, name, locationName, status, floatBalance, currency, coordinates }
interface MakerCheckerTask { type, priority, createdAt, maker, payload, status: 'PENDING'|'APPROVED'|'REJECTED' }

// UI
interface KPI           { id, label, value, subValue, change, trend, alert?, status? }
interface CortexInsight { title, content, impact: 'POSITIVE'|'NEUTRAL'|'NEGATIVE', actionLabel }
interface FeedItem      { type, message, time, severity, department }

// 25+ rôles
type Role = 'SUPER_ADMIN' | 'CCO' | 'FRAUD_STRATEGY_LEAD' | 'FRAUD_INVESTIGATOR'
          | 'AML_OFFICER' | 'KYB_ANALYST_SENIOR' | 'TREASURER' | 'FOREX_OPERATOR'
          | 'PAYOUT_SUPERVISOR' | 'SETTLEMENT_CLERK' | ... // + 15 autres
```

---

## Variables d'environnement

```bash
VITE_API_URL=http://localhost:4000/api          # URL du backend REST
VITE_USE_MOCK=true                              # true = données mock (défaut dev)
VITE_ADMIN_KEY=<hash>                           # En-tête X-Admin-Key pour l'API
GEMINI_API_KEY=...                              # Pour les insights Cortex AI
# Prévus mais pas encore intégrés :
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=...
VITE_AUTH0_AUDIENCE=https://api.aetherpay.io
```

---

## Démarrage

```bash
npm install       # ou pnpm install
# Configurer .env
npm run dev       # http://localhost:5174
npm run build     # Build production → dist/
```

**Credentials démo :** `admin@aetherpay.io` / `password` (MFA : n'importe quel code 6 chiffres)

---

## Différences clés vs `aether-pay-business`

| | `aether-pay-business` | `aether-pay-interface-os` |
|---|---|---|
| Utilisateurs | Marchands clients | Équipes internes AetherPay |
| Auth | Clerk OAuth + backend sync | Simulation locale (demo) |
| Port dev | 5173 | 5174 |
| Routing | Type `Page` | Type `ViewState` (préfixes dept.) |
| Modules | 24 pages métier | 8 départements + 30+ sous-vues |
| Visualisations | Recharts standard | React Flow + Nivo Sankey + Recharts |
| IA | Gemini (Insights) | Gemini (Cortex) |
| Temps réel | Non | Oui (usePolling) |
| Impersonation | Non | Oui (accès marchands) |
| Token stockage | Mémoire (apiClient.ts) | localStorage |
