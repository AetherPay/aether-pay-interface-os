# AetherOS - Super Admin Dashboard

Bienvenue dans le cockpit de **AetherPay**, la plateforme de paiement de nouvelle génération.

## 🚀 Lancement Rapide (Local)

Pour faire tourner le dashboard sur votre machine :

### 1. Prérequis
- **Node.js** (v18 ou supérieur)
- **pnpm** (recommandé) ou **npm**

### 2. Installation
```bash
# Installer les dépendances
pnpm install
```

### 3. Exécution
```bash
# Lancer le serveur de développement
pnpm dev
```
L'application sera disponible sur `http://localhost:3000`.

## 🔐 Accès Sécurisé (Mode Démo)

L'application simule un flux d'authentification Zero-Trust.

- **Email** : `admin@aetherpay.io`
- **Password** : `password`
- **MFA** : Saisissez n'importe quel code à 6 chiffres (ex: `123456`)

## 🛠 Fonctionnalités Implémentées
- ✅ **Tableau de bord global** avec graphiques temps réel.
- ✅ **Gestion des risques** (Sentinel AI) et quarantaine.
- ✅ **Trésorerie & FX** avec ajustement des spreads.
- ✅ **Compliance & KYB** avec pipeline visuel.
- ✅ **Logistique (AetherShip)** avec heatmap de livraison.
- ✅ **Sécurité Matrix** (RBAC) pour la gestion des rôles.
- ✅ **Support & Proxy** pour l'assistance marchande.

## 📂 Structure du Code
- `/components` : Modules de l'interface (Vues par département).
- `/services` : Logique de données (Mock API).
- `/types` : Définitions TypeScript pour la cohérence globale.

---
*Propriété de AetherPay Group. Usage interne uniquement.*